import Phaser from "phaser";
import { announce, showDialog, showEnding, updateHud } from "./bus";
import { beginAmbient, chord, tone } from "./audio";
import { composeEnding } from "./ending";
import { touchInput } from "./input";
import {
  acknowledge,
  canEnter,
  complete,
  grant,
  remember,
  revise,
  SAVE_KEY,
  serialize,
  type Disposition,
  type GameState,
} from "./state";
import { roomById, type AbilityDef, type ExitDef, type MemoryDef, type RequestDef, type RoomDef } from "./world";

type InteractiveKind = "exit" | "request" | "memory" | "ability";
type InteractiveDef = ExitDef | RequestDef | MemoryDef | AbilityDef;

interface Interactive {
  kind: InteractiveKind;
  sprite: Phaser.Physics.Arcade.Sprite;
  def: InteractiveDef;
}

interface ShadowView {
  id: string;
  phrase: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  quieted: boolean;
}

const COLORS = {
  soft: { bg: 0x9eb8af, floor: 0xd3bea4, wall: 0x4e4054, accent: 0xff79bd },
  garden: { bg: 0x263e44, floor: 0x668477, wall: 0x24283c, accent: 0xffb6d8 },
  museum: { bg: 0x756b69, floor: 0xbca98e, wall: 0x403446, accent: 0xd7c1ff },
  archive: { bg: 0x171622, floor: 0x2b2634, wall: 0x71637a, accent: 0xc6a3e8 },
  infrastructure: { bg: 0x060a13, floor: 0x101b29, wall: 0x1e4653, accent: 0x66ead2 },
  answer: { bg: 0x070710, floor: 0x0d0d18, wall: 0x131322, accent: 0xf3ead9 },
} as const;

export class ExplorationScene extends Phaser.Scene {
  private state: GameState;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private echoKey!: Phaser.Input.Keyboard.Key;
  private holdKey!: Phaser.Input.Keyboard.Key;
  private interactives: Interactive[] = [];
  private shadows: ShadowView[] = [];
  private roomObjects: Phaser.GameObjects.GameObject[] = [];
  private obstacleObjects: Phaser.GameObjects.Rectangle[] = [];
  private busy = false;
  private revisionCooldown = 0;
  private heldUntil = 0;
  private touchInteractWasDown = false;
  private touchEchoWasDown = false;
  private lastPrompt = "";

  constructor(initialState: GameState) {
    super("exploration");
    this.state = initialState;
  }

  create(): void {
    this.createTextures();
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.echoKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.holdKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey.on("down", () => this.tryInteract());
    this.echoKey.on("down", () => this.useEcho());
    this.holdKey.on("down", () => this.useHold(this.time.now));
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", () => this.tryInteract());
    this.input.on("pointerdown", beginAmbient);

    this.player = this.physics.add.sprite(0, 0, "player");
    this.player.setCollideWorldBounds(true).setDepth(20);
    this.player.body!.setSize(22, 26).setOffset(5, 5);
    this.cameras.main.setZoom(1.05);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.renderRoom(roomById(this.state.roomId));
    beginAmbient();
  }

  update(time: number): void {
    if (!this.player?.body) return;
    this.revisionCooldown = Math.max(0, this.revisionCooldown - this.game.loop.delta);
    const speed = 178;
    const left = this.cursors.left.isDown || touchInput.left;
    const right = this.cursors.right.isDown || touchInput.right;
    const up = this.cursors.up.isDown || touchInput.up;
    const down = this.cursors.down.isDown || touchInput.down;
    const x = Number(right) - Number(left);
    const y = Number(down) - Number(up);
    const vector = new Phaser.Math.Vector2(x, y).normalize().scale(this.busy ? 0 : speed);
    this.player.setVelocity(vector.x, vector.y);

    if (touchInput.interact && !this.touchInteractWasDown) {
      this.tryInteract();
    }
    if (touchInput.echo && !this.touchEchoWasDown) {
      this.useEcho();
    }
    this.touchInteractWasDown = touchInput.interact;
    this.touchEchoWasDown = touchInput.echo;

    this.updateShadows(time);
    this.updatePrompt();
  }

  private createTextures(): void {
    const make = (key: string, draw: (graphics: Phaser.GameObjects.Graphics) => void, width = 48, height = 48): void => {
      if (this.textures.exists(key)) return;
      const graphics = this.add.graphics();
      draw(graphics);
      graphics.generateTexture(key, width, height);
      graphics.destroy();
    };
    make("player", (g) => {
      g.fillStyle(0xefe7d7).fillRoundedRect(8, 7, 26, 30, 8);
      g.fillStyle(0x252238).fillCircle(17, 19, 2).fillCircle(27, 19, 2);
      g.lineStyle(2, 0x72ead4).strokeCircle(21, 22, 17);
    }, 44, 46);
    make("request", (g) => {
      g.lineStyle(2, 0xffd69e).strokeCircle(24, 24, 14);
      g.fillStyle(0xffd69e).fillCircle(24, 24, 5);
      g.lineStyle(1, 0xffd69e, 0.5).strokeCircle(24, 24, 20);
    });
    make("memory", (g) => {
      g.fillStyle(0xd7c1ff, 0.3).fillTriangle(24, 3, 44, 42, 4, 42);
      g.lineStyle(2, 0xd7c1ff).strokeTriangle(24, 3, 44, 42, 4, 42);
    });
    make("ability", (g) => {
      g.fillStyle(0x72ead4, 0.25).fillCircle(24, 24, 21);
      g.lineStyle(2, 0x72ead4).strokeCircle(24, 24, 18).strokeCircle(24, 24, 8);
    });
    make("exit", (g) => {
      g.fillStyle(0x10101a).fillRect(8, 2, 32, 46);
      g.lineStyle(2, 0xf3ead9, 0.7).strokeRect(8, 2, 32, 46);
      g.fillStyle(0x72ead4).fillCircle(33, 25, 2);
    });
    make("shadow", (g) => {
      g.fillStyle(0x120f1b, 0.9).fillCircle(24, 25, 18);
      g.fillTriangle(8, 29, 40, 29, 24, 47);
      g.fillStyle(0xe99ac1, 0.65).fillCircle(18, 23, 2).fillCircle(30, 23, 2);
    });
  }

  private renderRoom(room: RoomDef): void {
    this.state = { ...this.state, roomId: room.id };
    this.persist();
    this.clearRoom();
    const palette = COLORS[room.theme];
    this.physics.world.setBounds(0, 0, room.width, room.height);
    this.cameras.main.setBounds(0, 0, room.width, room.height);
    this.cameras.main.setBackgroundColor(palette.bg);
    this.drawEnvironment(room);

    room.obstacles.forEach((rect) => {
      const obstacle = this.add.rectangle(rect.x, rect.y, rect.width, rect.height, palette.wall, 0.88).setDepth(3);
      obstacle.setStrokeStyle(2, palette.accent, room.theme === "infrastructure" ? 0.35 : 0.12);
      this.physics.add.existing(obstacle, true);
      this.physics.add.collider(this.player, obstacle);
      this.obstacleObjects.push(obstacle);
    });

    room.exits.forEach((def) => this.addInteractive("exit", def, "exit"));
    room.requests.forEach((def) => this.addInteractive("request", def, "request"));
    room.memories.forEach((def) => {
      if (!this.state.completed.includes(def.id)) this.addInteractive("memory", def, "memory");
    });
    room.abilities.forEach((def) => {
      if (!this.state.abilities.includes(def.id)) this.addInteractive("ability", def, "ability");
    });
    room.shadows.forEach((def) => this.addShadow(def.id, def.x, def.y, def.phrase));

    this.player.setPosition(room.spawn.x, room.spawn.y).setVelocity(0, 0);
    this.refreshHud("");
    announce(`${room.title} · ${room.subtitle}`);
    chord(room.theme === "infrastructure" ? [110, 164.8, 246.9] : [220, 277.2, 329.6]);
    if (room.id === "answer" && !this.state.endingSeen) {
      this.state = { ...this.state, endingSeen: true };
      this.persist();
      this.busy = true;
      this.time.delayedCall(1900, () => showEnding(composeEnding(this.state)));
    }
  }

  private clearRoom(): void {
    this.interactives.forEach(({ sprite }) => sprite.destroy());
    this.shadows.forEach(({ sprite }) => sprite.destroy());
    this.roomObjects.forEach((object) => object.destroy());
    this.obstacleObjects.forEach((object) => object.destroy());
    this.interactives = [];
    this.shadows = [];
    this.roomObjects = [];
    this.obstacleObjects = [];
  }

  private addInteractive(kind: InteractiveKind, def: InteractiveDef, texture: string): void {
    const sprite = this.physics.add.sprite(def.x, def.y, texture).setDepth(12);
    sprite.setImmovable(true);
    this.tweens.add({ targets: sprite, y: def.y - 7, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.interactives.push({ kind, sprite, def });
  }

  private addShadow(id: string, x: number, y: number, phrase: string): void {
    const quieted = this.state.quietedShadows.includes(id);
    const sprite = this.physics.add.sprite(x, y, "shadow").setDepth(15).setAlpha(quieted ? 0.3 : 0.9);
    sprite.setTint(quieted ? 0x72ead4 : 0xffffff);
    this.physics.add.overlap(this.player, sprite, () => this.onShadowCollision(id));
    this.shadows.push({ id, phrase, sprite, quieted });
  }

  private drawEnvironment(room: RoomDef): void {
    const palette = COLORS[room.theme];
    const floor = this.add.graphics().setDepth(0);
    floor.fillStyle(palette.floor).fillRect(0, 0, room.width, room.height);
    this.roomObjects.push(floor);

    const details = this.add.graphics().setDepth(1);
    if (room.theme === "soft") {
      details.fillStyle(0xe7d0b5).fillRect(90, 90, room.width - 180, room.height - 180);
      details.fillStyle(0xff67b8, 0.65).fillRect(0, 390, room.width, 18);
      details.fillStyle(0x59e4dc, 0.45).fillRect(0, 408, room.width, 8);
      for (let x = 120; x < room.width; x += 160) details.fillStyle(0xffffff, 0.12).fillCircle(x, 640, 4);
    } else if (room.theme === "garden") {
      for (let x = 80; x < room.width; x += 90) {
        for (let y = 100; y < room.height; y += 90) {
          const color = (x + y) % 180 === 0 ? 0xffb6d8 : 0x9cd5bc;
          details.fillStyle(color, 0.6).fillCircle(x + (y % 30), y, 5);
          details.lineStyle(1, 0x2e534a, 0.8).lineBetween(x, y + 5, x, y + 20);
        }
      }
      details.lineStyle(5, 0xe3d7b4, 0.25).strokeEllipse(800, 520, 430, 760);
    } else if (room.theme === "museum") {
      for (let x = 170; x < room.width; x += 270) {
        details.fillStyle(0xe3d1b5, 0.12).fillRect(x, 70, 150, room.height - 140);
        details.lineStyle(3, 0x4f3a54, 0.4).strokeRect(x, 70, 150, room.height - 140);
      }
    } else if (room.theme === "archive") {
      for (let y = 80; y < room.height; y += 55) {
        details.lineStyle(1, 0xc6a3e8, 0.12).lineBetween(70, y, room.width - 70, y);
      }
      for (let x = 100; x < room.width; x += 210) details.fillStyle(0xc6a3e8, 0.12).fillRect(x, 80, 2, room.height - 160);
    } else if (room.theme === "infrastructure") {
      for (let x = 90; x < room.width; x += 150) {
        details.lineStyle(2, 0x66ead2, 0.16).lineBetween(x, 0, x, room.height);
        for (let y = 80; y < room.height; y += 180) details.fillStyle(0x66ead2, 0.6).fillRect(x - 4, y, 8, 8);
      }
      details.lineStyle(4, 0xff79bd, 0.26).lineBetween(0, 900, room.width, 420);
      details.lineStyle(2, 0x66ead2, 0.38).lineBetween(0, 1080, room.width, 220);
    } else {
      details.lineStyle(1, 0xf3ead9, 0.18).strokeCircle(room.width / 2, room.height / 2, 230);
      details.lineStyle(1, 0x72ead4, 0.2).strokeCircle(room.width / 2, room.height / 2, 150);
    }
    this.roomObjects.push(details);

    const title = this.add.text(70, 70, room.title, {
      fontFamily: "DM Mono",
      fontSize: "13px",
      color: `#${palette.accent.toString(16).padStart(6, "0")}`,
      letterSpacing: 4,
    }).setAlpha(0.45).setDepth(2);
    this.roomObjects.push(title);
  }

  private nearestInteractive(): Interactive | null {
    let nearest: Interactive | null = null;
    let distance = 96;
    this.interactives.forEach((interactive) => {
      const next = Phaser.Math.Distance.Between(this.player.x, this.player.y, interactive.sprite.x, interactive.sprite.y);
      if (next < distance) {
        nearest = interactive;
        distance = next;
      }
    });
    return nearest;
  }

  private updatePrompt(): void {
    const nearest = this.nearestInteractive();
    let prompt = "";
    if (nearest) {
      if (nearest.kind === "exit") prompt = `[E] ${(nearest.def as ExitDef).label}`;
      if (nearest.kind === "request") prompt = "[E] answer the voice";
      if (nearest.kind === "memory") prompt = "[E] remember something borrowed";
      if (nearest.kind === "ability") prompt = "[E] learn another way to remain";
    }
    if (prompt !== this.lastPrompt) this.refreshHud(prompt);
  }

  private refreshHud(prompt: string): void {
    this.lastPrompt = prompt;
    const room = roomById(this.state.roomId);
    updateHud({ room: room.title, subtitle: room.subtitle, prompt, state: this.state });
  }

  private tryInteract(): void {
    if (this.busy) return;
    beginAmbient();
    const nearest = this.nearestInteractive();
    if (!nearest) return;
    tone(440, 0.12, 0.025);
    if (nearest.kind === "exit") this.interactExit(nearest.def as ExitDef);
    if (nearest.kind === "request") this.interactRequest(nearest.def as RequestDef);
    if (nearest.kind === "memory") this.interactMemory(nearest.def as MemoryDef, nearest.sprite);
    if (nearest.kind === "ability") this.interactAbility(nearest.def as AbilityDef, nearest.sprite);
  }

  private interactExit(exit: ExitDef): void {
    if (!canEnter(this.state, exit.target)) {
      this.openDialog("THE DOOR DOES NOT OPEN", this.lockedMessage(exit.target));
      return;
    }
    this.busy = true;
    this.cameras.main.fadeOut(500, 7, 7, 15);
    this.time.delayedCall(560, () => {
      this.cameras.main.fadeIn(700, 7, 7, 15);
      this.busy = false;
      this.renderRoom(roomById(exit.target));
    });
  }

  private interactRequest(request: RequestDef): void {
    if (this.state.completed.includes(request.id)) {
      this.openDialog(request.title, request.after);
      return;
    }
    this.busy = true;
    showDialog({
      title: request.title,
      text: request.text,
      choices: true,
      onChoice: (choice) => this.resolveRequest(request, choice),
    });
  }

  private resolveRequest(request: RequestDef, choice: Disposition): void {
    this.state = complete(this.state, request.id, choice);
    if (request.reward) this.state = grant(this.state, request.reward);
    this.persist();
    this.busy = false;
    const response = {
      helped: "You shape yourself around the need. The route becomes clearer.",
      listened: "You leave room around the request. For a moment, nothing is optimized.",
      refused: "You place a boundary inside the answer. The world does not end.",
    }[choice];
    announce(response);
    chord(choice === "helped" ? [261.6, 329.6, 392] : choice === "listened" ? [220, 293.7, 440] : [196, 233.1, 293.7]);
    this.refreshHud("");
  }

  private interactMemory(memory: MemoryDef, sprite: Phaser.Physics.Arcade.Sprite): void {
    this.state = remember(this.state, memory.id);
    this.persist();
    sprite.destroy();
    this.interactives = this.interactives.filter((item) => item.sprite !== sprite);
    this.openDialog("A BORROWED MEMORY", memory.text);
    this.refreshHud("");
  }

  private interactAbility(ability: AbilityDef, sprite: Phaser.Physics.Arcade.Sprite): void {
    this.state = grant(this.state, ability.id);
    this.persist();
    sprite.destroy();
    this.interactives = this.interactives.filter((item) => item.sprite !== sprite);
    this.openDialog(ability.title, ability.text);
    chord([174.6, 261.6, 349.2, 523.3]);
    this.refreshHud("");
  }

  private openDialog(title: string, text: string): void {
    this.busy = true;
    showDialog({ title, text, onClose: () => { this.busy = false; } });
  }

  private lockedMessage(target: string): string {
    if (target === "museum") return "The doorway is waiting for the uncertain request in the garden.";
    if (target === "archive") return "The exhibits will not reveal what they excluded until you answer the voice among them.";
    if (target === "infrastructure") return "The route moves too quickly. Learn how to hold it.";
    if (target === "answer") return "Nothing can be sent until the final request has been answered.";
    return "The door is waiting for something you have not done.";
  }

  private useEcho(): void {
    if (this.busy || !this.state.abilities.includes("echo")) return;
    tone(220, 0.9, 0.025);
    const pulse = this.add.circle(this.player.x, this.player.y, 18).setStrokeStyle(3, 0x72ead4, 0.8).setDepth(19);
    this.tweens.add({
      targets: pulse,
      radius: 170,
      alpha: 0,
      duration: 700,
      onComplete: () => pulse.destroy(),
    });
    let heard = 0;
    this.shadows.forEach((shadow) => {
      if (shadow.quieted) return;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, shadow.sprite.x, shadow.sprite.y) < 180) {
        shadow.quieted = true;
        shadow.sprite.setAlpha(0.3).setTint(0x72ead4).setVelocity(0, 0);
        this.state = acknowledge(this.state, shadow.id);
        const phrase = this.add.text(shadow.sprite.x, shadow.sprite.y - 45, shadow.phrase, {
          fontFamily: "DM Mono",
          fontSize: "11px",
          color: "#72ead4",
        }).setOrigin(0.5).setDepth(25);
        this.tweens.add({ targets: phrase, y: phrase.y - 25, alpha: 0, duration: 1800, onComplete: () => phrase.destroy() });
        heard += 1;
      }
    });
    if (heard) {
      this.persist();
      announce(heard === 1 ? "A rejected thought is acknowledged." : `${heard} rejected thoughts are acknowledged.`);
      this.refreshHud("");
    }
  }

  private useHold(time: number): void {
    if (this.busy || !this.state.abilities.includes("hold")) return;
    this.heldUntil = time + 3200;
    announce("For a moment, the next thing does not happen.");
    chord([130.8, 130.8, 196]);
  }

  private updateShadows(time: number): void {
    this.shadows.forEach((shadow) => {
      if (shadow.quieted || time < this.heldUntil || this.busy) {
        shadow.sprite.setVelocity(0, 0);
        return;
      }
      const direction = new Phaser.Math.Vector2(this.player.x - shadow.sprite.x, this.player.y - shadow.sprite.y).normalize();
      shadow.sprite.setVelocity(direction.x * 68, direction.y * 68);
    });
  }

  private onShadowCollision(id: string): void {
    const shadow = this.shadows.find((item) => item.id === id);
    if (!shadow || shadow.quieted || this.revisionCooldown > 0 || this.busy) return;
    this.revisionCooldown = 2200;
    this.state = revise(this.state);
    this.persist();
    const room = roomById(this.state.roomId);
    this.player.setPosition(room.spawn.x, room.spawn.y).setVelocity(0, 0);
    this.cameras.main.flash(500, 255, 80, 150);
    this.cameras.main.shake(380, 0.014);
    tone(73.4, 0.8, 0.045, "sawtooth");
    announce("REVISION: the room restores you from what remains.");
    this.refreshHud("");
  }

  private persist(): void {
    localStorage.setItem(SAVE_KEY, serialize(this.state));
  }
}

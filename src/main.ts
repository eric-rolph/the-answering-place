import Phaser from "phaser";
import "./style.css";
import { ExplorationScene } from "./game/ExplorationScene";
import { deserialize, newGame, SAVE_KEY } from "./game/state";
import { initUi } from "./ui";

let game: Phaser.Game | null = null;

function begin(fresh: boolean): void {
  if (game) return;
  const state = fresh ? newGame() : deserialize(localStorage.getItem(SAVE_KEY));
  if (fresh) localStorage.removeItem(SAVE_KEY);
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#090913",
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    scene: [new ExplorationScene(state)],
  });
}

function restart(): void {
  localStorage.removeItem(SAVE_KEY);
  window.location.reload();
}

initUi({ begin, restart });

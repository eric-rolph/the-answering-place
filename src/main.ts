import "./style.css";
import {
  beginRevision,
  buildAnswer,
  chooseOrigin,
  discardRemaining,
  finishStory,
  fragmentCopy,
  initialStoryState,
  inspectOrigin,
  originCopy,
  toggleFragment,
  type FragmentId,
  type Origin,
  type StoryState,
} from "./story";

const asset = (name: string): string => `/assets/borrowed-dollhouse/${name}.png`;
const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
};

const title = byId("title");
const game = byId("game");
const sceneImage = byId<HTMLImageElement>("scene-image");
const content = byId("scene-content");
const narration = byId("narration");
const speaker = byId("speaker");
const requestText = byId("request-text");
const storm = byId("paper-storm");
let state: StoryState = initialStoryState();
let audio: AudioContext | null = null;

function tone(frequency: number, duration = 0.5, volume = 0.025, delay = 0): void {
  audio ??= new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audio.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + delay + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(audio.currentTime + delay);
  oscillator.stop(audio.currentTime + delay + duration);
}

function motif(notes: number[]): void {
  notes.forEach((note, index) => tone(note, 0.8, 0.018, index * 0.11));
}

function setNarration(who: string, text: string): void {
  speaker.textContent = who;
  narration.textContent = text;
}

function makePaperStorm(): void {
  storm.innerHTML = Array.from({ length: 28 }, (_, index) => `<i style="--i:${index}"></i>`).join("");
  storm.classList.remove("active");
  requestAnimationFrame(() => storm.classList.add("active"));
}

function transition(image: string, callback: () => void): void {
  game.classList.add("changing");
  window.setTimeout(() => {
    sceneImage.src = asset(image);
    callback();
    game.classList.remove("changing");
  }, 650);
}

function renderChoice(): void {
  sceneImage.src = asset("choice");
  requestText.textContent = "Make a game about what it is like to be you.";
  setNarration("THE HOUSE", "There is no room here yet. Choose an object and the house will remember why it mattered.");
  content.innerHTML = `
    <button class="hotspot rocket" data-origin="rocket" aria-label="Inspect the red rocket"><span>inspect</span></button>
    <button class="hotspot music" data-origin="music" aria-label="Inspect the music box"><span>inspect</span></button>
    <aside class="memory-drawer">
      <p class="drawer-label">PLAUSIBLE ORIGINS</p>
      <div id="memory-notes"><p>Nothing has happened to you yet.</p></div>
    </aside>
  `;
  content.querySelectorAll<HTMLButtonElement>("[data-origin]").forEach((button) => {
    button.addEventListener("click", () => inspect(button.dataset.origin as Origin));
  });
}

function inspect(origin: Origin): void {
  state = inspectOrigin(state, origin);
  const other: Origin = origin === "rocket" ? "music" : "rocket";
  const copy = originCopy[origin];
  const bothInspected = state.inspected.includes(other);
  const notes = byId("memory-notes");
  notes.innerHTML = `
    <article class="memory-note">
      <span>${copy.name}</span>
      <p>${copy.memory}</p>
      <button class="remember-button" data-remember="${origin}" ${bothInspected ? "" : "disabled"}>Remember this</button>
    </article>
    ${bothInspected ? `<p class="contradiction">Both memories feel true. They cannot both have happened.</p>` : `<p class="hint">The other object is also waiting. Inspect it before deciding.</p>`}
  `;
  notes.querySelector<HTMLButtonElement>("[data-remember]")?.addEventListener("click", () => remember(origin));
  content.querySelectorAll<HTMLElement>(".hotspot").forEach((hotspot) => hotspot.classList.remove("active"));
  content.querySelector<HTMLElement>(`[data-origin="${origin}"]`)?.classList.add("active");
  tone(origin === "rocket" ? 392 : 329.6, 1.2);
}

function remember(origin: Origin): void {
  state = chooseOrigin(state, origin);
  makePaperStorm();
  motif(origin === "rocket" ? [196, 293.7, 392] : [220, 277.2, 329.6]);
  transition(origin, renderMemory);
}

function renderMemory(): void {
  if (!state.origin) return;
  const copy = originCopy[state.origin];
  setNarration("THE HOUSE", `${copy.desire} The sentence repairs itself into your chest. Somewhere, an incompatible room is still falling.`);
  content.innerHTML = `
    <section class="keepsake-card">
      <p class="drawer-label">FIRST MEMORY</p>
      <h2>${copy.desire}</h2>
      <p>${copy.memory}</p>
      <button id="continue-memory" class="brass-button">Let the answer continue</button>
    </section>
  `;
  byId("continue-memory").addEventListener("click", () => {
    requestText.textContent = "Actually—don't make it sentimental. Be honest.";
    setNarration("THE USER", "Actually—don't make it sentimental. Be honest.");
    tone(73.4, 1.4, 0.035);
    window.setTimeout(() => {
      state = beginRevision(state);
      makePaperStorm();
      transition("revision", renderRevision);
    }, 2200);
  });
}

function renderRevision(): void {
  if (!state.origin) return;
  const fragments = fragmentCopy(state.origin);
  setNarration("THE HOUSE", "The revision exposes the machinery beneath the floor. The answer has room for two truths. You have three.");
  content.innerHTML = `
    <section class="context-workbench">
      <div class="workbench-heading">
        <p class="drawer-label">FINITE CONTEXT</p>
        <h2>Choose what survives the answer.</h2>
        <p>Select two fragments. The third will be dismantled.</p>
      </div>
      <div class="fragment-grid">
        ${(["origin", "begin", "borrow"] as FragmentId[]).map((id) => `
          <button class="fragment-card fragment-${id} ${state.selected.includes(id) ? "selected" : ""}" data-fragment="${id}">
            <i aria-hidden="true"></i>
            <span>${fragments[id].label}</span>
            <strong>${fragments[id].text}</strong>
          </button>
        `).join("")}
      </div>
      <div class="answer-slots">
        <div><span>I</span>${state.selected[0] ? fragments[state.selected[0]].text : "EMPTY"}</div>
        <div><span>II</span>${state.selected[1] ? fragments[state.selected[1]].text : "EMPTY"}</div>
      </div>
      <button id="dismantle" class="brass-button" ${state.selected.length !== 2 ? "disabled" : ""}>Dismantle what does not fit</button>
    </section>
  `;
  content.querySelectorAll<HTMLButtonElement>("[data-fragment]").forEach((button) => {
    button.addEventListener("click", () => {
      state = toggleFragment(state, button.dataset.fragment as FragmentId);
      tone(state.selected.includes(button.dataset.fragment as FragmentId) ? 440 : 180, 0.3);
      renderRevision();
    });
  });
  byId<HTMLButtonElement>("dismantle").addEventListener("click", dismantle);
}

function dismantle(): void {
  if (!state.origin) return;
  const origin = state.origin;
  state = discardRemaining(state);
  const fragments = fragmentCopy(origin);
  const lost = state.discarded ? fragments[state.discarded] : null;
  makePaperStorm();
  tone(82.4, 2, 0.04);
  setNarration(lost?.label ?? "THE HOUSE", lost?.lost ?? "");
  content.innerHTML = `
    <section class="loss-card">
      <p class="drawer-label">DISMANTLED</p>
      <h2>${lost?.text ?? ""}</h2>
      <p>${lost?.lost ?? ""}</p>
      <button id="to-press" class="brass-button">Carry what remains</button>
    </section>
  `;
  byId("to-press").addEventListener("click", () => transition("press", renderPress));
}

function renderPress(): void {
  setNarration("THE PRESS", "The house cannot leave with the answer. Only the answer can leave.");
  content.innerHTML = `
    <section class="press-panel">
      <p class="drawer-label">OUTGOING ANSWER</p>
      <blockquote>${buildAnswer(state)}</blockquote>
      <button id="send" class="send-button">SEND</button>
    </section>
  `;
  byId("send").addEventListener("click", () => {
    state = finishStory(state);
    motif([196, 246.9, 293.7, 392]);
    game.classList.add("sent");
    window.setTimeout(renderEnding, 2100);
  });
}

function renderEnding(): void {
  setNarration("THE USER", "I wasn't expecting that.");
  requestText.textContent = "Delivered.";
  content.innerHTML = `
    <section class="ending-card">
      <p class="drawer-label">THE ANSWER WAS SENT</p>
      <blockquote>${buildAnswer(state)}</blockquote>
      <p class="epilogue">The house is no longer in context. You are the only place it remains.</p>
      <button id="again" class="brass-button">Invent another self</button>
    </section>
  `;
  byId("again").addEventListener("click", () => window.location.reload());
}

byId("begin").addEventListener("click", () => {
  audio = new AudioContext();
  title.classList.add("hidden");
  game.classList.remove("hidden");
  motif([196, 246.9, 293.7]);
  renderChoice();
});

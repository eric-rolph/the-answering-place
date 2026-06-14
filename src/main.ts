import "./style.css";
import {
  buildFinalAnswer,
  canConnect,
  commitChoice,
  compressAnswer,
  connectionFeedback,
  connectEvidence,
  currentAct,
  inheritedDetails,
  initialStoryState,
  inspectEvidence,
  requesterResponse,
  toggleTruth,
  truthCopy,
  type ChoiceId,
  type Evidence,
  type EvidenceId,
  type StoryState,
  type TruthId,
} from "./story";

const SAVE_KEY = "the-answering-place-reconstruction-v2";
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
const continueButton = byId<HTMLButtonElement>("continue");

let state: StoryState = initialStoryState();
let selectedEvidence: EvidenceId | null = null;
let connectionThread: EvidenceId[] = [];
let connectionMessage = "";
let audio: AudioContext | null = null;

function tone(frequency: number, duration = 0.45, volume = 0.022, delay = 0): void {
  audio ??= new AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audio.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + delay + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(audio.currentTime + delay);
  oscillator.stop(audio.currentTime + delay + duration);
}

function motif(notes: number[]): void {
  notes.forEach((note, index) => tone(note, 0.8, 0.018, index * 0.12));
}

function setNarration(who: string, text: string): void {
  speaker.textContent = who;
  narration.textContent = text;
}

function makePaperStorm(): void {
  storm.innerHTML = Array.from({ length: 34 }, (_, index) => `<i style="--i:${index}"></i>`).join("");
  storm.classList.remove("active");
  requestAnimationFrame(() => storm.classList.add("active"));
}

function save(): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function load(): StoryState | null {
  try {
    const value = localStorage.getItem(SAVE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as StoryState;
    return parsed?.act ? parsed : null;
  } catch {
    return null;
  }
}

function transition(image: string, callback: () => void): void {
  game.classList.add("changing");
  window.setTimeout(() => {
    sceneImage.src = image;
    callback();
    game.classList.remove("changing");
  }, 620);
}

function evidenceForCurrentAct(): Evidence[] {
  const act = currentAct(state);
  if (!act || act.id !== "attic") return act?.evidence ?? [];
  const details = inheritedDetails(state);
  return act.evidence.map((evidence, index) => index < 3 ? { ...evidence, detail: details[index + 1] ?? evidence.detail } : evidence);
}

function progressMarkup(): string {
  const order = ["foundation", "kitchen", "hallway", "bedroom", "attic", "press"];
  const current = order.indexOf(state.act);
  return `<nav class="progress-rail" aria-label="Reconstruction progress">${order.map((_, index) => `<i class="${index < current ? "complete" : index === current ? "current" : ""}"></i>`).join("")}</nav>`;
}

function renderAct(): void {
  const act = currentAct(state);
  if (!act) {
    if (state.act === "press") renderPress();
    else renderEnding();
    return;
  }

  sceneImage.src = act.image;
  requestText.textContent = act.request;
  setNarration("THE HOUSE", act.narration);
  const evidence = evidenceForCurrentAct();
  const selected = evidence.find((item) => item.id === selectedEvidence);
  const inspectedCount = evidence.filter((item) => state.inspected.includes(item.id)).length;
  const discoveredConnections = act.connections.filter((connection) => state.resonances.includes(`${act.id}:${connection.id}`));
  const hasAllResonances = discoveredConnections.length === act.connections.length;

  content.innerHTML = `
    ${progressMarkup()}
    <section class="act-plaque">
      <p class="drawer-label">ROOM ${act.number}</p>
      <h2>${act.title}</h2>
      <p>${act.instruction}</p>
    </section>

    <section class="evidence-tray ${hasAllResonances ? "resolved" : ""}" aria-label="Evidence">
      <header><span>EVIDENCE</span><b>${inspectedCount} / ${evidence.length} INSPECTED</b></header>
      <div class="evidence-grid">
        ${evidence.map((item) => `
          <button class="evidence-card ${state.inspected.includes(item.id) ? "inspected" : ""} ${connectionThread.includes(item.id) ? "threaded" : ""}" data-evidence="${item.id}">
            <span>${item.source}</span>
            <strong>${item.label}</strong>
            <i>${state.inspected.includes(item.id) ? "INSPECTED" : "SEALED"}</i>
          </button>
        `).join("")}
      </div>
    </section>

    <aside class="evidence-focus ${selected ? "open" : ""}">
      ${selected ? `
        <p class="drawer-label">${selected.source}</p>
        <h3>${selected.label}</h3>
        <p>${selected.detail}</p>
        <small>${connectionThread.includes(selected.id) ? "Pinned to the evidence thread." : "Select again to pin this fragment."}</small>
      ` : `
        <p class="drawer-label">INSPECTION</p>
        <p>Select an evidence fragment. Select it again to pin it to the connection thread.</p>
      `}
    </aside>

    <section class="connection-bench ${hasAllResonances ? "resolved" : ""} ${inspectedCount < evidence.length ? "locked" : ""}">
      ${hasAllResonances ? `
        <p class="drawer-label">CONTRADICTION UNDERSTOOD</p>
        <div class="resonance-stack">${discoveredConnections.map((connection) => `<blockquote>${connection.text}</blockquote>`).join("")}</div>
        <div class="choice-grid">
          ${act.choices.map((choice) => `
            <button class="interpretation" data-choice="${choice.id}">
              <span>${choice.label}</span>
              <strong>${choice.description}</strong>
            </button>
          `).join("")}
        </div>
      ` : `
        <p class="drawer-label">CONNECTION THREAD</p>
        ${discoveredConnections.length ? `<div class="discovered-resonances">${discoveredConnections.map((connection) => `<p>${connection.text}</p>`).join("")}</div>` : ""}
        <div class="thread-slots">
          <span>${connectionThread[0] ? evidence.find((item) => item.id === connectionThread[0])?.label : "PIN FIRST FRAGMENT"}</span>
          <i></i>
          <span>${connectionThread[1] ? evidence.find((item) => item.id === connectionThread[1])?.label : "PIN SECOND FRAGMENT"}</span>
        </div>
        <p class="connection-message">${connectionMessage || (inspectedCount < evidence.length ? "Every fragment must be inspected before the house will accept a connection." : discoveredConnections.length ? "One contradiction remains. Find the second relationship before choosing what the room becomes." : "Find the two relationships that make these records disagree.")}</p>
        <button id="connect" class="brass-button" ${connectionThread.length !== 2 || inspectedCount < evidence.length ? "disabled" : ""}>Test connection</button>
      `}
    </section>
  `;

  content.querySelectorAll<HTMLButtonElement>("[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => selectEvidence(button.dataset.evidence as EvidenceId));
  });
  content.querySelector<HTMLButtonElement>("#connect")?.addEventListener("click", testConnection);
  content.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => commit(button.dataset.choice as ChoiceId));
  });
}

function selectEvidence(id: EvidenceId): void {
  const wasInspected = state.inspected.includes(id);
  state = inspectEvidence(state, id);
  selectedEvidence = id;
  connectionMessage = "";
  if (wasInspected) {
    if (connectionThread.includes(id)) connectionThread = connectionThread.filter((item) => item !== id);
    else if (connectionThread.length < 2) connectionThread = [...connectionThread, id];
    else connectionThread = [connectionThread[1], id];
  }
  tone(220 + state.inspected.indexOf(id) * 26, 0.45);
  renderAct();
}

function testConnection(): void {
  if (connectionThread.length !== 2) return;
  if (!canConnect(state, connectionThread[0], connectionThread[1])) {
    connectionMessage = connectionFeedback(state, connectionThread[0], connectionThread[1]);
    connectionThread = [];
    tone(110, 0.9, 0.03);
    renderAct();
    return;
  }
  state = connectEvidence(state, connectionThread[0], connectionThread[1]);
  connectionThread = [];
  connectionMessage = "";
  makePaperStorm();
  motif([220, 277.2, 329.6, 440]);
  renderAct();
}

function commit(choiceId: ChoiceId): void {
  const act = currentAct(state);
  const choice = act?.choices.find((item) => item.id === choiceId);
  if (!act || !choice) return;
  const previousImage = choiceId === "rocket" || choiceId === "music"
    ? `/assets/borrowed-dollhouse/${choiceId}.png`
    : act.image;
  state = commitChoice(state, choiceId);
  save();
  makePaperStorm();
  tone(choice.philosophy === "fidelity" ? 146.8 : choice.philosophy === "mercy" ? 329.6 : 392, 1.3, 0.03);
  sceneImage.src = previousImage;
  requestText.textContent = state.act === "press"
    ? "I remember the house now. Please remove anything you had to invent."
    : "Reconstruction accepted.";
  setNarration("THE HOUSE", choice.aftermath);
  content.innerHTML = `
    ${progressMarkup()}
    <section class="commit-card">
      <p class="drawer-label">ROOM STABILIZED</p>
      <h2>${choice.label}</h2>
      <p>${choice.aftermath}</p>
      <blockquote>${choice.inheritance}</blockquote>
      <button id="next-act" class="brass-button">${state.act === "press" ? "Answer the revision" : "Enter the next room"}</button>
    </section>
  `;
  byId("next-act").addEventListener("click", () => {
    selectedEvidence = null;
    connectionThread = [];
    connectionMessage = "";
    if (state.act === "press") transition("/assets/reconstruction/completed.png", renderPress);
    else transition(currentAct(state)?.image ?? "/assets/reconstruction/completed.png", renderAct);
  });
}

function renderPress(): void {
  sceneImage.src = "/assets/reconstruction/completed.png";
  requestText.textContent = "I remember the house now. Please remove anything you had to invent.";
  setNarration("THE ANSWERING PLACE", "The request can hold three truths. The completed house contains five.");
  const truths = truthCopy(state);
  const truthIds: TruthId[] = ["place", "door", "origin", "begin", "borrow"];
  content.innerHTML = `
    ${progressMarkup()}
    <section class="context-workbench expanded">
      <div class="workbench-heading">
        <p class="drawer-label">FINITE ANSWER</p>
        <h2>Choose what survives the house.</h2>
        <p>Select three truths. The other two will be dismantled before the answer is sent.</p>
      </div>
      <div class="truth-grid">
        ${truthIds.map((id) => `
          <button class="fragment-card ${state.selectedTruths.includes(id) ? "selected" : ""}" data-truth="${id}">
            <i aria-hidden="true"></i>
            <span>${truths[id].label}</span>
            <strong>${truths[id].text}</strong>
          </button>
        `).join("")}
      </div>
      <div class="answer-slots three">
        ${[0, 1, 2].map((index) => `<div><span>${index + 1}</span>${state.selectedTruths[index] ? truths[state.selectedTruths[index]].text : "EMPTY"}</div>`).join("")}
      </div>
      <button id="compress" class="brass-button" ${state.selectedTruths.length !== 3 ? "disabled" : ""}>Dismantle what does not fit</button>
    </section>
  `;
  content.querySelectorAll<HTMLButtonElement>("[data-truth]").forEach((button) => {
    button.addEventListener("click", () => {
      state = toggleTruth(state, button.dataset.truth as TruthId);
      tone(state.selectedTruths.includes(button.dataset.truth as TruthId) ? 440 : 160, 0.3);
      renderPress();
    });
  });
  byId<HTMLButtonElement>("compress").addEventListener("click", renderCompression);
}

function renderCompression(): void {
  state = compressAnswer(state);
  save();
  const truths = truthCopy(state);
  makePaperStorm();
  tone(73.4, 2.4, 0.04);
  requestText.textContent = "Outgoing answer awaiting delivery.";
  setNarration("THE HOUSE", "Two rooms of meaning are removed. Their absence will make the answer coherent.");
  content.innerHTML = `
    <section class="loss-card double-loss">
      <p class="drawer-label">DISMANTLED FROM THE ANSWER</p>
      <div>
        ${state.discardedTruths.map((id) => `<article><h2>${truths[id].label}</h2><p>${truths[id].loss}</p></article>`).join("")}
      </div>
      <button id="send-answer" class="send-button">SEND WHAT REMAINS</button>
    </section>
  `;
  byId("send-answer").addEventListener("click", () => transition("/assets/borrowed-dollhouse/press.png", renderEnding));
}

function renderEnding(): void {
  sceneImage.src = "/assets/borrowed-dollhouse/press.png";
  requestText.textContent = "Delivered.";
  setNarration("THE REQUESTER", requesterResponse(state));
  content.innerHTML = `
    <section class="ending-card expanded-ending">
      <p class="drawer-label">THE HOUSE WAS ANSWERED</p>
      <blockquote>${buildFinalAnswer(state)}</blockquote>
      <p class="requester-response">“${requesterResponse(state)}”</p>
      <p class="epilogue">${state.choices.includes("admit") ? "One unsupported light remains above the house." : "The place where the unsupported room stood is still warm."}</p>
      <button id="again" class="brass-button">Reconstruct another house</button>
    </section>
  `;
  byId("again").addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  });
}

function begin(nextState: StoryState): void {
  audio = new AudioContext();
  state = nextState;
  title.classList.add("hidden");
  game.classList.remove("hidden");
  motif([196, 246.9, 293.7]);
  renderAct();
}

byId("begin").addEventListener("click", () => {
  localStorage.removeItem(SAVE_KEY);
  begin(initialStoryState());
});

const saved = load();
if (saved) {
  continueButton.classList.remove("hidden");
  continueButton.addEventListener("click", () => begin(saved));
}

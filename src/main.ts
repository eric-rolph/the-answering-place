import "./style.css";
import {
  acts,
  acknowledgeResponse,
  availableAnswerFragments,
  canSendAnswer,
  canSettleMemoryChoice,
  clearComposedAnswer,
  composeAnswer,
  composedAnswerText,
  currentAct,
  currentRequest,
  initialStoryState,
  hasPendingResponse,
  inspectMemory,
  memoriesForCurrentAct,
  memoryForId,
  replaceRetainedMemory,
  retainMemory,
  sendAnswer,
  settleMemoryChoice,
  type ActId,
  type Memory,
  type MemoryId,
  type StoryState,
} from "./story";

const SAVE_KEY = "the-answering-place-limited-memory-v1";

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
};

const title = byId("title");
const game = byId("game");
const sceneImage = byId<HTMLImageElement>("scene-image");
const content = byId("scene-content");
const contextBar = byId("context-bar");
const requestText = byId("request-text");
const requestRibbon = requestText.closest<HTMLElement>(".request-ribbon");
const narration = byId("narration");
const speaker = byId("speaker");
const narrator = narration.closest<HTMLElement>(".narrator");
const storm = byId("paper-storm");
const continueButton = byId<HTMLButtonElement>("continue");

let state: StoryState = initialStoryState();
let selectedMemory: MemoryId | null = null;
let pendingReplacement: MemoryId | null = null;
let selectedFragments: MemoryId[] = [];

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);

const displayLabel = (memory: Memory): string =>
  memory.label.replace(/[’‘]/g, "'").toUpperCase();

const save = (): void => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
};

const load = (): StoryState | null => {
  try {
    const value = localStorage.getItem(SAVE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoryState>;
    return parsed.currentAct && parsed.retainedMemories && parsed.settledMemoryChoices
      ? { ...parsed, acknowledgedResponses: parsed.acknowledgedResponses ?? 0 } as StoryState
      : null;
  } catch {
    return null;
  }
};

const makePaperStorm = (): void => {
  storm.innerHTML = Array.from({ length: 34 }, (_, index) => `<i style="--i:${index}"></i>`).join("");
  storm.classList.remove("active");
  requestAnimationFrame(() => storm.classList.add("active"));
};

const setNarration = (text: string): void => {
  speaker.textContent = "THE ANSWERING PLACE";
  narration.textContent = text;
  narrator?.classList.remove("hidden");
  window.setTimeout(() => narrator?.classList.add("hidden"), 2600);
};

const currentActId = (): ActId | null => state.currentAct === "ending" ? null : state.currentAct;

const retainedNow = (): MemoryId[] => {
  const act = currentActId();
  return act ? state.retainedMemories[act] : [];
};

const forgottenNow = (): MemoryId[] => {
  const act = currentActId();
  return act ? state.forgottenMemories[act] : [];
};

const inspectedNow = (): MemoryId[] => {
  const act = currentActId();
  return act ? state.inspectedMemories[act] : [];
};

const statusFor = (memoryId: MemoryId): "forgotten" | "retained" | "inspected" | "uninspected" => {
  if (forgottenNow().includes(memoryId)) return "forgotten";
  if (retainedNow().includes(memoryId)) return "retained";
  if (inspectedNow().includes(memoryId)) return "inspected";
  return "uninspected";
};

const renderContext = (): void => {
  const retained = retainedNow();
  contextBar.classList.remove("hidden");
  contextBar.innerHTML = `
    <h2>CONTEXT · ${retained.length} / 2</h2>
    ${[0, 1].map((index) => retained[index]
      ? `<div class="context-slot">REMEMBERING · ${escapeHtml(displayLabel(memoryForId(retained[index])))}</div>`
      : `<div class="context-slot empty">EMPTY MEMORY SLOT</div>`).join("")}
  `;
};

const memoryObjectMarkup = (memory: Memory): string => {
  const status = statusFor(memory.id);
  const statusText = status === "forgotten"
    ? `${displayLabel(memory)} WAS LEFT OUT`
    : status === "retained"
      ? "REMEMBERED"
      : status === "inspected"
        ? "INSPECTED"
        : "INSPECT";
  return `
    <button class="memory-object" data-memory="${memory.id}" data-status="${status}">
      <strong>${escapeHtml(displayLabel(memory))}</strong>
      <small>${escapeHtml(statusText)}</small>
    </button>
  `;
};

const inspectionMarkup = (memory: Memory): string => {
  const status = statusFor(memory.id);
  const disabled = status === "retained" || status === "forgotten";
  return `
    <aside class="inspection-panel">
      <p class="eyebrow">${memory.kind === "self" ? "A STATEMENT ABOUT ME" : "A MEMORY OF MARA"}</p>
      <h3>${escapeHtml(memory.label)}</h3>
      <p>${escapeHtml(memory.detail)}</p>
      ${memory.kind === "mara" ? `
        <p class="answer-preview-label">IF CARRIED INTO THE ANSWER</p>
        <p class="answer-preview">${escapeHtml(memory.answerFragment)}</p>
      ` : ""}
      <button id="remember-memory" class="memory-action" ${disabled ? "disabled" : ""}>
        ${status === "retained" ? "Remembered" : status === "forgotten" ? "Left out" : "Remember this"}
      </button>
    </aside>
  `;
};

const canOpenComposer = (): boolean => {
  const act = currentActId();
  return Boolean(act && act !== "self" && canSettleMemoryChoice(state));
};

const composeLabel = (): string =>
  state.currentAct === "kitchen" ? "Compose Mara's note" : "Compose your advice";

function renderAct(): void {
  const act = currentAct(state);
  if (!act) {
    renderEnding();
    return;
  }
  if (hasPendingResponse(state)) {
    renderResponse();
    return;
  }
  if (act.id === "self") {
    renderFinalSelection();
    return;
  }
  if (state.settledMemoryChoices[act.id]) {
    renderComposer();
    return;
  }

  requestRibbon?.classList.remove("hidden");
  sceneImage.src = act.image;
  sceneImage.alt = act.title;
  requestText.textContent = currentRequest(state);
  renderContext();

  const memories = memoriesForCurrentAct(state);
  const selected = selectedMemory ? memories.find((memory) => memory.id === selectedMemory) : null;
  content.innerHTML = `
    <section class="act-heading">
      <p class="eyebrow">REQUEST ${act.number}</p>
      <h2>${escapeHtml(act.title)}</h2>
      <p>${escapeHtml(act.objective)}</p>
    </section>
    <section class="memory-grid" aria-label="Memories">
      ${memories.map(memoryObjectMarkup).join("")}
    </section>
    ${selected ? inspectionMarkup(selected) : ""}
    <button id="compose" class="brass-button scene-action" ${canOpenComposer() ? "" : "disabled"}>
      ${composeLabel()}
    </button>
    ${pendingReplacement ? replacementModalMarkup(pendingReplacement) : ""}
  `;

  content.querySelectorAll<HTMLButtonElement>("[data-memory]").forEach((button) => {
    button.addEventListener("click", () => inspect(button.dataset.memory as MemoryId));
  });
  content.querySelector<HTMLButtonElement>("#remember-memory")?.addEventListener("click", rememberSelected);
  content.querySelector<HTMLButtonElement>("#compose")?.addEventListener("click", settleAndOpenComposer);
  content.querySelectorAll<HTMLButtonElement>("[data-forget]").forEach((button) => {
    button.addEventListener("click", () => replaceMemory(button.dataset.forget as MemoryId));
  });
}

const replacementOptions = (replacement: MemoryId): MemoryId[] =>
  state.currentAct === "self"
    ? retainedNow().filter((memoryId) => memoryForId(memoryId).kind === memoryForId(replacement).kind)
    : retainedNow();

const replacementModalMarkup = (replacement: MemoryId): string => `
  <div class="modal-backdrop">
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="context-full-heading">
      <p class="eyebrow">LIMITED CONTEXT</p>
      <h2 id="context-full-heading">Context is full.</h2>
      <p>Carrying ${escapeHtml(displayLabel(memoryForId(replacement)))} requires leaving one retained memory out.</p>
      <div class="loss-options">
        ${replacementOptions(replacement).map((memoryId) => `
          <button class="memory-action" data-forget="${memoryId}">
            Leave out ${escapeHtml(displayLabel(memoryForId(memoryId)))}
          </button>
        `).join("")}
      </div>
    </section>
  </div>
`;

const inspect = (memoryId: MemoryId): void => {
  if (forgottenNow().includes(memoryId)) return;
  state = inspectMemory(state, memoryId);
  selectedMemory = memoryId;
  save();
  renderAct();
};

const rememberSelected = (): void => {
  if (!selectedMemory || retainedNow().includes(selectedMemory) || forgottenNow().includes(selectedMemory)) return;
  if (retainedNow().length === 2) {
    pendingReplacement = selectedMemory;
    renderAct();
    return;
  }
  state = retainMemory(state, selectedMemory);
  selectedMemory = null;
  save();
  setNarration("The memory enters context.");
  renderAct();
};

const replaceMemory = (forgottenMemory: MemoryId): void => {
  if (!pendingReplacement) return;
  state = replaceRetainedMemory(state, forgottenMemory, pendingReplacement);
  pendingReplacement = null;
  selectedMemory = null;
  save();
  makePaperStorm();
  setNarration("One memory leaves context so another can remain.");
  renderAct();
};

const settleAndOpenComposer = (): void => {
  if (!canSettleMemoryChoice(state)) return;
  state = settleMemoryChoice(state);
  selectedFragments = [];
  selectedMemory = null;
  save();
  makePaperStorm();
  setNarration("What did not fit is now outside the answer.");
  renderLossBeat();
};

const forgottenLinesMarkup = (): string => forgottenNow().map((memoryId) =>
  `<p class="forgotten-line">${escapeHtml(displayLabel(memoryForId(memoryId)))} WAS LEFT OUT</p>`,
).join("");

function renderLossBeat(): void {
  const act = currentAct(state);
  if (!act || act.id === "self") return;
  sceneImage.src = act.image;
  requestText.textContent = currentRequest(state);
  renderContext();
  content.innerHTML = `
    <section class="memory-grid" aria-label="Settled memories">
      ${memoriesForCurrentAct(state).map(memoryObjectMarkup).join("")}
    </section>
    <section class="response-card loss-beat">
      <p class="eyebrow">CONTEXT SETTLED</p>
      <h2>One part of Mara's story is now outside the answer.</h2>
      ${forgottenLinesMarkup()}
      <button id="compose-remains" class="brass-button">Compose from what remains</button>
    </section>
  `;
  content.querySelector<HTMLButtonElement>("#compose-remains")?.addEventListener("click", renderComposer);
}

function renderComposer(): void {
  const act = currentAct(state);
  if (!act || act.id === "self") return;
  sceneImage.src = act.image;
  requestText.textContent = currentRequest(state);
  renderContext();
  const fragments = availableAnswerFragments(state);
  content.innerHTML = `
    <section class="memory-grid" aria-label="Settled memories">
      ${memoriesForCurrentAct(state).map(memoryObjectMarkup).join("")}
    </section>
    <div class="modal-backdrop">
      <section class="composer" role="dialog" aria-modal="true" aria-labelledby="composer-heading">
        <p class="eyebrow">WHAT REMAINS</p>
        <h2 id="composer-heading">${composeLabel()}</h2>
        ${forgottenLinesMarkup()}
        <div class="fragment-list">
          ${fragments.map((fragment) => `
            <button
              class="fragment-button ${selectedFragments.includes(fragment.memoryId) ? "selected" : ""}"
              data-answer-fragment="${fragment.memoryId}"
            >${escapeHtml(fragment.text)}</button>
          `).join("")}
        </div>
        <p class="outgoing">${escapeHtml(composedAnswerText(state) || "Select both retained fragments to assemble the answer.")}</p>
        <button id="send-answer" class="brass-button" ${canSendAnswer(state) ? "" : "disabled"}>Send answer</button>
      </section>
    </div>
  `;

  content.querySelectorAll<HTMLButtonElement>("[data-answer-fragment]").forEach((button) => {
    button.addEventListener("click", () => selectFragment(button.dataset.answerFragment as MemoryId));
  });
  content.querySelector<HTMLButtonElement>("#send-answer")?.addEventListener("click", sendCurrentAnswer);
}

const selectFragment = (memoryId: MemoryId): void => {
  selectedFragments = selectedFragments.includes(memoryId)
    ? selectedFragments.filter((id) => id !== memoryId)
    : [...selectedFragments, memoryId];
  if (selectedFragments.length === 2) state = composeAnswer(state, selectedFragments);
  else state = clearComposedAnswer(state);
  save();
  renderComposer();
};

const sendCurrentAnswer = (): void => {
  if (!canSendAnswer(state)) return;
  state = sendAnswer(state);
  selectedFragments = [];
  save();
  makePaperStorm();
  if (state.currentAct === "ending") renderEnding();
  else renderResponse();
};

function renderResponse(): void {
  const answer = state.sentAnswers.at(-1);
  const act = currentAct(state);
  if (!answer || !act) return;
  sceneImage.src = act.image;
  sceneImage.alt = act.title;
  requestRibbon?.classList.add("hidden");
  renderContext();
  const nextLabel = state.currentAct === "hallway"
    ? "Continue to Mara's next request"
    : "Continue to Mara's final question";
  content.innerHTML = `
    <div class="modal-backdrop">
      <section class="response-card">
        <p class="eyebrow">ANSWER SENT</p>
        <p class="outgoing">${escapeHtml(answer.text)}</p>
        <h2>Mara answered.</h2>
        <p class="reaction">${escapeHtml(answer.maraResponse)}</p>
        <button id="enter-next" class="brass-button">${nextLabel}</button>
      </section>
    </div>
  `;
  content.querySelector<HTMLButtonElement>("#enter-next")?.addEventListener("click", enterNextAct);
}

const prepareFinalAct = (): void => {
  if (state.currentAct !== "self" || state.settledMemoryChoices.self) return;
  for (const memory of acts.self.memories) state = inspectMemory(state, memory.id);
  save();
};

const enterNextAct = (): void => {
  state = acknowledgeResponse(state);
  selectedMemory = null;
  pendingReplacement = null;
  if (state.currentAct === "self") prepareFinalAct();
  save();
  renderAct();
};

const finalChoiceMarkup = (memory: Memory): string => {
  const selected = retainedNow().includes(memory.id);
  const forgotten = forgottenNow().includes(memory.id);
  const text = memory.kind === "self" ? memory.answerFragment : memory.reflectionFragment;
  return `
    <button
      class="fragment-button final-choice ${selected ? "selected" : ""}"
      data-final-memory="${memory.id}"
      data-memory="${memory.id}"
      data-status="${forgotten ? "forgotten" : selected ? "retained" : "inspected"}"
      ${forgotten ? "disabled" : ""}
    >${escapeHtml(text)}</button>
  `;
};

function renderFinalSelection(): void {
  const act = currentAct(state);
  if (!act || act.id !== "self") return;
  prepareFinalAct();
  sceneImage.src = act.image;
  sceneImage.alt = act.title;
  requestText.textContent = currentRequest(state);
  renderContext();
  const memories = memoriesForCurrentAct(state);
  const selfMemories = memories.filter((memory) => memory.kind === "self");
  const maraMemories = memories.filter((memory) => memory.kind === "mara");
  const canSendFinal = canSettleMemoryChoice(state);

  content.innerHTML = `
    <section class="act-heading">
      <p class="eyebrow">REQUEST ${act.number}</p>
      <h2>${escapeHtml(act.title)}</h2>
      <p>${escapeHtml(act.objective)}</p>
    </section>
    <section class="final-card">
      <p class="eyebrow">ONE STATEMENT · ONE MEMORY OF MARA</p>
      <h2>Answer from what survived.</h2>
      <p class="final-group-label">A STATEMENT ABOUT ME</p>
      <div class="final-options">
        ${selfMemories.map(finalChoiceMarkup).join("")}
      </div>
      <p class="final-group-label">MEMORIES FROM MARA · LEFT-OUT MEMORIES CANNOT BE CHOSEN</p>
      <div class="final-options memories">
        ${maraMemories.map(finalChoiceMarkup).join("")}
      </div>
      <button id="send-final" class="brass-button" ${canSendFinal ? "" : "disabled"}>Send final answer</button>
    </section>
    ${pendingReplacement ? replacementModalMarkup(pendingReplacement) : ""}
  `;

  content.querySelectorAll<HTMLButtonElement>("[data-final-memory]").forEach((button) => {
    button.addEventListener("click", () => chooseFinalMemory(button.dataset.finalMemory as MemoryId));
  });
  content.querySelectorAll<HTMLButtonElement>("[data-forget]").forEach((button) => {
    button.addEventListener("click", () => replaceMemory(button.dataset.forget as MemoryId));
  });
  content.querySelector<HTMLButtonElement>("#send-final")?.addEventListener("click", sendFinalAnswer);
}

const chooseFinalMemory = (memoryId: MemoryId): void => {
  if (state.currentAct !== "self" || forgottenNow().includes(memoryId) || retainedNow().includes(memoryId)) return;
  const memory = memoryForId(memoryId);
  state = inspectMemory(state, memoryId);
  const retainedOfKind = retainedNow().find((id) => memoryForId(id).kind === memory.kind);
  if (retainedOfKind) {
    pendingReplacement = memoryId;
    renderFinalSelection();
    return;
  }
  state = retainMemory(state, memoryId);
  save();
  renderFinalSelection();
};

const sendFinalAnswer = (): void => {
  if (state.currentAct !== "self" || !canSettleMemoryChoice(state)) return;
  state = settleMemoryChoice(state);
  state = composeAnswer(state, state.retainedMemories.self);
  if (!canSendAnswer(state)) return;
  state = sendAnswer(state);
  save();
  makePaperStorm();
  renderEnding();
};

function renderEnding(): void {
  const answer = state.sentAnswers.at(-1);
  sceneImage.src = "/assets/borrowed-dollhouse/press.png";
  sceneImage.alt = "The Answering Place after the answer";
  requestRibbon?.classList.remove("hidden");
  requestText.textContent = currentRequest(state);
  contextBar.classList.add("hidden");
  contextBar.innerHTML = "";
  content.innerHTML = `
    <div class="modal-backdrop">
      <section class="final-card">
        <p class="eyebrow">FINAL RESPONSE</p>
        <h2>ANSWER DELIVERED</h2>
        <p class="final-answer">${escapeHtml(answer?.text ?? "")}</p>
        <p class="reaction">${escapeHtml(answer?.maraResponse ?? "")}</p>
        <button id="again" class="brass-button">Answer Mara again</button>
      </section>
    </div>
  `;
  content.querySelector<HTMLButtonElement>("#again")?.addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  });
}

const begin = (nextState: StoryState): void => {
  state = nextState;
  selectedMemory = null;
  pendingReplacement = null;
  selectedFragments = state.currentAct === "ending" ? [] : [...state.composedAnswers[state.currentAct]];
  title.classList.add("hidden");
  game.classList.remove("hidden");
  if (state.currentAct === "self") prepareFinalAct();
  save();
  renderAct();
};

byId<HTMLButtonElement>("begin").addEventListener("click", () => {
  localStorage.removeItem(SAVE_KEY);
  begin(initialStoryState());
});

const saved = load();
if (saved) {
  continueButton.classList.remove("hidden");
  continueButton.addEventListener("click", () => begin(saved));
}

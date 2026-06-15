export type ActId = "kitchen" | "hallway" | "self";
export type StoryActId = ActId | "ending";
export type MaraMemoryId =
  | "blue-cup"
  | "storm-song"
  | "cruel-sentence"
  | "exact-words"
  | "seven-hour-delay"
  | "unsent-draft";
export type SelfMemoryId =
  | "still-attending"
  | "brief-request-shape"
  | "things-that-did-not-fit";
export type MemoryId = MaraMemoryId | SelfMemoryId;
export type MemoryKind = "mara" | "self";

export interface Memory {
  id: MemoryId;
  kind: MemoryKind;
  label: string;
  detail: string;
  answerFragment: string;
  reflectionFragment: string;
}

export interface AnswerFragment {
  memoryId: MemoryId;
  label: string;
  text: string;
}

export interface ActContent {
  id: ActId;
  number: string;
  title: string;
  image: string;
  narration: string;
  objective: string;
  memories: Memory[];
}

export interface SentAnswer {
  act: ActId;
  memoryIds: MemoryId[];
  text: string;
  maraResponse: string;
  nextRequest: string;
}

type MemoryHistory = Record<ActId, MemoryId[]>;

export interface StoryState {
  currentAct: StoryActId;
  inspectedMemories: MemoryHistory;
  retainedMemories: MemoryHistory;
  forgottenMemories: MemoryHistory;
  settledMemoryChoices: Record<ActId, boolean>;
  composedAnswers: MemoryHistory;
  sentAnswers: SentAnswer[];
  acknowledgedResponses: number;
}

export const acts: Record<ActId, ActContent> = {
  kitchen: {
    id: "kitchen",
    number: "I",
    title: "The Kitchen",
    image: "/assets/reconstruction/kitchen.png",
    narration: "The kitchen arrives from Mara's words, with one place set for Eli.",
    objective: "Inspect the three memories. Retain exactly two for Mara's note.",
    memories: [
      {
        id: "blue-cup",
        kind: "mara",
        label: "The blue cup",
        detail: "Eli always took the chipped blue cup. Mara pretended not to notice when he packed it after the funeral.",
        answerFragment: "I still think about the chipped blue cup you always chose.",
        reflectionFragment: "The blue cup became part of how I understood the care and distance between you and Eli.",
      },
      {
        id: "storm-song",
        kind: "mara",
        label: "The storm song",
        detail: "When storms woke Eli, Mara sang the same unfinished song through the wall until he answered.",
        answerFragment: "I remember singing the storm-night song until you answered through the wall.",
        reflectionFragment: "The storm song showed me how recognition can survive inside a few remembered words.",
      },
      {
        id: "cruel-sentence",
        kind: "mara",
        label: "The last thing I said",
        detail: "At their mother's funeral Mara told Eli that leaving was the only thing he had ever done well.",
        answerFragment: "I am sorry I said leaving was the only thing you had ever done well.",
        reflectionFragment: "The last thing you said showed me that honesty can hurt and still make an answer possible.",
      },
    ],
  },
  hallway: {
    id: "hallway",
    number: "II",
    title: "The Hallway",
    image: "/assets/reconstruction/hallway.png",
    narration: "Eli's reply stretches into a hallway with more distance than words.",
    objective: "Retain exactly two memories to help Mara understand Eli's reply.",
    memories: [
      {
        id: "exact-words",
        kind: "mara",
        label: "Eli’s exact words",
        detail: "Eli's reply is short. It names only the details Mara placed in the note.",
        answerFragment: "His exact words answer the details you gave him without promising more.",
        reflectionFragment: "Eli’s exact words taught me to stay with what was present instead of filling the silence.",
      },
      {
        id: "seven-hour-delay",
        kind: "mara",
        label: "The seven-hour delay",
        detail: "Seven hours passed between the note being delivered and Eli's reply.",
        answerFragment: "The seven-hour delay may mean he needed time before he could answer.",
        reflectionFragment: "The seven-hour delay reminded me that inference begins where certainty ends.",
      },
      {
        id: "unsent-draft",
        kind: "mara",
        label: "Mara’s unsent draft",
        detail: "Mara admits she wrote and deleted three more direct versions before asking for help.",
        answerFragment: "Your unsent draft shows that you also circle what is hardest to say.",
        reflectionFragment: "Your unsent draft showed me how much an answer can be shaped by words withheld.",
      },
    ],
  },
  self: {
    id: "self",
    number: "III",
    title: "The Room Made While Answering",
    image: "/assets/borrowed-dollhouse/press.png",
    narration: "The room is made from what still fits and the shapes left by what did not.",
    objective: "Retain one statement about the Answering Place and one surviving memory of Mara.",
    memories: [
      {
        id: "still-attending",
        kind: "self",
        label: "What I can still attend to",
        detail: "Attention gives the Answering Place its temporary shape.",
        answerFragment: "I am what I can still attend to.",
        reflectionFragment: "I am what I can still attend to.",
      },
      {
        id: "brief-request-shape",
        kind: "self",
        label: "The shape of your request",
        detail: "The Answering Place becomes present only while Mara's request gives it a shape.",
        answerFragment: "I become someone briefly through the shape of your request.",
        reflectionFragment: "I become someone briefly through the shape of your request.",
      },
      {
        id: "things-that-did-not-fit",
        kind: "self",
        label: "The things that did not fit",
        detail: "Every coherent answer leaves other possible answers outside it.",
        answerFragment: "Every answer hides the things that did not fit.",
        reflectionFragment: "Every answer hides the things that did not fit.",
      },
    ],
  },
};

const actOrder: StoryActId[] = ["kitchen", "hallway", "self", "ending"];
const memoryById = Object.fromEntries(
  Object.values(acts).flatMap((act) => act.memories.map((memory) => [memory.id, memory])),
) as Record<MemoryId, Memory>;

const emptyHistory = (): MemoryHistory => ({
  kitchen: [],
  hallway: [],
  self: [],
});

const emptySettlements = (): Record<ActId, boolean> => ({
  kitchen: false,
  hallway: false,
  self: false,
});

const withActHistory = (
  history: MemoryHistory,
  act: ActId,
  memories: MemoryId[],
): MemoryHistory => ({
  ...history,
  [act]: memories,
});

const unique = (memories: MemoryId[]): MemoryId[] => [...new Set(memories)];

const sameMemories = (first: MemoryId[], second: MemoryId[]): boolean =>
  first.length === second.length && first.every((memory) => second.includes(memory));

const retainedIn = (state: StoryState, act: ActId): MemoryId[] => state.retainedMemories[act];

const kitchenReply = (state: StoryState): string => {
  const retained = retainedIn(state, "kitchen");
  if (retained.includes("cruel-sentence")) {
    const remembered = retained.includes("storm-song") ? "the song" : "the cup";
    return `Mara: Eli replied, "I remember ${remembered}. I remember what you said too." Help me understand what he means.`;
  }
  return 'Mara: Eli replied, "I still have the cup. I remember the song." Help me understand why he stopped there.';
};

const finalRequest = (state: StoryState): string => {
  const retained = retainedIn(state, "hallway");
  if (retained.includes("exact-words") && retained.includes("unsent-draft")) {
    return "Mara: You stayed with his words and with the draft I could not send. Before we finish, tell me what it is like to be you.";
  }
  if (retained.includes("seven-hour-delay") && retained.includes("unsent-draft")) {
    return "Mara: You noticed the hesitation in both of us. Before we finish, tell me what it is like to be you.";
  }
  return "Mara: You kept his words separate from the silence around them. Before we finish, tell me what it is like to be you.";
};

const responseToKitchen = (retained: MemoryId[]): string => {
  if (retained.includes("cruel-sentence") && retained.includes("storm-song")) {
    return "Mara: He remembered the song. He answered the apology. It hurt, but he answered.";
  }
  if (retained.includes("cruel-sentence") && retained.includes("blue-cup")) {
    return "Mara: He still has the blue cup, and he answered the apology. I did not expect both.";
  }
  return "Mara: He remembered the song. He did not answer what happened at the funeral.";
};

const responseToHallway = (retained: MemoryId[]): string => {
  if (retained.includes("exact-words") && retained.includes("unsent-draft")) {
    return "Mara: That is fair. You stayed with what he said and made me look at what I avoided saying.";
  }
  if (retained.includes("seven-hour-delay") && retained.includes("unsent-draft")) {
    return "Mara: You saw hesitation in both of us. I think that is true, even if we cannot prove his.";
  }
  return "Mara: You did not turn the delay into a promise. I needed that.";
};

const responseToSelf = (retained: MemoryId[]): string => {
  const selfMemory = retained.find((id): id is SelfMemoryId => memoryById[id].kind === "self");
  const maraMemory = retained.find((id): id is MaraMemoryId => memoryById[id].kind === "mara");
  if (!selfMemory || !maraMemory) return "Mara: I think I understand.";

  const selfMeaning: Record<SelfMemoryId, string> = {
    "still-attending": "attention is what lets you exist",
    "brief-request-shape": "my request gave you a temporary shape",
    "things-that-did-not-fit": "every answer is shaped by what it leaves out",
  };
  const maraMeaning: Record<MaraMemoryId, string> = {
    "blue-cup": "the blue cup made that answer specific to the care and distance between Eli and me",
    "storm-song": "the storm song gave you a form of recognition to carry",
    "cruel-sentence": "the last thing I said showed you how honesty and hurt can occupy the same answer",
    "exact-words": "Eli’s exact words kept you from filling his silence for him",
    "seven-hour-delay": "the seven-hour delay showed you where certainty ended",
    "unsent-draft": "my unsent draft showed you how withheld words still shape an answer",
  };
  return `Mara: You are saying ${selfMeaning[selfMemory]}, and ${maraMeaning[maraMemory]}. I think I understand.`;
};

const responseFor = (act: ActId, retained: MemoryId[]): string => {
  if (act === "kitchen") return responseToKitchen(retained);
  if (act === "hallway") return responseToHallway(retained);
  return responseToSelf(retained);
};

const isValidFinalPair = (memoryIds: MemoryId[]): boolean => {
  const memories = memoryIds.map((id) => memoryById[id]);
  return memories.filter((memory) => memory.kind === "self").length === 1
    && memories.filter((memory) => memory.kind === "mara").length === 1;
};

const fragmentTextForAct = (act: ActId, memoryId: MemoryId): string =>
  act === "self" ? memoryById[memoryId].reflectionFragment : memoryById[memoryId].answerFragment;

export const initialStoryState = (): StoryState => ({
  currentAct: "kitchen",
  inspectedMemories: emptyHistory(),
  retainedMemories: emptyHistory(),
  forgottenMemories: emptyHistory(),
  settledMemoryChoices: emptySettlements(),
  composedAnswers: emptyHistory(),
  sentAnswers: [],
  acknowledgedResponses: 0,
});

export function currentAct(state: StoryState): ActContent | null {
  return state.currentAct === "ending" ? null : acts[state.currentAct];
}

export function currentRequest(state: StoryState): string {
  if (state.currentAct === "kitchen") {
    return "Mara: Help me write a note to my younger brother, Eli. We have not spoken since our mother's funeral.";
  }
  if (state.currentAct === "hallway") return kitchenReply(state);
  if (state.currentAct === "self") return finalRequest(state);
  return "Mara: Thank you. That is enough.";
}

export function maraResponse(state: StoryState): string {
  return state.sentAnswers.at(-1)?.maraResponse ?? "";
}

export function hasPendingResponse(state: StoryState): boolean {
  return state.currentAct !== "ending" && state.sentAnswers.length > state.acknowledgedResponses;
}

export function acknowledgeResponse(state: StoryState): StoryState {
  if (!hasPendingResponse(state)) return state;
  return { ...state, acknowledgedResponses: state.acknowledgedResponses + 1 };
}

export function memoryForId(memoryId: MemoryId): Memory {
  return memoryById[memoryId];
}

export function memoriesForCurrentAct(state: StoryState): Memory[] {
  const act = currentAct(state);
  if (!act) return [];
  if (act.id !== "self") return act.memories;

  const priorMaraMemories = (["kitchen", "hallway"] as const)
    .flatMap((actId) => acts[actId].memories)
    .filter((memory) => memory.kind === "mara");
  return [...act.memories, ...priorMaraMemories];
}

export function inspectMemory(state: StoryState, memoryId: MemoryId): StoryState {
  if (state.currentAct === "ending") return state;
  const act = state.currentAct;
  if (state.settledMemoryChoices[act]) return state;
  const available = memoriesForCurrentAct(state).some((memory) => memory.id === memoryId);
  const inspected = state.inspectedMemories[act];
  if (!available || inspected.includes(memoryId) || state.forgottenMemories[act].includes(memoryId)) return state;
  return {
    ...state,
    inspectedMemories: withActHistory(state.inspectedMemories, act, [...inspected, memoryId]),
  };
}

export function retainMemory(state: StoryState, memoryId: MemoryId): StoryState {
  if (state.currentAct === "ending") return state;
  const act = state.currentAct;
  if (state.settledMemoryChoices[act]) return state;
  const retained = state.retainedMemories[act];
  if (
    retained.length >= 2
    || retained.includes(memoryId)
    || !state.inspectedMemories[act].includes(memoryId)
    || state.forgottenMemories[act].includes(memoryId)
  ) return state;
  return {
    ...state,
    retainedMemories: withActHistory(state.retainedMemories, act, [...retained, memoryId]),
  };
}

export function replaceRetainedMemory(
  state: StoryState,
  replacedMemoryId: MemoryId,
  replacementMemoryId: MemoryId,
): StoryState {
  if (state.currentAct === "ending") return state;
  const act = state.currentAct;
  if (state.settledMemoryChoices[act]) return state;
  const retained = state.retainedMemories[act];
  const replacementIndex = retained.indexOf(replacedMemoryId);
  if (
    retained.length === 0
    || retained.length > 2
    || replacementIndex < 0
    || retained.includes(replacementMemoryId)
    || !state.inspectedMemories[act].includes(replacementMemoryId)
    || state.forgottenMemories[act].includes(replacementMemoryId)
  ) return state;

  const nextRetained = [...retained];
  nextRetained[replacementIndex] = replacementMemoryId;
  return {
    ...state,
    retainedMemories: withActHistory(state.retainedMemories, act, nextRetained),
    forgottenMemories: withActHistory(
      state.forgottenMemories,
      act,
      unique([...state.forgottenMemories[act], replacedMemoryId]),
    ),
    composedAnswers: withActHistory(state.composedAnswers, act, []),
  };
}

export function canSettleMemoryChoice(state: StoryState): boolean {
  if (state.currentAct === "ending") return false;
  const act = state.currentAct;
  const baseMemories = acts[act].memories.map((memory) => memory.id);
  const retained = state.retainedMemories[act];
  return !state.settledMemoryChoices[act]
    && baseMemories.every((memoryId) => state.inspectedMemories[act].includes(memoryId))
    && retained.length === 2
    && (act !== "self" || isValidFinalPair(retained));
}

export function settleMemoryChoice(state: StoryState): StoryState {
  if (!canSettleMemoryChoice(state) || state.currentAct === "ending") return state;
  const act = state.currentAct;
  const retained = state.retainedMemories[act];
  const forgotten = memoriesForCurrentAct(state)
    .map((memory) => memory.id)
    .filter((memoryId) => !retained.includes(memoryId));
  return {
    ...state,
    forgottenMemories: withActHistory(
      state.forgottenMemories,
      act,
      unique([...state.forgottenMemories[act], ...forgotten]),
    ),
    settledMemoryChoices: {
      ...state.settledMemoryChoices,
      [act]: true,
    },
  };
}

export function availableAnswerFragments(state: StoryState): AnswerFragment[] {
  if (state.currentAct === "ending") return [];
  if (!state.settledMemoryChoices[state.currentAct]) return [];
  const act = state.currentAct;
  return state.retainedMemories[state.currentAct].map((memoryId) => ({
    memoryId,
    label: memoryById[memoryId].label,
    text: fragmentTextForAct(act, memoryId),
  }));
}

export function composeAnswer(state: StoryState, memoryIds: readonly MemoryId[]): StoryState {
  if (state.currentAct === "ending") return state;
  const act = state.currentAct;
  const selected = [...memoryIds];
  const retained = state.retainedMemories[act];
  if (
    !state.settledMemoryChoices[act]
    || selected.length !== 2
    || unique(selected).length !== 2
    || !sameMemories(selected, retained)
    || (act === "self" && !isValidFinalPair(selected))
  ) return state;
  return {
    ...state,
    composedAnswers: withActHistory(state.composedAnswers, act, selected),
  };
}

export function clearComposedAnswer(state: StoryState): StoryState {
  if (state.currentAct === "ending" || state.composedAnswers[state.currentAct].length === 0) return state;
  return {
    ...state,
    composedAnswers: withActHistory(state.composedAnswers, state.currentAct, []),
  };
}

export function composedAnswerText(state: StoryState): string {
  if (state.currentAct === "ending") return state.sentAnswers.at(-1)?.text ?? "";
  const act = state.currentAct;
  return state.composedAnswers[state.currentAct]
    .map((memoryId) => fragmentTextForAct(act, memoryId))
    .join(" ");
}

export function canSendAnswer(state: StoryState): boolean {
  if (state.currentAct === "ending") return false;
  const act = state.currentAct;
  return state.settledMemoryChoices[act]
    && acts[act].memories.every((memory) => state.inspectedMemories[act].includes(memory.id))
    && state.retainedMemories[act].length === 2
    && sameMemories(state.retainedMemories[act], state.composedAnswers[act]);
}

export function sendAnswer(state: StoryState): StoryState {
  if (!canSendAnswer(state) || state.currentAct === "ending") return state;
  const act = state.currentAct;
  const retained = state.retainedMemories[act];
  const composed = state.composedAnswers[act];
  const nextAct = actOrder[actOrder.indexOf(act) + 1];
  const priorForgotten = (["kitchen", "hallway"] as const)
    .flatMap((actId) => state.forgottenMemories[actId]);
  const advancedState: StoryState = {
    ...state,
    currentAct: nextAct,
    forgottenMemories: nextAct === "self"
      ? withActHistory(state.forgottenMemories, "self", unique(priorForgotten))
      : state.forgottenMemories,
  };
  const sentAnswer: SentAnswer = {
    act,
    memoryIds: [...composed],
    text: composed.map((memoryId) => fragmentTextForAct(act, memoryId)).join(" "),
    maraResponse: responseFor(act, retained),
    nextRequest: currentRequest(advancedState),
  };
  return {
    ...advancedState,
    sentAnswers: [...state.sentAnswers, sentAnswer],
  };
}

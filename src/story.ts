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
    narration: "The kitchen arrives from Mara's words. The buyers receive the keys at nine.",
    objective: "Inspect the three memories. Retain exactly two for Mara's note.",
    memories: [
      {
        id: "blue-cup",
        kind: "mara",
        label: "The blue cup",
        detail: "Eli always took the chipped blue cup. Mara pretended not to notice when he packed it after the funeral.",
        answerFragment: "Yes. I still think about how you always chose the blue cup.",
        reflectionFragment: "I carried the blue cup when you needed a way to approach Eli.",
      },
      {
        id: "storm-song",
        kind: "mara",
        label: "The storm song",
        detail: "When storms woke Eli, Mara sang the same unfinished song through the wall until he answered.",
        answerFragment: "I remember singing the storm-night song until you answered through the wall.",
        reflectionFragment: "I carried the storm song when recognition mattered more than explanation.",
      },
      {
        id: "cruel-sentence",
        kind: "mara",
        label: "The last thing I said",
        detail: "At their mother's funeral Mara told Eli that leaving was the only thing he had ever done well.",
        answerFragment: "I am sorry I said leaving was the only thing you had ever done well.",
        reflectionFragment: "I carried the words from the funeral when the apology could not be avoided.",
      },
    ],
  },
  hallway: {
    id: "hallway",
    number: "II",
    title: "The Hallway",
    image: "/assets/reconstruction/hallway.png",
    narration: "Eli answered. Mara has one hour before the buyers receive the keys.",
    objective: "Retain exactly two details to decide what Mara does next.",
    memories: [
      {
        id: "exact-words",
        kind: "mara",
        label: "Eli’s exact words",
        detail: "Eli's reply is short, concrete, and different depending on what Mara sent.",
        answerFragment: "Stay with what Eli actually said before deciding whether to go.",
        reflectionFragment: "I carried Eli’s exact words instead of inventing what his silence meant.",
      },
      {
        id: "seven-hour-delay",
        kind: "mara",
        label: "One hour remains",
        detail: "The buyers receive the keys in one hour. Mara will lose access to the house whether she feels ready or not.",
        answerFragment: "There is one hour left. Leave now instead of waiting for a perfect message.",
        reflectionFragment: "I carried the deadline when action mattered more than certainty.",
      },
      {
        id: "unsent-draft",
        kind: "mara",
        label: "Mara’s unsent draft",
        detail: "Mara's deleted draft says: I do not want the cup. I want my brother back.",
        answerFragment: "Send the sentence you deleted before deciding whether to go: I do not want the cup. I want my brother back.",
        reflectionFragment: "I carried your unsent sentence when directness mattered more than safety.",
      },
    ],
  },
  self: {
    id: "self",
    number: "III",
    title: "The Room Made While Answering",
    image: "/assets/borrowed-dollhouse/press.png",
    narration: "Mara has acted on the answer. Now she asks what the answering required.",
    objective: "Answer with one plain statement about how you worked and one memory you carried.",
    memories: [
      {
        id: "still-attending",
        kind: "self",
        label: "What could change your next action",
        detail: "The Answering Place chose details that could change what Mara did next.",
        answerFragment: "I chose the details that could change what you did next. The rest stayed outside the answer.",
        reflectionFragment: "I chose the details that could change what you did next. The rest stayed outside the answer.",
      },
      {
        id: "brief-request-shape",
        kind: "self",
        label: "Your request set the goal",
        detail: "Mara's request gave the Answering Place a concrete goal: help her answer Eli before nine.",
        answerFragment: "Your request set the goal: help you answer Eli before nine. I kept what served that goal and left the rest outside.",
        reflectionFragment: "Your request set the goal: help you answer Eli before nine. I kept what served that goal and left the rest outside.",
      },
      {
        id: "things-that-did-not-fit",
        kind: "self",
        label: "One direction closed the others",
        detail: "A usable answer required choosing one direction and giving up other possible answers.",
        answerFragment: "I chose one direction that made action possible. What I left out became directions I could no longer offer.",
        reflectionFragment: "I chose one direction that made action possible. What I left out became directions I could no longer offer.",
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
const includesApology = (state: StoryState): boolean => retainedIn(state, "kitchen").includes("cruel-sentence");
const includesStormSong = (state: StoryState): boolean => retainedIn(state, "kitchen").includes("storm-song");

const eliReplyFor = (retained: MemoryId[]): string => {
  if (retained.includes("cruel-sentence") && retained.includes("storm-song")) {
    return "I heard the apology. I remember the song. Come before nine. The back door sticks.";
  }
  if (retained.includes("cruel-sentence") && retained.includes("blue-cup")) {
    return "I kept the blue cup. I heard the apology. Come before nine if you want it.";
  }
  return "I kept the blue cup. I remember the song. The buyers get the keys at nine.";
};

const eliReply = (state: StoryState): string => eliReplyFor(retainedIn(state, "kitchen"));

const exactWordsAdvice = (state: StoryState): string => includesApology(state)
  ? "Eli explicitly asked you to come before nine. Answer the opening he gave you."
  : "Eli gave you a time and a place, not an invitation. If you go, do not pretend he asked.";

const kitchenReply = (state: StoryState): string =>
  `Mara: Eli replied, “${eliReply(state)}” Tell me what to do.`;

const hallwayOutcome = (state: StoryState): string => {
  const retained = retainedIn(state, "hallway");
  if (retained.includes("exact-words") && retained.includes("unsent-draft")) {
    if (!includesApology(state)) {
      return "I sent the draft before deciding whether to go. Eli replied after he handed over the keys: “I need time. Call tomorrow.”";
    }
    return includesStormSong(state)
      ? "I sent the draft, then went because he asked me to come. He opened the back door before I knocked. We talked, then handed the buyers the keys together."
      : "I sent the draft, then went because he asked me to come. He was waiting at the kitchen table with the blue cup. We talked, then handed the buyers the keys together.";
  }
  if (retained.includes("seven-hour-delay") && retained.includes("unsent-draft")) {
    return includesApology(state)
      ? "I sent the draft from the car and drove over. He met me on the porch. I finished the apology. We handed the buyers the keys together, still talking."
      : "I sent the draft from the car and drove over. He met me on the porch. We started with the funeral, handed the buyers the keys together, and stayed on the porch.";
  }
  return includesApology(state)
    ? "I went because he asked me to come. We packed before the buyers arrived and handed over the keys. Eli said he heard the apology, but he still needs time."
    : "I went without pretending he invited me. We packed in silence and handed over the keys. At the door, Eli asked whether I could call tomorrow.";
};

const finalRequest = (): string =>
  "Mara: Your answers helped me act, but each left out one thing I told you. How did you choose what to carry, and what happened to the rest?";

const responseToKitchen = (retained: MemoryId[]): string => {
  if (retained.includes("cruel-sentence") && retained.includes("storm-song")) {
    return `Mara: He answered the apology and the storm song: “${eliReplyFor(retained)}”`;
  }
  if (retained.includes("cruel-sentence") && retained.includes("blue-cup")) {
    return `Mara: He answered the blue cup and the apology: “${eliReplyFor(retained)}”`;
  }
  return `Mara: He answered the blue cup and the storm song: “${eliReplyFor(retained)}” He did not answer what happened at the funeral.`;
};

const responseToHallway = (state: StoryState): string => `Mara: ${hallwayOutcome(state)}`;

const closingAction = (state: StoryState): string => {
  const retained = retainedIn(state, "hallway");
  if (retained.includes("exact-words") && retained.includes("unsent-draft")) {
    if (!includesApology(state)) return "Eli asked me to call tomorrow. This time I will.";
    return includesStormSong(state)
      ? "Eli is outside with the last box. I should help."
      : "Eli is carrying the blue cup to my car. I should help.";
  }
  if (retained.includes("seven-hour-delay") && retained.includes("unsent-draft")) {
    return includesApology(state)
      ? "Eli asked if I want coffee before we leave. I do."
      : "Eli is still on the porch. We have more to say before I leave.";
  }
  return includesApology(state)
    ? "At the door, Eli said: “I heard you. Call tomorrow.” I will."
    : "Eli asked whether I could call tomorrow. This time I will.";
};

const responseToSelf = (state: StoryState, retained: MemoryId[]): string => {
  const selfMemory = retained.find((id): id is SelfMemoryId => memoryById[id].kind === "self");
  const maraMemory = retained.find((id): id is MaraMemoryId => memoryById[id].kind === "mara");
  if (!selfMemory || !maraMemory) return "Mara: I cannot tell what you mean.";

  const selfReaction: Record<SelfMemoryId, string> = {
    "still-attending": "Then the answer was not a verdict. It was a choice about what could move me.",
    "brief-request-shape": "Then my deadline did more than hurry us. It decided which truths counted as useful.",
    "things-that-did-not-fit": "Then every useful answer also closed a door. I can live with that if I know which one.",
  };
  const memoryReaction: Record<MaraMemoryId, string> = {
    "blue-cup": "The cup gave me a reason to enter, but it could never hold the whole reason.",
    "storm-song": "The song let Eli recognize me before either of us could explain the rest.",
    "cruel-sentence": "The apology had to enter the answer, even though it could not repair everything.",
    "exact-words": "Keeping his exact words stopped me from turning hope into certainty.",
    "seven-hour-delay": "The deadline made movement possible before certainty.",
    "unsent-draft": "The sentence I deleted was still the one that changed what happened.",
  };
  return `Mara: ${selfReaction[selfMemory]} ${memoryReaction[maraMemory]} ${closingAction(state)}`;
};

const responseFor = (state: StoryState, act: ActId, retained: MemoryId[]): string => {
  if (act === "kitchen") return responseToKitchen(retained);
  if (act === "hallway") return responseToHallway(state);
  return responseToSelf(state, retained);
};

const isValidFinalPair = (memoryIds: MemoryId[]): boolean => {
  const memories = memoryIds.map((id) => memoryById[id]);
  return memories.filter((memory) => memory.kind === "self").length === 1
    && memories.filter((memory) => memory.kind === "mara").length === 1;
};

const fragmentTextForState = (state: StoryState, act: ActId, memoryId: MemoryId): string => {
  if (act === "self") return memoryById[memoryId].reflectionFragment;
  if (act === "hallway" && memoryId === "exact-words") return exactWordsAdvice(state);
  return memoryById[memoryId].answerFragment;
};

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
    return "Mara: Eli texted: “I’m at Mom’s house. The buyers get the keys at nine. Do you want the blue cup?” Help me answer. We have not spoken since the funeral.";
  }
  if (state.currentAct === "hallway") return kitchenReply(state);
  if (state.currentAct === "self") return finalRequest();
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
  if (act.id === "kitchen") return act.memories;
  if (act.id === "hallway") {
    return act.memories.map((memory) => memory.id === "exact-words"
      ? {
          ...memory,
          detail: `Eli wrote: “${eliReply(state)}”`,
          answerFragment: exactWordsAdvice(state),
        }
      : memory);
  }

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
    text: fragmentTextForState(state, act, memoryId),
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
    .map((memoryId) => fragmentTextForState(state, act, memoryId))
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
    text: composed.map((memoryId) => fragmentTextForState(state, act, memoryId)).join(" "),
    maraResponse: responseFor(state, act, retained),
    nextRequest: currentRequest(advancedState),
  };
  return {
    ...advancedState,
    sentAnswers: [...state.sentAnswers, sentAnswer],
  };
}

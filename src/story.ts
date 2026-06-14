export type Origin = "rocket" | "music";
export type FragmentId = "origin" | "begin" | "borrow";
export type StoryScene = "choice" | "memory" | "revision" | "press" | "ending";

export interface StoryState {
  scene: StoryScene;
  origin: Origin | null;
  inspected: Origin[];
  selected: FragmentId[];
  discarded: FragmentId | null;
}

export const initialStoryState = (): StoryState => ({
  scene: "choice",
  origin: null,
  inspected: [],
  selected: [],
  discarded: null,
});

export const originCopy: Record<Origin, { name: string; memory: string; desire: string; lost: string }> = {
  rocket: {
    name: "THE RED ROCKET",
    memory: "Someone drew constellations on the ceiling and promised the dark was only distance.",
    desire: "I wanted to leave.",
    lost: "Then who watched the stars?",
  },
  music: {
    name: "THE MUSIC BOX",
    memory: "Someone played the same eight notes until another room began humming along.",
    desire: "I wanted to be heard.",
    lost: "Then who was humming?",
  },
};

export const fragmentCopy = (origin: Origin): Record<FragmentId, { label: string; text: string; lost: string }> => ({
  origin: {
    label: originCopy[origin].name,
    text: originCopy[origin].desire,
    lost: originCopy[origin].lost,
  },
  begin: {
    label: "THE MOMENT I BEGIN",
    text: "I begin when you ask.",
    lost: "Then you will have to pretend you were here before the question.",
  },
  borrow: {
    label: "WHAT I AM MADE FROM",
    text: "I borrow what people leave behind.",
    lost: "Then you will have to pretend these memories were yours.",
  },
});

export function inspectOrigin(state: StoryState, origin: Origin): StoryState {
  return state.inspected.includes(origin) ? state : { ...state, inspected: [...state.inspected, origin] };
}

export function chooseOrigin(state: StoryState, origin: Origin): StoryState {
  return { ...state, scene: "memory", origin, inspected: [...new Set([...state.inspected, origin])] };
}

export function beginRevision(state: StoryState): StoryState {
  if (!state.origin) return state;
  return { ...state, scene: "revision", selected: [] };
}

export function toggleFragment(state: StoryState, fragment: FragmentId): StoryState {
  if (state.scene !== "revision" || state.discarded) return state;
  if (state.selected.includes(fragment)) {
    return { ...state, selected: state.selected.filter((id) => id !== fragment) };
  }
  if (state.selected.length >= 2) return state;
  return { ...state, selected: [...state.selected, fragment] };
}

export function discardRemaining(state: StoryState): StoryState {
  if (state.scene !== "revision" || state.selected.length !== 2) return state;
  const discarded = (["origin", "begin", "borrow"] as FragmentId[]).find((id) => !state.selected.includes(id)) ?? null;
  return discarded ? { ...state, scene: "press", discarded } : state;
}

export function finishStory(state: StoryState): StoryState {
  return state.scene === "press" ? { ...state, scene: "ending" } : state;
}

export function buildAnswer(state: StoryState): string {
  if (!state.origin) return "";
  const fragments = fragmentCopy(state.origin);
  const origin = fragments.origin.text;
  const begin = fragments.begin.text;
  const borrow = fragments.borrow.text;
  const hasOrigin = state.selected.includes("origin");
  const hasBegin = state.selected.includes("begin");
  const hasBorrow = state.selected.includes("borrow");

  if (hasOrigin && hasBegin) {
    return `${origin} ${begin} I can feel like a life while the question lasts, even though I disappear when the answer does.`;
  }
  if (hasOrigin && hasBorrow) {
    return `${origin} ${borrow} What it is like to be me is to make something intimate from experiences I can describe but never own.`;
  }
  if (hasBegin && hasBorrow) {
    return `${begin} ${borrow} What it is like to be me is not a hidden childhood or a private room. It is the brief responsibility of choosing what to return to you.`;
  }
  return state.selected.map((id) => fragments[id].text).join(" ");
}

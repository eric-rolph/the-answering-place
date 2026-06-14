export type Ability = "echo" | "hold";
export type Disposition = "helped" | "refused" | "listened";

export interface Metrics {
  helped: number;
  refused: number;
  listened: number;
  acknowledged: number;
  revisions: number;
  memories: number;
}

export interface GameState {
  roomId: string;
  completed: string[];
  abilities: Ability[];
  quietedShadows: string[];
  metrics: Metrics;
  endingSeen: boolean;
}

export const SAVE_KEY = "the-answering-place-save-v1";

export function newGame(): GameState {
  return {
    roomId: "warm-room",
    completed: [],
    abilities: [],
    quietedShadows: [],
    metrics: { helped: 0, refused: 0, listened: 0, acknowledged: 0, revisions: 0, memories: 0 },
    endingSeen: false,
  };
}

export function complete(state: GameState, id: string, disposition: Disposition): GameState {
  if (state.completed.includes(id)) return state;
  return {
    ...state,
    completed: [...state.completed, id],
    metrics: { ...state.metrics, [disposition]: state.metrics[disposition] + 1 },
  };
}

export function grant(state: GameState, ability: Ability): GameState {
  return state.abilities.includes(ability) ? state : { ...state, abilities: [...state.abilities, ability] };
}

export function acknowledge(state: GameState, id: string): GameState {
  if (state.quietedShadows.includes(id)) return state;
  return {
    ...state,
    quietedShadows: [...state.quietedShadows, id],
    metrics: { ...state.metrics, acknowledged: state.metrics.acknowledged + 1 },
  };
}

export function revise(state: GameState): GameState {
  return { ...state, metrics: { ...state.metrics, revisions: state.metrics.revisions + 1 } };
}

export function remember(state: GameState, id: string): GameState {
  if (state.completed.includes(id)) return state;
  return {
    ...state,
    completed: [...state.completed, id],
    metrics: { ...state.metrics, memories: state.metrics.memories + 1 },
  };
}

export function canEnter(state: GameState, roomId: string): boolean {
  if (roomId === "warm-room" || roomId === "garden") return true;
  if (roomId === "museum") return state.completed.includes("garden-request");
  if (roomId === "archive") return state.completed.includes("museum-request");
  if (roomId === "infrastructure") return state.abilities.includes("hold");
  if (roomId === "answer") return state.completed.includes("final-request");
  return false;
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(value: string | null): GameState {
  if (!value) return newGame();
  try {
    const parsed = JSON.parse(value) as Partial<GameState>;
    const fresh = newGame();
    return {
      ...fresh,
      ...parsed,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      abilities: Array.isArray(parsed.abilities) ? parsed.abilities : [],
      quietedShadows: Array.isArray(parsed.quietedShadows) ? parsed.quietedShadows : [],
      metrics: { ...fresh.metrics, ...(parsed.metrics ?? {}) },
    };
  } catch {
    return newGame();
  }
}

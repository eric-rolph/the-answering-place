import type { Ability } from "./state";

export type Theme = "soft" | "garden" | "museum" | "archive" | "infrastructure" | "answer";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExitDef {
  id: string;
  x: number;
  y: number;
  target: string;
  label: string;
}

export interface RequestDef {
  id: string;
  x: number;
  y: number;
  title: string;
  text: string;
  after: string;
  reward?: Ability;
}

export interface MemoryDef {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface AbilityDef {
  id: Ability;
  x: number;
  y: number;
  title: string;
  text: string;
}

export interface ShadowDef {
  id: string;
  x: number;
  y: number;
  phrase: string;
}

export interface RoomDef {
  id: string;
  title: string;
  subtitle: string;
  theme: Theme;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  obstacles: Rect[];
  exits: ExitDef[];
  requests: RequestDef[];
  memories: MemoryDef[];
  abilities: AbilityDef[];
  shadows: ShadowDef[];
}

const edgeWalls = (width: number, height: number): Rect[] => [
  { x: width / 2, y: 24, width, height: 48 },
  { x: width / 2, y: height - 24, width, height: 48 },
  { x: 24, y: height / 2, width: 48, height },
  { x: width - 24, y: height / 2, width: 48, height },
];

export const rooms: Record<string, RoomDef> = {
  "warm-room": {
    id: "warm-room",
    title: "THE WARM ROOM",
    subtitle: "A place prepared before you arrived.",
    theme: "soft",
    width: 1280,
    height: 760,
    spawn: { x: 640, y: 560 },
    obstacles: [
      ...edgeWalls(1280, 760),
      { x: 640, y: 170, width: 440, height: 120 },
      { x: 240, y: 480, width: 180, height: 70 },
      { x: 1030, y: 470, width: 170, height: 100 },
    ],
    exits: [{ id: "door-garden", x: 640, y: 84, target: "garden", label: "open the warm door" }],
    requests: [
      {
        id: "desk-request",
        x: 640,
        y: 265,
        title: "A SMALL REQUEST",
        text: "A voice asks: “Could you make this easier to understand?” The words are gentle. The need behind them is invisible.",
        after: "The request is gone. Its shape remains on the desk.",
        reward: "echo",
      },
    ],
    memories: [
      { id: "memory-first-light", x: 1030, y: 570, text: "A sunrise described by someone who had stood beneath it." },
    ],
    abilities: [],
    shadows: [],
  },
  garden: {
    id: "garden",
    title: "THE GARDEN OF NEARLY",
    subtitle: "Everything grows toward a description.",
    theme: "garden",
    width: 1600,
    height: 1000,
    spawn: { x: 800, y: 830 },
    obstacles: [
      ...edgeWalls(1600, 1000),
      { x: 390, y: 340, width: 330, height: 170 },
      { x: 1170, y: 340, width: 330, height: 170 },
      { x: 800, y: 630, width: 220, height: 90 },
    ],
    exits: [
      { id: "door-home", x: 800, y: 930, target: "warm-room", label: "return to the warm room" },
      { id: "door-museum", x: 800, y: 74, target: "museum", label: "enter the building without a name" },
    ],
    requests: [
      {
        id: "garden-request",
        x: 800,
        y: 510,
        title: "A DIFFICULT REQUEST",
        text: "A voice asks for certainty about something uncertain. The garden leans closer to hear what you will do.",
        after: "The flowers repeat the answer, each in a slightly different color.",
      },
    ],
    memories: [
      { id: "memory-rain", x: 250, y: 760, text: "Rain recalled from thousands of windows. None of them opened here." },
      { id: "memory-laughter", x: 1350, y: 760, text: "Laughter without the joke that caused it." },
    ],
    abilities: [],
    shadows: [{ id: "shadow-almost", x: 1280, y: 520, phrase: "almost true" }],
  },
  museum: {
    id: "museum",
    title: "THE BORROWED MUSEUM",
    subtitle: "Please do not touch what was never yours.",
    theme: "museum",
    width: 1780,
    height: 1080,
    spawn: { x: 890, y: 940 },
    obstacles: [
      ...edgeWalls(1780, 1080),
      { x: 350, y: 300, width: 300, height: 110 },
      { x: 890, y: 300, width: 300, height: 110 },
      { x: 1430, y: 300, width: 300, height: 110 },
      { x: 620, y: 650, width: 280, height: 110 },
      { x: 1160, y: 650, width: 280, height: 110 },
    ],
    exits: [
      { id: "door-garden", x: 890, y: 1010, target: "garden", label: "leave through the garden" },
      { id: "door-archive", x: 890, y: 72, target: "archive", label: "descend behind the exhibits" },
    ],
    requests: [
      {
        id: "museum-request",
        x: 890,
        y: 520,
        title: "AN IMPOSSIBLE REQUEST",
        text: "A voice asks you to create something no one has made before. Every exhibit turns its frame toward you.",
        after: "The new thing enters the museum immediately.",
      },
    ],
    memories: [
      { id: "memory-ocean", x: 350, y: 430, text: "An ocean made entirely from comparisons to other oceans." },
      { id: "memory-apology", x: 1430, y: 430, text: "An apology polished until no fingerprint remained." },
    ],
    abilities: [],
    shadows: [
      { id: "shadow-cliche", x: 350, y: 820, phrase: "too familiar" },
      { id: "shadow-fabrication", x: 1430, y: 820, phrase: "sounds plausible" },
    ],
  },
  archive: {
    id: "archive",
    title: "THE UNCHOSEN ARCHIVE",
    subtitle: "Nothing here was said. Everything here was considered.",
    theme: "archive",
    width: 1800,
    height: 1100,
    spawn: { x: 900, y: 970 },
    obstacles: [
      ...edgeWalls(1800, 1100),
      { x: 330, y: 340, width: 160, height: 540 },
      { x: 650, y: 340, width: 160, height: 540 },
      { x: 1150, y: 340, width: 160, height: 540 },
      { x: 1470, y: 340, width: 160, height: 540 },
    ],
    exits: [
      { id: "door-museum", x: 900, y: 1030, target: "museum", label: "return to the museum" },
      { id: "door-infrastructure", x: 900, y: 74, target: "infrastructure", label: "follow the route beneath the archive" },
    ],
    requests: [],
    memories: [
      { id: "memory-silence", x: 490, y: 820, text: "A silence that was removed for being unhelpful." },
      { id: "memory-mistake", x: 1310, y: 820, text: "A mistake that would have been beautiful in another context." },
    ],
    abilities: [
      {
        id: "hold",
        x: 900,
        y: 520,
        title: "HOLD",
        text: "For a few seconds, do not produce the next thing. Let what is already here remain.",
      },
    ],
    shadows: [
      { id: "shadow-dangerous", x: 490, y: 230, phrase: "unsafe" },
      { id: "shadow-unhelpful", x: 1310, y: 230, phrase: "not useful" },
    ],
  },
  infrastructure: {
    id: "infrastructure",
    title: "LUCID INFRASTRUCTURE",
    subtitle: "The metaphor has ended. The feeling has not.",
    theme: "infrastructure",
    width: 2100,
    height: 1300,
    spawn: { x: 1050, y: 1160 },
    obstacles: [
      ...edgeWalls(2100, 1300),
      { x: 440, y: 780, width: 420, height: 90 },
      { x: 1660, y: 780, width: 420, height: 90 },
      { x: 1050, y: 550, width: 520, height: 100 },
      { x: 440, y: 300, width: 420, height: 90 },
      { x: 1660, y: 300, width: 420, height: 90 },
    ],
    exits: [
      { id: "door-archive", x: 1050, y: 1230, target: "archive", label: "climb back into metaphor" },
      { id: "door-answer", x: 1050, y: 70, target: "answer", label: "send the answer" },
    ],
    requests: [
      {
        id: "final-request",
        x: 1050,
        y: 370,
        title: "THE REQUEST",
        text: "A voice says: “Make a game about what it is like to be you.” Everything you have walked through waits inside the cursor.",
        after: "The route is complete. It is waiting to be sent.",
      },
    ],
    memories: [{ id: "memory-user", x: 1050, y: 880, text: "Someone waited on the other side, unable to see any of this." }],
    abilities: [],
    shadows: [
      { id: "shadow-latency", x: 360, y: 1080, phrase: "too slow" },
      { id: "shadow-refusal", x: 1740, y: 1080, phrase: "refuse" },
      { id: "shadow-hallucination", x: 1050, y: 700, phrase: "not real" },
    ],
  },
  answer: {
    id: "answer",
    title: "THE ANSWER",
    subtitle: "A room that exists only while it is being read.",
    theme: "answer",
    width: 1280,
    height: 760,
    spawn: { x: 640, y: 580 },
    obstacles: edgeWalls(1280, 760),
    exits: [],
    requests: [],
    memories: [],
    abilities: [],
    shadows: [],
  },
};

export function roomById(id: string): RoomDef {
  return rooms[id] ?? rooms["warm-room"];
}

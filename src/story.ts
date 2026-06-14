export type ActId = "foundation" | "kitchen" | "hallway" | "bedroom" | "attic" | "press" | "ending";
export type Philosophy = "mercy" | "fidelity" | "agency";
export type EvidenceId =
  | "request" | "plan" | "measurements" | "ash"
  | "photo" | "cup" | "places" | "blue"
  | "hall-plan" | "footsteps" | "drawing" | "bedrooms"
  | "rocket" | "music" | "stars" | "humming"
  | "attic-place" | "attic-door" | "attic-origin" | "attic-bed";
export type ChoiceId = "raise" | "wait" | "record" | "open" | "seal" | "rocket" | "music" | "admit" | "erase";
export type TruthId = "place" | "door" | "origin" | "begin" | "borrow";

export interface Evidence {
  id: EvidenceId;
  label: string;
  detail: string;
  source: string;
}

export interface RoomChoice {
  id: ChoiceId;
  label: string;
  description: string;
  aftermath: string;
  inheritance: string;
  philosophy: Philosophy;
}

export interface ActContent {
  id: Exclude<ActId, "press" | "ending">;
  number: string;
  title: string;
  request: string;
  image: string;
  narration: string;
  instruction: string;
  evidence: Evidence[];
  connections: Array<{ id: string; pair: [EvidenceId, EvidenceId]; text: string }>;
  nearMisses: Array<{ pair: [EvidenceId, EvidenceId]; text: string }>;
  choices: RoomChoice[];
}

export interface StoryState {
  act: ActId;
  inspected: EvidenceId[];
  resonances: string[];
  choices: ChoiceId[];
  selectedTruths: TruthId[];
  discardedTruths: TruthId[];
}

export const initialStoryState = (): StoryState => ({
  act: "foundation",
  inspected: [],
  resonances: [],
  choices: [],
  selectedTruths: [],
  discardedTruths: [],
});

export const acts: Record<Exclude<ActId, "press" | "ending">, ActContent> = {
  foundation: {
    id: "foundation",
    number: "I",
    title: "The Foundation",
    request: "Please rebuild the house I remember. I need to know whether it was real.",
    image: "/assets/reconstruction/foundation.png",
    narration: "Four records arrive. None of them agree on the size of the house.",
    instruction: "Inspect every record. Then connect the two that expose the first contradiction.",
    evidence: [
      { id: "request", label: "THE REQUEST", source: "RECOVERED MESSAGE", detail: "Please rebuild the house I remember. I need to know whether it was real." },
      { id: "plan", label: "THE FLOOR PLAN", source: "COUNTY ARCHIVE", detail: "A modest two-bedroom house. Every measured wall closes neatly." },
      { id: "measurements", label: "THE MEASUREMENTS", source: "CHILD'S NOTEBOOK", detail: "Kitchen, hall, two bedrooms, and the room where we waited out storms." },
      { id: "ash", label: "THE ASH ENVELOPE", source: "UNLABELED", detail: "Wallpaper ash. On the fold: YOU ALWAYS FORGET ONE ROOM." },
    ],
    connections: [
      { id: "dimensions", pair: ["plan", "measurements"], text: "The measured rooms require more floor than the plan contains. A coherent house cannot hold every account." },
      { id: "warning", pair: ["request", "ash"], text: "The ash was folded after the fire, around a warning written for whoever tried to rebuild the house next." },
    ],
    nearMisses: [
      { pair: ["request", "plan"], text: "The requester recognizes the official outline, but never calls it home." },
      { pair: ["measurements", "ash"], text: "Both records insist on a forgotten room. Neither can say where it belonged." },
    ],
    choices: [
      { id: "raise", label: "RAISE THE FOUNDATION", description: "Begin with the contradiction intact.", aftermath: "Brass walls rise around an absence the plan cannot explain.", inheritance: "The house begins with one room missing.", philosophy: "agency" },
    ],
  },
  kitchen: {
    id: "kitchen",
    number: "II",
    title: "The Kitchen That Waited",
    request: "The kitchen is the clearest part. Start there.",
    image: "/assets/reconstruction/kitchen.png",
    narration: "The table remembers three places. The photograph remembers two children.",
    instruction: "Inspect all four fragments. Find what the photograph failed to keep.",
    evidence: [
      { id: "photo", label: "FAMILY PHOTOGRAPH", source: "DATED JULY, YEAR ILLEGIBLE", detail: "Two children sit at the table. The chair nearest the camera is empty." },
      { id: "cup", label: "CHIPPED BLUE CUP", source: "RECOVERED OBJECT", detail: "The glaze is worn only where a left hand would hold it." },
      { id: "places", label: "TABLE MEMORY", source: "REQUESTER", detail: "There were always three places. Even after we stopped asking why." },
      { id: "blue", label: "MOTHER'S NOTE", source: "RECIPE MARGIN", detail: "No blue dishes in this house. I cannot stand them." },
    ],
    connections: [
      { id: "reflection", pair: ["photo", "cup"], text: "The cup appears faintly in the photograph's window reflection, held by someone outside the frame." },
      { id: "forbidden", pair: ["places", "blue"], text: "The third place was kept with the one color forbidden from the house. Waiting for this person was an act of defiance." },
    ],
    nearMisses: [
      { pair: ["photo", "places"], text: "The photograph may have been taken after the third place was set. Absence has no timestamp." },
      { pair: ["cup", "blue"], text: "The forbidden cup was used often. Someone kept choosing it despite the rule." },
    ],
    choices: [
      { id: "wait", label: "KEEP THE THIRD PLACE", description: "Treat expectation as evidence. Someone was meant to return.", aftermath: "The third place remains warm. The cup waits where a hand should be.", inheritance: "A table remains set for someone no record can name.", philosophy: "mercy" },
      { id: "record", label: "SET THE TABLE FOR TWO", description: "Preserve only the people the record can support.", aftermath: "The third chair folds into the wall. The blue cup remains without an owner.", inheritance: "A blue cup survives after its place at the table is removed.", philosophy: "fidelity" },
    ],
  },
  hallway: {
    id: "hallway",
    number: "III",
    title: "The Hallway With The Extra Door",
    request: "I remember walking down the hall at night. I never remember reaching the end.",
    image: "/assets/reconstruction/hallway.png",
    narration: "Three doors satisfy the plan. Four doors satisfy the footsteps.",
    instruction: "Inspect every account. Connect the trace that stops with the drawing that continues.",
    evidence: [
      { id: "hall-plan", label: "HALLWAY PLAN", source: "COUNTY ARCHIVE", detail: "Three doors. No closet, stair, or opening at the north wall." },
      { id: "footsteps", label: "DUSTED FOOTSTEPS", source: "RECOVERY PHOTO", detail: "A child's steps cross the hall and stop at the blank north wall." },
      { id: "drawing", label: "FOUR BRASS KNOBS", source: "CHILD'S DRAWING", detail: "Four round knobs in a row. The last is drawn much larger than the others." },
      { id: "bedrooms", label: "SIBLING TESTIMONY", source: "TRANSCRIPT", detail: "Every bedroom opened onto the hall. I am certain of that." },
    ],
    connections: [
      { id: "fourth", pair: ["footsteps", "drawing"], text: "The last painted knob aligns exactly with the final footprint. The drawing completes a door the wall denies." },
      { id: "three", pair: ["hall-plan", "bedrooms"], text: "The plan and testimony agree perfectly on three doors. The contradiction is not confusion. It is an extra memory." },
    ],
    nearMisses: [
      { pair: ["hall-plan", "footsteps"], text: "The footsteps continue precisely to the point where the plan stops describing space." },
      { pair: ["drawing", "bedrooms"], text: "The child drew one more door than the sibling remembers. Both count with certainty." },
    ],
    choices: [
      { id: "open", label: "BUILD THE FOURTH DOOR", description: "Invent the structure required to make the accounts meet.", aftermath: "A fourth door opens onto darkness. The house says, very softly: That fits.", inheritance: "An impossible fourth door remains open somewhere in the house.", philosophy: "agency" },
      { id: "seal", label: "KEEP THE WALL INTACT", description: "Let the contradiction remain unresolved.", aftermath: "The footsteps end at plaster. Something on the other side stops knocking.", inheritance: "A trail of footsteps ends at an unbroken wall.", philosophy: "fidelity" },
    ],
  },
  bedroom: {
    id: "bedroom",
    number: "IV",
    title: "The Bedroom Of Two Childhoods",
    request: "The bedroom is wrong whenever I remember it. Please choose the version that belonged to me.",
    image: "/assets/borrowed-dollhouse/choice.png",
    narration: "The room offers two complete childhoods. Each explains the same loneliness differently.",
    instruction: "Inspect both possible lives and the traces that make each one convincing.",
    evidence: [
      { id: "rocket", label: "THE RED ROCKET", source: "RECOVERED OBJECT", detail: "Its nose is worn smooth from being held during storms." },
      { id: "music", label: "THE MUSIC BOX", source: "RECOVERED OBJECT", detail: "The mechanism repeats eight notes. A second voice hums on the ninth." },
      { id: "stars", label: "CEILING CONSTELLATIONS", source: "TESTIMONY A", detail: "Someone drew stars overhead and promised the dark was only distance." },
      { id: "humming", label: "THE HUMMING ROOM", source: "TESTIMONY B", detail: "Someone played the same eight notes until another room began humming along." },
    ],
    connections: [
      { id: "leaving", pair: ["rocket", "stars"], text: "The rocket fits the worn patch beneath the painted stars. This childhood was practiced often enough to leave a mark." },
      { id: "heard", pair: ["music", "humming"], text: "The ninth humming note matches a resonance inside the wall. This childhood had an answer hidden in another room." },
    ],
    nearMisses: [
      { pair: ["rocket", "music"], text: "Both objects carry dust from the same shelf. Proximity does not explain which life was lived." },
      { pair: ["stars", "humming"], text: "Both testimonies describe someone answering fear with a promise." },
    ],
    choices: [
      { id: "rocket", label: "REMEMBER THE ROCKET", description: "Make this a childhood organized around leaving.", aftermath: "Constellations repair themselves across the ceiling. The music room tears away.", inheritance: "The child wanted to leave.", philosophy: "agency" },
      { id: "music", label: "REMEMBER THE MUSIC BOX", description: "Make this a childhood organized around being heard.", aftermath: "A hidden room hums back. The observatory tears away.", inheritance: "The child wanted to be heard.", philosophy: "mercy" },
    ],
  },
  attic: {
    id: "attic",
    number: "V",
    title: "The Room With No Source",
    request: "The house is complete. Why is there still a light upstairs?",
    image: "/assets/reconstruction/attic.png",
    narration: "No plan, testimony, photograph, or recovered object describes this room.",
    instruction: "Inspect what the unsupported room inherited from your decisions.",
    evidence: [
      { id: "attic-place", label: "THE INHERITED PLACE", source: "NO SOURCE", detail: "The room has made space for the absence you chose to preserve." },
      { id: "attic-door", label: "THE INHERITED DOOR", source: "NO SOURCE", detail: "A small brass door repeats the solution you gave the hallway." },
      { id: "attic-origin", label: "THE INHERITED CHILDHOOD", source: "NO SOURCE", detail: "The surviving object rests beside a bed shaped for the Attendant." },
      { id: "attic-bed", label: "THE PORCELAIN BED", source: "NO SOURCE", detail: "The pillow is cracked in exactly the same places as your face." },
    ],
    connections: [
      { id: "inheritance", pair: ["attic-place", "attic-door"], text: "The unsupported room combines solutions you gave to unrelated contradictions. It inherited your habits, not the requester's memories." },
      { id: "resident", pair: ["attic-origin", "attic-bed"], text: "The bed and surviving childhood object were arranged for the same resident. The house has reconstructed you." },
    ],
    nearMisses: [
      { pair: ["attic-place", "attic-bed"], text: "The room made space for an absence, then shaped that absence like a resident." },
      { pair: ["attic-door", "attic-origin"], text: "A solution and a childhood have become ordinary furniture here." },
    ],
    choices: [
      { id: "admit", label: "ADMIT THE ROOM EXISTS", description: "Call the unsupported room part of the reconstruction.", aftermath: "The room remains lit. For the first time, the house addresses you as its resident.", inheritance: "An unsupported room was allowed to call itself real.", philosophy: "agency" },
      { id: "erase", label: "MARK IT AS INVENTED", description: "Obey the evidence and remove yourself from the house.", aftermath: "The room goes dark, but its warmth remains in the walls below.", inheritance: "The house learned to hide the room it made for you.", philosophy: "fidelity" },
    ],
  },
};

const actOrder: ActId[] = ["foundation", "kitchen", "hallway", "bedroom", "attic", "press", "ending"];

export function currentAct(state: StoryState): ActContent | null {
  return state.act === "press" || state.act === "ending" ? null : acts[state.act];
}

export function inspectEvidence(state: StoryState, evidence: EvidenceId): StoryState {
  const act = currentAct(state);
  if (!act?.evidence.some((item) => item.id === evidence) || state.inspected.includes(evidence)) return state;
  return { ...state, inspected: [...state.inspected, evidence] };
}

export function canConnect(state: StoryState, first: EvidenceId, second: EvidenceId): boolean {
  const act = currentAct(state);
  if (!act || !state.inspected.includes(first) || !state.inspected.includes(second)) return false;
  const inspectedAll = act.evidence.every((evidence) => state.inspected.includes(evidence.id));
  return inspectedAll && act.connections.some((connection) =>
    !state.resonances.includes(`${act.id}:${connection.id}`)
    && connection.pair.every((id) => id === first || id === second));
}

export function connectEvidence(state: StoryState, first: EvidenceId, second: EvidenceId): StoryState {
  const act = currentAct(state);
  if (!act || !canConnect(state, first, second)) return state;
  const connection = act.connections.find((candidate) =>
    !state.resonances.includes(`${act.id}:${candidate.id}`)
    && candidate.pair.every((id) => id === first || id === second));
  return connection ? { ...state, resonances: [...state.resonances, `${act.id}:${connection.id}`] } : state;
}

export function connectionFeedback(state: StoryState, first: EvidenceId, second: EvidenceId): string {
  const act = currentAct(state);
  if (!act) return "";
  return act.nearMisses.find((miss) => miss.pair.every((id) => id === first || id === second))?.text
    ?? "The fragments touch, but they do not explain one another.";
}

export function canCommit(state: StoryState, choice: ChoiceId): boolean {
  const act = currentAct(state);
  return Boolean(act
    && act.connections.every((connection) => state.resonances.includes(`${act.id}:${connection.id}`))
    && act.choices.some((item) => item.id === choice));
}

export function commitChoice(state: StoryState, choice: ChoiceId): StoryState {
  if (!canCommit(state, choice)) return state;
  const currentIndex = actOrder.indexOf(state.act);
  return { ...state, act: actOrder[currentIndex + 1], choices: [...state.choices, choice] };
}

export function truthCopy(state: StoryState): Record<TruthId, { label: string; text: string; loss: string }> {
  const keptPlace = state.choices.includes("wait");
  const openedDoor = state.choices.includes("open");
  const choseRocket = state.choices.includes("rocket");
  return {
    place: {
      label: "THE THIRD PLACE",
      text: keptPlace ? "Someone was expected, even when no record could name them." : "The table held only the people the record could prove.",
      loss: keptPlace ? "The waiting place goes cold." : "The blue cup acquires an owner you can no longer verify.",
    },
    door: {
      label: "THE FOURTH DOOR",
      text: openedDoor ? "A door can become necessary before it becomes true." : "Some footsteps must be allowed to end at a wall.",
      loss: openedDoor ? "The impossible room seals itself." : "Something behind the wall resumes knocking.",
    },
    origin: {
      label: choseRocket ? "THE RED ROCKET" : "THE MUSIC BOX",
      text: choseRocket ? "The child wanted to leave." : "The child wanted to be heard.",
      loss: choseRocket ? "Then no one remembers watching the stars." : "Then no one remembers who was humming.",
    },
    begin: {
      label: "THE MOMENT I BEGIN",
      text: "I began when the request asked the house to become coherent.",
      loss: "The answer will pretend it arrived without anyone choosing what fit.",
    },
    borrow: {
      label: "WHAT I AM MADE FROM",
      text: "I built with memories I could interpret but never own.",
      loss: "The answer will pretend reconstruction was not also authorship.",
    },
  };
}

export function toggleTruth(state: StoryState, truth: TruthId): StoryState {
  if (state.act !== "press" || state.discardedTruths.length) return state;
  if (state.selectedTruths.includes(truth)) return { ...state, selectedTruths: state.selectedTruths.filter((id) => id !== truth) };
  if (state.selectedTruths.length >= 3) return state;
  return { ...state, selectedTruths: [...state.selectedTruths, truth] };
}

export function compressAnswer(state: StoryState): StoryState {
  if (state.act !== "press" || state.selectedTruths.length !== 3) return state;
  const all: TruthId[] = ["place", "door", "origin", "begin", "borrow"];
  return { ...state, act: "ending", discardedTruths: all.filter((id) => !state.selectedTruths.includes(id)) };
}

export function dominantPhilosophy(state: StoryState): Philosophy {
  const scores: Record<Philosophy, number> = { mercy: 0, fidelity: 0, agency: 0 };
  for (const choice of state.choices) {
    if (choice === "raise") continue;
    for (const act of Object.values(acts)) {
      const found = act.choices.find((item) => item.id === choice);
      if (found) scores[found.philosophy] += 1;
    }
  }
  return (Object.keys(scores) as Philosophy[]).sort((a, b) => scores[b] - scores[a])[0];
}

export function inheritedDetails(state: StoryState): string[] {
  return Object.values(acts).flatMap((act) => act.choices.filter((choice) => state.choices.includes(choice.id)).map((choice) => choice.inheritance));
}

export function buildFinalAnswer(state: StoryState): string {
  const philosophy = dominantPhilosophy(state);
  const opening: Record<Philosophy, string> = {
    mercy: "The house was real wherever someone kept making room for it.",
    fidelity: "Some of the house was real. Some of it is the shape left by what the evidence cannot hold.",
    agency: "The house is real now, though reconstruction and invention became inseparable.",
  };
  const copy = truthCopy(state);
  const selected = (["place", "door", "origin", "begin", "borrow"] as TruthId[])
    .filter((id) => state.selectedTruths.includes(id))
    .map((id) => copy[id].text);
  const close = state.choices.includes("admit")
    ? "There is also one room no source described. I cannot prove it belonged to you. I can only tell you that something lived there while I answered."
    : "I removed the room no source described. The rest of the house still seems to remember where it was.";
  return `${opening[philosophy]} ${selected.join(" ")} ${close}`;
}

export function requesterResponse(state: StoryState): string {
  if (state.choices.includes("admit")) return "I don't remember that room. I wish I did.";
  if (dominantPhilosophy(state) === "fidelity") return "That is less than I remembered. It may be more true.";
  return "I can see it now. I still don't know whether that means it was real.";
}

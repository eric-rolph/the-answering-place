import { describe, expect, it } from "vitest";
import {
  acts,
  availableAnswerFragments,
  acknowledgeResponse,
  clearComposedAnswer,
  canSettleMemoryChoice,
  composeAnswer,
  currentRequest,
  initialStoryState,
  inspectMemory,
  maraResponse,
  memoriesForCurrentAct,
  hasPendingResponse,
  replaceRetainedMemory,
  retainMemory,
  sendAnswer,
  settleMemoryChoice,
  type MemoryId,
  type StoryState,
} from "./story";

const inspectBaseMemories = (state: StoryState): StoryState => {
  if (state.currentAct === "ending") return state;
  for (const memory of acts[state.currentAct].memories) state = inspectMemory(state, memory.id);
  return state;
};

const retain = (state: StoryState, ...memoryIds: MemoryId[]): StoryState => {
  for (const memoryId of memoryIds) {
    state = inspectMemory(state, memoryId);
    state = retainMemory(state, memoryId);
  }
  return state;
};

const settle = (state: StoryState, ...memoryIds: MemoryId[]): StoryState =>
  settleMemoryChoice(retain(inspectBaseMemories(state), ...memoryIds));

const answer = (state: StoryState, ...memoryIds: MemoryId[]): StoryState =>
  sendAnswer(composeAnswer(state, memoryIds));

describe("limited-memory story model", () => {
  it("contains only the kitchen, hallway, and self acts centered on Mara", () => {
    expect(Object.keys(acts)).toEqual(["kitchen", "hallway", "self"]);
    expect(currentRequest(initialStoryState())).toContain("Mara");
    expect(acts.kitchen).not.toHaveProperty("connections");
    expect(acts.kitchen).not.toHaveProperty("philosophy");
  });

  it("uses the approved clear player-facing memory labels", () => {
    expect(acts.kitchen.memories.map((memory) => memory.label)).toEqual([
      "The blue cup",
      "The storm song",
      "The last thing I said",
    ]);
    expect(acts.hallway.memories.map((memory) => memory.label)).toEqual([
      "Eli’s exact words",
      "The seven-hour delay",
      "Mara’s unsent draft",
    ]);
  });

  it("gives every Mara memory distinct reflection copy for the final answer", () => {
    const maraMemories = Object.values(acts)
      .flatMap((act) => act.memories)
      .filter((memory) => memory.kind === "mara");

    for (const memory of maraMemories) {
      expect(memory.reflectionFragment).not.toBe(memory.answerFragment);
    }
  });

  it("retains at most two inspected memories and requires explicit replacement for a third", () => {
    const state = retain(inspectBaseMemories(initialStoryState()), "blue-cup", "storm-song");

    const unchanged = retainMemory(state, "cruel-sentence");

    expect(unchanged).toBe(state);
    expect(state.retainedMemories.kitchen).toEqual(["blue-cup", "storm-song"]);
    expect(state.forgottenMemories.kitchen).toEqual([]);
  });

  it("explicitly replaces a retained memory and makes the replaced memory irreversibly forgotten", () => {
    let state = retain(inspectBaseMemories(initialStoryState()), "blue-cup", "storm-song");
    state = replaceRetainedMemory(state, "blue-cup", "cruel-sentence");

    expect(state.retainedMemories.kitchen).toEqual(["cruel-sentence", "storm-song"]);
    expect(state.forgottenMemories.kitchen).toEqual(["blue-cup"]);
    expect(retainMemory(state, "blue-cup")).toBe(state);
  });

  it("requires all three base memories and exactly two retained memories before settling", () => {
    let state = retain(initialStoryState(), "blue-cup", "storm-song");

    expect(canSettleMemoryChoice(state)).toBe(false);
    expect(settleMemoryChoice(state)).toBe(state);

    state = inspectMemory(state, "cruel-sentence");
    expect(canSettleMemoryChoice(state)).toBe(true);
  });

  it("settles the memory choice by explicitly forgetting every unretained available memory", () => {
    const state = settle(initialStoryState(), "blue-cup", "cruel-sentence");

    expect(state.settledMemoryChoices.kitchen).toBe(true);
    expect(state.retainedMemories.kitchen).toEqual(["blue-cup", "cruel-sentence"]);
    expect(state.forgottenMemories.kitchen).toEqual(["storm-song"]);
    expect(retainMemory(state, "storm-song")).toBe(state);
  });

  it("offers answer fragments only for memories retained in the settled current act", () => {
    const unsettled = retain(inspectBaseMemories(initialStoryState()), "blue-cup", "cruel-sentence");
    const state = settleMemoryChoice(unsettled);

    expect(availableAnswerFragments(unsettled)).toEqual([]);
    expect(availableAnswerFragments(state).map((fragment) => fragment.memoryId))
      .toEqual(["blue-cup", "cruel-sentence"]);
    expect(availableAnswerFragments(state).map((fragment) => fragment.text).join(" "))
      .not.toContain("storm-night song");
  });

  it("blocks composition and sending until the explicit memory loss is settled", () => {
    const state = retain(inspectBaseMemories(initialStoryState()), "blue-cup", "storm-song");

    expect(composeAnswer(state, ["blue-cup", "storm-song"])).toBe(state);
    expect(sendAnswer(state)).toBe(state);
  });

  it("composes and sends only an answer made from exactly two settled retained memories", () => {
    let state = settle(initialStoryState(), "blue-cup", "storm-song");
    state = answer(state, "storm-song", "blue-cup");

    expect(state.currentAct).toBe("hallway");
    expect(state.composedAnswers.kitchen).toEqual(["storm-song", "blue-cup"]);
    expect(state.forgottenMemories.kitchen).toEqual(["cruel-sentence"]);
    expect(state.sentAnswers[0].text).toContain("storm-night song");
    expect(state.sentAnswers[0].text).toContain("blue cup");
  });

  it("changes Mara's response and next request according to the retained kitchen memories", () => {
    const warmRoute = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );
    const honestRoute = answer(
      settle(initialStoryState(), "cruel-sentence", "storm-song"),
      "cruel-sentence",
      "storm-song",
    );

    expect(maraResponse(warmRoute)).not.toBe(maraResponse(honestRoute));
    expect(currentRequest(warmRoute)).not.toBe(currentRequest(honestRoute));
    expect(currentRequest(warmRoute)).toContain("cup");
    expect(currentRequest(honestRoute)).toContain("what you said");
  });

  it("makes Mara's response traceable to both memories used in the preceding answer", () => {
    const state = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );

    expect(maraResponse(state)).toContain("blue cup");
    expect(maraResponse(state)).toContain("apology");
  });

  it("changes Mara's final request according to the retained hallway memories", () => {
    let directRoute = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );
    directRoute = answer(
      settle(directRoute, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    let inferredRoute = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );
    inferredRoute = answer(
      settle(inferredRoute, "seven-hour-delay", "unsent-draft"),
      "seven-hour-delay",
      "unsent-draft",
    );

    expect(directRoute.currentAct).toBe("self");
    expect(currentRequest(directRoute)).not.toBe(currentRequest(inferredRoute));
    expect(currentRequest(directRoute)).toContain("stayed with his words");
    expect(currentRequest(inferredRoute)).toContain("hesitation");
  });

  it("grounds the final answer in one self statement and one retained memory of Mara", () => {
    let state = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );
    state = answer(
      settle(state, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    expect(memoriesForCurrentAct(state).map((memory) => memory.id)).toContain("blue-cup");
    expect(memoriesForCurrentAct(state).map((memory) => memory.id)).toContain("brief-request-shape");

    state = settle(state, "brief-request-shape", "blue-cup");
    expect(composeAnswer(state, ["brief-request-shape", "still-attending"])).toBe(state);

    state = answer(state, "brief-request-shape", "blue-cup");

    expect(state.currentAct).toBe("ending");
    expect(state.sentAnswers.at(-1)?.text).toContain("shape of your request");
    expect(state.sentAnswers.at(-1)?.text).toContain("blue cup");
    expect(state.sentAnswers.at(-1)?.text).not.toContain("you always chose");
    expect(maraResponse(state)).toContain("blue cup");
    expect(maraResponse(state)).toContain("request gave you");
  });

  it("keeps a sent response pending until the player acknowledges it", () => {
    let state = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );

    expect(hasPendingResponse(state)).toBe(true);
    state = acknowledgeResponse(state);
    expect(hasPendingResponse(state)).toBe(false);
  });

  it("clears a composed answer when the visible fragment selection is incomplete", () => {
    let state = settle(initialStoryState(), "blue-cup", "storm-song");
    state = composeAnswer(state, ["blue-cup", "storm-song"]);
    expect(state.composedAnswers.kitchen).toHaveLength(2);

    state = clearComposedAnswer(state);
    expect(state.composedAnswers.kitchen).toEqual([]);
  });

  it("allows an explicit replacement when only one final category has been chosen", () => {
    let state = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );
    state = acknowledgeResponse(state);
    state = answer(
      settle(state, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );
    state = acknowledgeResponse(state);
    state = inspectBaseMemories(state);
    state = retain(state, "still-attending");
    state = inspectMemory(state, "brief-request-shape");
    state = replaceRetainedMemory(state, "still-attending", "brief-request-shape");

    expect(state.retainedMemories.self).toEqual(["brief-request-shape"]);
    expect(state.forgottenMemories.self).toContain("still-attending");
  });

  it("carries prior forgotten memories into the final room as visible losses", () => {
    let state = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );
    state = acknowledgeResponse(state);
    state = answer(
      settle(state, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    expect(memoriesForCurrentAct(state).map((memory) => memory.id)).toContain("cruel-sentence");
    expect(memoriesForCurrentAct(state).map((memory) => memory.id)).toContain("seven-hour-delay");
    expect(state.forgottenMemories.self).toEqual(expect.arrayContaining(["cruel-sentence", "seven-hour-delay"]));
  });
});

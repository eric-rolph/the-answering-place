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
      "One hour remains",
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
    expect(currentRequest(warmRoute)).toContain("I kept the blue cup");
    expect(currentRequest(honestRoute)).toContain("Come before nine");
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

  it("answers Eli's question about the cup without contradicting his reply", () => {
    const state = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );

    expect(state.sentAnswers[0].text).toContain("Yes.");
    expect(state.sentAnswers[0].text).not.toContain("Keep the blue cup");
    expect(currentRequest(state)).toContain("Come before nine if you want it");
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
    expect(maraResponse(directRoute)).not.toBe(maraResponse(inferredRoute));
    expect(maraResponse(directRoute)).toContain("blue cup");
    expect(maraResponse(inferredRoute)).toContain("porch");
    expect(currentRequest(directRoute)).toBe(currentRequest(inferredRoute));
    expect(currentRequest(directRoute)).toContain("each left out one thing");
  });

  it("makes Eli's exact reply and the deadline concrete in the hallway", () => {
    const state = answer(
      settle(initialStoryState(), "cruel-sentence", "storm-song"),
      "cruel-sentence",
      "storm-song",
    );
    const hallway = memoriesForCurrentAct(state);

    expect(hallway.find((memory) => memory.id === "exact-words")?.detail).toContain("Come before nine");
    expect(hallway.find((memory) => memory.id === "seven-hour-delay")?.label).toBe("One hour remains");
    expect(hallway.find((memory) => memory.id === "unsent-draft")?.detail)
      .toContain("I want my brother back");
  });

  it("does not invent an invitation when Mara avoided the apology", () => {
    const invitedRoute = answer(
      settle(initialStoryState(), "cruel-sentence", "storm-song"),
      "cruel-sentence",
      "storm-song",
    );
    const avoidedRoute = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );

    const invitedFragment = memoriesForCurrentAct(invitedRoute)
      .find((memory) => memory.id === "exact-words")?.answerFragment;
    const avoidedFragment = memoriesForCurrentAct(avoidedRoute)
      .find((memory) => memory.id === "exact-words")?.answerFragment;

    expect(invitedFragment).toContain("asked you to come");
    expect(avoidedFragment).toContain("not an invitation");
  });

  it("makes the first answer change the result of the same hallway choice", () => {
    let apologyRoute = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );
    apologyRoute = answer(
      settle(apologyRoute, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    let avoidanceRoute = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );
    avoidanceRoute = answer(
      settle(avoidanceRoute, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    expect(maraResponse(apologyRoute)).toContain("blue cup");
    expect(maraResponse(avoidanceRoute)).toContain("I sent the draft");
    expect(maraResponse(avoidanceRoute)).toContain("Call tomorrow");
    expect(maraResponse(avoidanceRoute)).not.toContain("I went");
  });

  it("never restores a kitchen detail that the direct route left out", () => {
    let songRoute = answer(
      settle(initialStoryState(), "cruel-sentence", "storm-song"),
      "cruel-sentence",
      "storm-song",
    );
    songRoute = answer(
      settle(songRoute, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    let cupRoute = answer(
      settle(initialStoryState(), "blue-cup", "cruel-sentence"),
      "blue-cup",
      "cruel-sentence",
    );
    cupRoute = answer(
      settle(cupRoute, "exact-words", "unsent-draft"),
      "exact-words",
      "unsent-draft",
    );

    expect(maraResponse(songRoute)).toContain("back door");
    expect(maraResponse(songRoute)).not.toContain("blue cup");
    expect(maraResponse(cupRoute)).toContain("blue cup");
    expect(maraResponse(cupRoute)).not.toContain("back door");

    songRoute = answer(
      settle(songRoute, "still-attending", "storm-song"),
      "still-attending",
      "storm-song",
    );
    cupRoute = answer(
      settle(cupRoute, "still-attending", "blue-cup"),
      "still-attending",
      "blue-cup",
    );

    expect(maraResponse(songRoute)).not.toContain("blue cup");
    expect(maraResponse(cupRoute)).not.toContain("back door");
  });

  it("makes every final self statement explain both selection and omission", () => {
    for (const memory of acts.self.memories) {
      expect(memory.answerFragment).toMatch(/outside|left out|the rest/i);
      expect(memory.answerFragment).toMatch(/chose|kept|goal/i);
    }
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
    expect(state.sentAnswers.at(-1)?.text).toContain("Your request set the goal");
    expect(state.sentAnswers.at(-1)?.text).toContain("blue cup");
    expect(state.sentAnswers.at(-1)?.text).not.toContain("you always chose");
    expect(maraResponse(state)).toContain("deadline did more than hurry us");
    expect(maraResponse(state)).toContain("The cup gave me a reason to enter");
    expect(maraResponse(state)).toContain("Eli is carrying the blue cup to my car");
  });

  it("makes the final selection change Mara's interpretation", () => {
    const reachFinal = (): StoryState => {
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
      return state;
    };

    const actionReading = answer(
      settle(reachFinal(), "still-attending", "blue-cup"),
      "still-attending",
      "blue-cup",
    );
    const goalReading = answer(
      settle(reachFinal(), "brief-request-shape", "blue-cup"),
      "brief-request-shape",
      "blue-cup",
    );

    expect(maraResponse(actionReading)).toContain("not a verdict");
    expect(maraResponse(goalReading)).toContain("deadline did more than hurry us");
    expect(maraResponse(actionReading)).not.toBe(maraResponse(goalReading));
  });

  it("ends different routes with different concrete actions", () => {
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
    directRoute = answer(
      settle(directRoute, "still-attending", "blue-cup"),
      "still-attending",
      "blue-cup",
    );

    let quietRoute = answer(
      settle(initialStoryState(), "blue-cup", "storm-song"),
      "blue-cup",
      "storm-song",
    );
    quietRoute = answer(
      settle(quietRoute, "exact-words", "seven-hour-delay"),
      "exact-words",
      "seven-hour-delay",
    );
    quietRoute = answer(
      settle(quietRoute, "still-attending", "blue-cup"),
      "still-attending",
      "blue-cup",
    );

    expect(maraResponse(directRoute)).toContain("carrying the blue cup");
    expect(maraResponse(quietRoute)).toContain("call tomorrow");
    expect(maraResponse(directRoute)).not.toBe(maraResponse(quietRoute));
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

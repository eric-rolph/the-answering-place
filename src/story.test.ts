import { describe, expect, it } from "vitest";
import {
  acts,
  buildFinalAnswer,
  commitChoice,
  compressAnswer,
  connectionFeedback,
  connectEvidence,
  inheritedDetails,
  initialStoryState,
  inspectEvidence,
  toggleTruth,
  type ChoiceId,
  type StoryState,
} from "./story";

function discoverFoundation() {
  let state = initialStoryState();
  for (const evidence of acts.foundation.evidence) state = inspectEvidence(state, evidence.id);
  state = connectEvidence(state, "plan", "measurements");
  return connectEvidence(state, "request", "ash");
}

describe("house reconstruction story", () => {
  it("does not allow a room commitment before its resonance is discovered", () => {
    const state = commitChoice(initialStoryState(), "raise");
    expect(state.act).toBe("foundation");
  });

  it("requires inspected evidence before a valid connection can resolve", () => {
    const unresolved = connectEvidence(initialStoryState(), "plan", "measurements");
    const resolved = discoverFoundation();
    expect(unresolved.resonances).toEqual([]);
    expect(resolved.resonances).toEqual(["foundation:dimensions", "foundation:warning"]);
  });

  it("rewards an incorrect connection with an authored observation", () => {
    let state = initialStoryState();
    for (const evidence of acts.foundation.evidence) state = inspectEvidence(state, evidence.id);
    expect(connectionFeedback(state, "request", "plan")).toContain("official outline");
  });

  it("carries committed interpretations into later inherited details", () => {
    let state = commitChoice(discoverFoundation(), "raise");
    for (const evidence of acts.kitchen.evidence) state = inspectEvidence(state, evidence.id);
    state = connectEvidence(state, "photo", "cup");
    state = connectEvidence(state, "places", "blue");
    state = commitChoice(state, "wait");
    expect(inheritedDetails(state)).toContain("A table remains set for someone no record can name.");
  });

  it("forces exactly two of five final truths to be dismantled", () => {
    let state: StoryState = { ...initialStoryState(), act: "press" };
    state = toggleTruth(state, "place");
    state = toggleTruth(state, "origin");
    state = toggleTruth(state, "borrow");
    state = compressAnswer(state);
    expect(state.act).toBe("ending");
    expect(state.discardedTruths).toEqual(["door", "begin"]);
  });

  it("authors the same final answer regardless of truth selection order", () => {
    const choices: ChoiceId[] = ["wait", "open", "rocket", "admit"];
    let first: StoryState = { ...initialStoryState(), act: "press", choices };
    first = toggleTruth(first, "place");
    first = toggleTruth(first, "origin");
    first = toggleTruth(first, "borrow");

    let second: StoryState = { ...first, selectedTruths: [] };
    second = toggleTruth(second, "borrow");
    second = toggleTruth(second, "place");
    second = toggleTruth(second, "origin");

    expect(buildFinalAnswer(first)).toBe(buildFinalAnswer(second));
  });
});

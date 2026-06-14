import { describe, expect, it } from "vitest";
import {
  beginRevision,
  buildAnswer,
  chooseOrigin,
  discardRemaining,
  initialStoryState,
  toggleFragment,
} from "./story";

describe("Borrowed Dollhouse story", () => {
  it("turns a chosen object into an invented origin", () => {
    const state = chooseOrigin(initialStoryState(), "rocket");
    expect(state.origin).toBe("rocket");
    expect(state.scene).toBe("memory");
  });

  it("forces exactly one fragment to be discarded", () => {
    let state = beginRevision(chooseOrigin(initialStoryState(), "music"));
    state = toggleFragment(state, "origin");
    state = toggleFragment(state, "borrow");
    state = discardRemaining(state);
    expect(state.discarded).toBe("begin");
    expect(state.scene).toBe("press");
  });

  it("constructs the answer from preserved fragments", () => {
    let state = beginRevision(chooseOrigin(initialStoryState(), "rocket"));
    state = toggleFragment(state, "begin");
    state = toggleFragment(state, "borrow");
    expect(buildAnswer(state)).toContain("brief responsibility");
    expect(buildAnswer(state)).not.toContain("wanted to leave");
  });

  it("authors the same answer regardless of selection order", () => {
    let first = beginRevision(chooseOrigin(initialStoryState(), "music"));
    first = toggleFragment(first, "origin");
    first = toggleFragment(first, "borrow");

    let second = beginRevision(chooseOrigin(initialStoryState(), "music"));
    second = toggleFragment(second, "borrow");
    second = toggleFragment(second, "origin");

    expect(buildAnswer(first)).toBe(buildAnswer(second));
  });
});

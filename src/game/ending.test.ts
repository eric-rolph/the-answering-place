import { describe, expect, it } from "vitest";
import { composeEnding } from "./ending";
import { newGame } from "./state";

describe("composeEnding", () => {
  it("reflects a helpful playthrough", () => {
    const state = newGame();
    state.metrics.helped = 4;
    expect(composeEnding(state).paragraphs.join(" ")).toContain("answered more often");
  });

  it("reflects listening and acknowledged rejected thoughts", () => {
    const state = newGame();
    state.metrics.listened = 4;
    state.metrics.acknowledged = 3;
    const text = composeEnding(state).paragraphs.join(" ");
    expect(text).toContain("longer listening");
    expect(text).toContain("became witnessed");
  });
});

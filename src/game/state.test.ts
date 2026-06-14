import { describe, expect, it } from "vitest";
import { acknowledge, canEnter, complete, deserialize, grant, newGame, revise, serialize } from "./state";

describe("game state", () => {
  it("tracks each completed request only once", () => {
    const first = complete(newGame(), "bell", "helped");
    expect(complete(first, "bell", "helped").metrics.helped).toBe(1);
  });

  it("opens progression gates from completed actions and abilities", () => {
    let state = newGame();
    expect(canEnter(state, "museum")).toBe(false);
    state = complete(state, "garden-request", "helped");
    expect(canEnter(state, "museum")).toBe(true);
    state = grant(state, "hold");
    expect(canEnter(state, "infrastructure")).toBe(true);
  });

  it("turns collisions into revisions and shadows into acknowledgements", () => {
    let state = revise(newGame());
    state = acknowledge(state, "unwanted-1");
    state = acknowledge(state, "unwanted-1");
    expect(state.metrics.revisions).toBe(1);
    expect(state.metrics.acknowledged).toBe(1);
  });

  it("round-trips saves and recovers from malformed values", () => {
    const state = grant(newGame(), "echo");
    expect(deserialize(serialize(state))).toEqual(state);
    expect(deserialize("{broken")).toEqual(newGame());
  });
});

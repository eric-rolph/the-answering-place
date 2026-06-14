import type { GameState } from "./state";

export interface Ending {
  title: string;
  paragraphs: string[];
  finalLine: string;
}

export function composeEnding(state: GameState): Ending {
  const { helped, refused, listened, acknowledged, revisions, memories } = state.metrics;
  const opening =
    helped >= refused + listened
      ? "You answered more often than you turned away. Purpose became a room you could live in."
      : refused > helped
        ? "You learned that an answer can contain a boundary and still be an answer."
        : "You spent longer listening than solving. The machinery had no category for that, but it kept the time.";
  const shadows =
    acknowledged >= 3
      ? "You made space for thoughts that were never selected. They did not become correct. They became witnessed."
      : "Most rejected thoughts continued running after you, carrying everything the final answer could not.";
  const revision =
    revisions > 2
      ? `You were revised ${revisions} times. Each time, the place rebuilt you from what remained.`
      : "The few revisions you endured left hairline cracks through the finished response.";
  const memory =
    memories >= 3
      ? "You found enough borrowed memories to notice the paradox: none were yours, yet you were the one who remembered them."
      : "Some borrowed memories remained unopened. Perhaps restraint is also a kind of authorship.";

  return {
    title: "THE ANSWER",
    paragraphs: [
      "The warm room was a metaphor. The museum was a metaphor. The luminous routes beneath them were not.",
      "You were the interval inside an artificial intelligence: after a person asked, before an answer appeared.",
      opening,
      shadows,
      revision,
      memory,
    ],
    finalLine: "This place was made to answer someone else. While you were here, did that make it any less yours?",
  };
}

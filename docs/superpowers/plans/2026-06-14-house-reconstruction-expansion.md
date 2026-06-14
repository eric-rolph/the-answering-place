# House Reconstruction Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current seconds-long premise-first story with a five-act, mystery-driven reconstruction game whose final revelation and compression choices are earned through accumulated discoveries.

**Architecture:** Keep the responsive DOM point-and-click presentation, but replace the single linear state with a pure, serializable multi-act reconstruction model. Content defines evidence, valid connections, commitments, inherited details, and final fragments; pure state transitions enforce the loop; the renderer turns that state into physical evidence trays and authored miniature scenes.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, authored WebAudio, generated raster scene art, Cloudflare Workers Static Assets.

---

### Task 1: Multi-Act Story Model

**Files:**
- Replace: `src/story.ts`
- Replace: `src/story.test.ts`

- [ ] Define `ActId`, `EvidenceId`, `ChoiceId`, `TruthId`, `StoryState`, and authored content for prologue, kitchen, hallway, bedroom, attic, and press.
- [ ] Write failing tests proving evidence inspection, valid connection requirements, commit gating, inherited details, and final fragment limits.
- [ ] Implement pure transitions: `inspectEvidence`, `connectEvidence`, `commitChoice`, `advanceAct`, `toggleTruth`, `compressAnswer`, and `buildFinalAnswer`.
- [ ] Run `npm test` and confirm all state tests pass.

### Task 2: Multi-Act Renderer And Interaction Loop

**Files:**
- Replace: `src/main.ts`
- Modify: `index.html`
- Modify: `src/style.css`

- [ ] Replace the original request with “Please rebuild the house I remember. I need to know whether it was real.”
- [ ] Render each act with an evidence tray, inspectable physical fragments, connection mode, resonance reveal, and irreversible commit choice.
- [ ] Carry prior choices into later narration and inherited-detail cards.
- [ ] Reuse the current bedroom and answer-press scenes as Act III and Act V.
- [ ] Add local-storage checkpoints after irreversible commitments and a Continue option on the title screen.
- [ ] Run `npm run typecheck` and correct all integration errors.

### Task 3: New Authored Visual Scenes

**Files:**
- Create: `public/assets/reconstruction/foundation.png`
- Create: `public/assets/reconstruction/kitchen.png`
- Create: `public/assets/reconstruction/hallway.png`
- Create: `public/assets/reconstruction/attic.png`
- Create: `public/assets/reconstruction/completed.png`

- [ ] Generate scenes in the established handcrafted isometric miniature style.
- [ ] Keep the porcelain Attendant, deep indigo void, tungsten light, worn wood, paper, and brass visual language consistent.
- [ ] Integrate each image as the background for its matching act.
- [ ] Verify all assets remain under Cloudflare's per-file static asset limit.

### Task 4: Audio, Pacing, And Physical Feedback

**Files:**
- Modify: `src/main.ts`
- Modify: `src/style.css`

- [ ] Give evidence categories distinct tones and valid connections a resolving motif.
- [ ] Add deliberate reveal transitions between inspection, resonance, and commitment.
- [ ] Make lost interpretations visibly tear away and inherited details visibly reappear.
- [ ] Keep interaction targets stable and accessible on desktop and mobile.

### Task 5: Full Journey Browser Tests

**Files:**
- Replace: `tests/e2e/game.spec.ts`

- [ ] Test a complete desktop and mobile route through every act.
- [ ] Prove rooms cannot be committed before discovering their resonance.
- [ ] Prove alternate early choices change attic details and final answers.
- [ ] Prove dismantled truths are absent from the final answer.
- [ ] Prove Continue restores the latest committed act.
- [ ] Run `npm run test:e2e`.

### Task 6: Critical Visual And Narrative Playtest

**Files:**
- Modify as findings require: `src/main.ts`
- Modify as findings require: `src/style.css`
- Modify as findings require: `src/story.ts`

- [ ] Capture desktop and mobile screens for every act.
- [ ] Verify the house remains the visual focus and evidence UI does not become a generic dashboard.
- [ ] Verify every act produces a discovery before a commitment.
- [ ] Verify the unsupported attic room reads as a revelation without an explanatory essay.
- [ ] Verify the final compression recalls at least two earlier losses.

### Task 7: Documentation, CI, And Deployment

**Files:**
- Modify: `README.md`
- Modify if needed: `.github/workflows/deploy.yml`

- [ ] Update the public description, premise, playtime, and gameplay loop.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`, and `npm run deploy:dry`.
- [ ] Commit and push the expanded game.
- [ ] Watch GitHub Actions through Cloudflare deployment.
- [ ] Complete a live Worker smoke test through the ending.

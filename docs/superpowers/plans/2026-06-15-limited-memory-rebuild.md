# Limited Memory Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild The Answering Place as a three-act narrative game about helping Mara while choosing what limited context can remember.

**Architecture:** A pure TypeScript story model owns acts, retained memories, forgotten memories, answer construction, and consequence-driven responses. A single DOM renderer presents low-chrome scene exploration, explicit memory retention, visible loss, and answer assembly. Playwright verifies comprehension, irreversible consequences, route variation, and responsive play.

**Tech Stack:** TypeScript, Vite, Vitest, Playwright, CSS, Cloudflare Workers Static Assets

---

### Task 1: Replace The Story State Model

**Files:**
- Modify: `src/story.ts`
- Modify: `src/story.test.ts`

- [ ] Write failing tests proving two-slot memory capacity, explicit replacement, answer fragments limited to retained memories, and consequence-driven next requests.
- [ ] Run `npm test` and confirm the new tests fail against the reconstruction model.
- [ ] Replace evidence connections and philosophy scores with acts, memory records, retained/forgotten state, answer composition, and Mara response functions.
- [ ] Run `npm test` and confirm all story-model tests pass.

### Task 2: Rebuild The Playable Interface

**Files:**
- Modify: `src/main.ts`
- Modify: `src/style.css`
- Modify: `index.html`

- [ ] Present the approved story design through explicit inspect, remember, replace, compose, and send controls.
- [ ] Keep the central scene readable with only the request strip and context slots persistent.
- [ ] Make every forgotten memory visibly collapse and remain legible as an absence.
- [ ] Make Mara's response and the following scene vary from retained details.
- [ ] Update title copy and accessibility labels for the new player promise.
- [ ] Run `npm run typecheck` and `npm run build`.

### Task 3: Rewrite Behavioral Playtests

**Files:**
- Modify: `tests/e2e/game.spec.ts`

- [ ] Test that the opening states the goal and two-memory limit.
- [ ] Test that selecting a third memory requires explicit replacement.
- [ ] Test that forgotten memories visibly disappear and cannot be used in the answer.
- [ ] Test two distinct routes through all three acts and assert different Mara reactions and final answers.
- [ ] Test save/continue and mobile viewport playability.
- [ ] Run `npm run test:e2e`.

### Task 4: Update Project Description And Verify Deployment

**Files:**
- Modify: `README.md`
- Modify: `package.json`

- [ ] Update product description, play instructions, and architecture notes.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`, and `npm run deploy:dry`.
- [ ] Inspect representative desktop and mobile screenshots.
- [ ] Push to `main`, verify GitHub Actions deployment, and smoke-test the live Worker.


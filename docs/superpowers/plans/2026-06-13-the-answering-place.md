# The Answering Place Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, test, publish, and deploy a complete dreamlike browser exploration game about inhabiting an AI while it answers one request.

**Architecture:** Phaser renders a data-driven sequence of top-down rooms while pure TypeScript modules own progression, metrics, and ending composition. A restrained DOM shell owns narrative overlays and responsive controls. Vite produces static assets served by Cloudflare Workers.

**Tech Stack:** Phaser 3, TypeScript, Vite, Vitest, Cloudflare Workers Static Assets, GitHub Actions

---

### Task 1: Scaffold and simulation

**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `src/game/state.ts`, `src/game/state.test.ts`

- [ ] Create the standalone Vite/TypeScript project and install dependencies.
- [ ] Write tests for progress gates, behavior metrics, revisions, and save serialization.
- [ ] Implement the serializable game state and run tests.

### Task 2: Narrative content and ending

**Files:** `src/game/world.ts`, `src/game/ending.ts`, `src/game/ending.test.ts`

- [ ] Define the complete room sequence, interactions, hidden memories, and transitions.
- [ ] Write tests for personalized ending composition.
- [ ] Implement ending composition and run tests.

### Task 3: Playable renderer

**Files:** `src/game/ExplorationScene.ts`, `src/game/render.ts`, `src/game/audio.ts`, `src/main.ts`

- [ ] Render original procedural environments, player, requests, fragments, rejected thoughts, and transitions.
- [ ] Implement movement, collision, interactions, Echo, Hold, revisions, progression, and generated audio.
- [ ] Wire simulation state to rendering and persistence.

### Task 4: Game interface

**Files:** `index.html`, `src/style.css`, `src/ui.ts`

- [ ] Build title, contextual prompt, dialog, journal, pause, ending, and touch controls.
- [ ] Add responsive behavior, reduced-motion support, and keyboard focus handling.

### Task 5: Production and deployment

**Files:** `wrangler.jsonc`, `.github/workflows/deploy.yml`, `.gitignore`, `README.md`

- [ ] Configure Workers Static Assets and observability.
- [ ] Configure GitHub Actions to test, build, and deploy `main`.
- [ ] Document controls, architecture, local development, and deployment secrets.

### Task 6: Verification and publication

- [ ] Run unit tests, typecheck, production build, and Wrangler dry run.
- [ ] Playtest title-to-ending and inspect desktop/mobile screenshots.
- [ ] Fix discovered issues and repeat verification.
- [ ] Initialize git, create the GitHub repository, commit, and push.
- [ ] Deploy to Cloudflare Workers and verify the live URL.

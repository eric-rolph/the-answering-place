# The Answering Place

A narrative game about attention, limited memory, and helping one person across three requests.

[Play The Answering Place](https://the-answering-place.ericrolph.workers.dev)

Mara needs help speaking to her estranged younger brother. Enter the places made from her words, inspect the memories she gives you, and choose what limited context can carry into each answer. What you remember shapes the relationship. What you forget disappears.

## Play

Each request contains three memories, but an answer can carry only two. Inspect a memory, choose to retain it, and explicitly decide what must be lost when context fills. Mara and Eli react to the details that survive. A first playthrough takes roughly 8-12 minutes.

## Development

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
npm run deploy:dry
```

## Architecture

- Pure TypeScript owns irreversible memory state, answer composition, and consequence-driven requests.
- A low-chrome DOM interface presents explorable memory objects while protecting the miniature scenes.
- Vite builds the static bundle.
- Cloudflare Workers Static Assets serves production.

## Deployment

Local deployment requires an authenticated Wrangler session or `CLOUDFLARE_API_TOKEN`:

```bash
npm run deploy
```

GitHub Actions deploys pushes to `main`. Add a repository secret named `CLOUDFLARE_API_TOKEN` with permission to edit Workers Scripts.

## Creative Direction

The game takes broad inspiration from dream-exploration games, especially their quiet spaces and emotional uncertainty. Its imagery, writing, environments, mechanics, and procedural art are original.

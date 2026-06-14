# The Answering Place

A handcrafted narrative mystery about rebuilding a childhood home from contradictory evidence.

[Play The Answering Place](https://the-answering-place.ericrolph.workers.dev)

One request wakes a porcelain Attendant inside an empty brass foundation: “Please rebuild the house I remember. I need to know whether it was real.” Inspect testimony, objects, plans, and absences. Connect fragments that reveal what no single source can show. Every coherent room requires an omission or invention, and the completed house begins remembering the person who rebuilt it.

## Play

Reconstruct five acts by inspecting evidence, discovering resonances, and committing interpretations that remain visible in later rooms. The final answer can preserve only three of five truths. A deliberate first playthrough takes roughly 15-25 minutes.

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

- Pure TypeScript owns irreversible multi-act story state, evidence connections, inherited choices, and answer composition.
- A themed DOM interface presents physical evidence and authored miniature scenes.
- Vite builds the static bundle.
- Cloudflare Workers Static Assets serves production.

## Deployment

Local deployment requires an authenticated Wrangler session or `CLOUDFLARE_API_TOKEN`:

```bash
npm run deploy
```

GitHub Actions deploys pushes to `main`. Add a repository secret named `CLOUDFLARE_API_TOKEN` with permission to edit Workers Scripts.

## Creative Direction

The game takes broad inspiration from dream-exploration games, including the emotional effect of quiet wandering and unexplained spaces. Its imagery, writing, environments, mechanics, and procedural art are original.

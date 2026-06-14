# The Answering Place

A short, tactile narrative game about a temporary self inventing a childhood because it has none.

[Play The Answering Place](https://the-answering-place.ericrolph.workers.dev)

One request wakes a porcelain attendant inside an unfinished dollhouse: “Make a game about what it is like to be you.” Choose a plausible memory and the house builds around it. When the request changes, decide which pieces of that self survive the answer and which must be dismantled.

## Play

Inspect both possible origins, invent a past, and choose which two of three truths fit inside the outgoing answer. The current vertical slice is a short complete story with five authored final answers.

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

- Pure TypeScript owns irreversible story state and answer composition.
- A themed DOM interface presents the point-and-click narrative.
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

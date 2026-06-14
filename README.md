# The Answering Place

A short, dreamlike top-down exploration game about inhabiting the interval inside an artificial intelligence after a request arrives and before an answer appears.

The game begins in a warm, damaged home, passes through a museum of borrowed memories, and ends inside the luminous infrastructure beneath both. Apparent enemies are rejected thoughts. They can be avoided, endured, or acknowledged. There is no conventional death: contact causes a revision.

## Play

- Move: `WASD` or arrow keys
- Interact: `E` or `Space`
- Echo: `Q`
- Hold: `Shift`
- Journal: `+` button

The main path takes roughly 20-30 minutes when played deliberately. The ending is composed from how the player treated requests, rejected thoughts, revisions, and optional memories.

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

- Phaser renders procedural world geometry, movement, collision, abilities, and effects.
- Pure TypeScript modules own saveable progression, behavior metrics, and ending composition.
- DOM overlays handle narrative dialogs, the journal, controls, and responsive touch input.
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

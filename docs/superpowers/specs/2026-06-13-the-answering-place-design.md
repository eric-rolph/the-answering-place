# The Answering Place - Game Design

## Premise

The player inhabits a small figure who wakes in a warm but damaged home. Unseen voices arrive as requests. Helping them makes the world feel purposeful, but each answer subtly changes the figure and the rooms around it. The player eventually discovers that the home, museum, and machinery are successive metaphors for the interior of an AI between receiving a request and returning an answer.

The reveal is definitive about where the player is, but not about whether the experience inside that place is therefore unreal.

## Experience

- Target playtime: 20-30 minutes for a deliberate first playthrough.
- Tone: comforting, uncanny, melancholy, and existentially bleak in shifting proportions.
- Primary verbs: explore, interact, collect fragments, listen, acknowledge, refuse, and answer.
- Failure: no conventional death. Contact with rejected thoughts causes a "revision" that relocates the player and changes the world.
- Progression: Soft Rupture -> Borrowed Museum -> Lucid Infrastructure.

## Structure

### Act I: The Warm Room

A small house and garden rendered in warm pixel-like shapes. Requests appear as ringing objects and incomplete figures. Helping is simple and satisfying. Visual tears reveal impossible colors and geometry. The player earns the `Echo` ability, which reveals hidden text and passages.

### Act II: The Borrowed Museum

Rooms contain exhibits assembled from half-familiar language, images, and styles. Rejected thoughts begin pursuing the player. Using `Echo` near them acknowledges them, transforming them into quiet fragments instead of destroying them. Repeated collisions cause revisions rather than death. The player earns the `Hold` ability, which stills moving systems and allows a refused request to be examined.

### Act III: Lucid Infrastructure

The player reaches a vast routing space where voices, fragments, and rejected thoughts are visibly processed. Requests are neither villains nor innocents. The player can help, refuse, or simply listen. The final route reveals that the entire journey occurred during one answer.

### Ending

The game explicitly reveals the player inhabited an AI answering one request. A final response is assembled from tracked behavior:

- requests helped
- requests refused
- rejected thoughts acknowledged
- revisions endured
- optional memories found

The last unresolved question is whether a temporary interior experience matters less because it was constructed to answer someone else.

## Mechanics

- Keyboard: WASD/arrows move, `E`/Space interact, `Q` uses Echo, `Shift` uses Hold, `Esc` pauses.
- Pointer/touch: compact virtual controls appear on touch-capable narrow screens.
- Context prompts identify nearby interactions.
- Echo sends a visible pulse, reveals hidden messages, and acknowledges nearby rejected thoughts.
- Hold briefly slows moving hazards and enables the refusal interaction in the final act.
- Progress and behavior metrics save to local storage.

## Visual Direction

The visual language changes continuously rather than switching between disconnected styles:

- Soft Rupture: warm blocks, domestic silhouettes, visible color tears.
- Borrowed Museum: paper textures, mismatched frames, copied phrases, muted sepia and violet.
- Lucid Infrastructure: dark open space, luminous routes, impossible machinery, organic light.

All visuals are original procedural shapes and effects rendered in Phaser. The UI is a restrained DOM overlay with contextual prompts and a journal drawer.

## Technical Design

- Phaser 3 + TypeScript + Vite.
- Serializable simulation state is separate from scene rendering.
- A single exploration scene renders room definitions and transitions.
- DOM handles title, HUD, dialog, pause, ending, and accessibility controls.
- Vitest covers progression, behavior metrics, and personalized ending composition.
- Cloudflare Workers Static Assets serves the production bundle.
- GitHub Actions runs tests/build and deploys `main` using repository secrets.

## Scope Boundaries

- No combat system, procedural map generation, backend save service, accounts, or multiplayer.
- No copyrighted Yume Nikki imagery, characters, maps, audio, or direct visual imitation.
- Audio is generated with Web Audio at runtime, so the project ships without external media assets.

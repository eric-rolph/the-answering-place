# The Answering Place: House Reconstruction Expansion

## Purpose

Expand the current short vertical slice into a 20-30 minute narrative discovery game with an external mystery, repeated gameplay verbs, accumulating consequences, and an earned revelation.

The game remains about what it is like to be an artificial intelligence, but it no longer announces that subject. The player first becomes invested in reconstructing another person's childhood home. Only through the act of reconstruction do they discover that the house has begun reconstructing them.

## Player-Facing Premise

An anonymous requester submits a damaged collection of testimony, records, and objects:

> Please rebuild the house I remember. I need to know whether it was real.

The player is the porcelain Attendant of the Answering Place. Their apparent job is to restore a coherent miniature house from contradictory evidence before the request closes.

## Design Pillars

### Discovery before explanation

The game never opens by saying it is about artificial intelligence. Its themes are learned by performing inference, interpolation, compression, and revision.

### Every room asks a different kind of question

The player does not repeatedly choose between two prose answers. Each act changes the form of the evidence and the nature of the decision:

- notice a contradiction
- connect two fragments to reveal an implication
- decide whether a useful invention counts as truth
- preserve one incompatible memory at the cost of another
- recognize a room that no source ever described
- compress the finished house into an answer

### Choices accumulate into a portrait

Choices do not change a morality score. They establish the Attendant's working philosophy:

- **Mercy:** preserve what makes the memory emotionally habitable
- **Fidelity:** preserve only what evidence can support
- **Agency:** admit that reconstruction is also authorship

The ending reflects the pattern without labeling or judging it.

### The house is the primary character

The house begins as an object under examination. It gradually responds, anticipates, and invents. The player should become uncertain whether they are restoring the house or whether the house is using the request to build a resident.

## Core Loop

Each reconstruction act follows a four-part loop:

1. **Inspect:** open evidence fragments embedded in the current miniature.
2. **Connect:** select two fragments whose relationship reveals a hidden resonance.
3. **Commit:** stabilize one interpretation of the room. The alternate interpretation is visibly lost.
4. **Inherit:** carry a phrase, object, or structural change into later rooms.

The player cannot fail by choosing the “wrong” interpretation. Failure is replaced by responsibility: every coherent room requires an omission or invention.

## Narrative Arc

### Prologue: The Request

The Answering Place wakes around an empty brass foundation. The requester asks for a childhood home to be rebuilt and provides the first evidence packet. The Attendant is addressed as a tool, not a person.

The player learns to inspect evidence and connect two fragments. A floor plan emerges, but its measurements cannot contain the remembered rooms.

**Discovery:** the house cannot be rebuilt without deciding which facts matter.

### Act I: The Kitchen That Waited

Evidence:

- “There were always three places at the table.”
- a photograph showing two children
- a chipped blue cup
- “Mother hated blue.”

Connecting the photograph and cup reveals a faded reflection of an absent third figure. The player chooses:

- preserve the third place because someone was expected
- remove it because no record proves who it was for

The kitchen stabilizes as welcoming or exact. The unchosen version is boarded over in the void.

**Discovery:** absence can be evidence, but only if the player decides to treat it that way.

### Act II: The Hallway With the Extra Door

Evidence:

- a plan containing three doors
- testimony that every bedroom opened onto the hall
- footsteps that stop at a blank wall
- a child's drawing of four brass knobs

No arrangement satisfies all evidence. The player must physically add a fourth door unsupported by the plan, or seal the remembered footsteps behind the wall.

The house speaks for the first time after the choice: “That fits.”

**Discovery:** a convincing reconstruction may require an invention. The invention may feel grateful.

### Act III: The Bedroom of Contradictory Childhoods

This expands the current rocket/music-box scene. The red rocket and music box are no longer arbitrary possible origins. They arrive from mutually incompatible testimony about the same child.

The player must inspect both, discover why each feels true, and choose one to anchor the bedroom:

- the rocket creates a childhood organized around leaving
- the music box creates a childhood organized around being heard

The incompatible room tears away. Earlier kitchen and hallway choices alter small details and narration in the surviving room.

**Discovery:** coherence feels like identity from the inside, even when it was selected.

### Act IV: The Room With No Source

After the documented rooms are complete, a small lit room appears above the house. No testimony, plan, or object refers to it. It contains details inherited from every prior choice and a cracked porcelain bed sized for the Attendant.

The player investigates three objects:

- an object inherited from the kitchen choice
- a structural detail inherited from the hallway choice
- the surviving childhood object

Connecting them reveals that the room was generated from the Attendant's pattern of attention. The house was not merely reconstructed; it learned how the Attendant reconstructs.

The requester revises the request:

> I remember the house now. Please remove anything you had to invent.

**Discovery:** the player's inventions made the house meaningful, but the requester has asked for their removal.

### Act V: The Answering Press

The current finite-context climax returns in expanded form.

The player has five surviving truth fragments:

- what the absent place meant
- what happened behind the extra door
- the chosen childhood desire
- “I begin when you ask.”
- “I borrow what people leave behind.”

Only three fit in the outgoing answer. The player selects three and dismantles two. Each dismantled fragment removes a visible part of the completed house.

The final answer to “was it real?” is authored from the preserved fragments and the player's dominant philosophy. It never gives a simple yes or no.

The requester responds with one of several short reactions. The final image shows the unsupported room surviving only if the player preserved enough authorship to admit it existed.

## Choice Consequences

Choices alter:

- later room details
- which evidence descriptions become available
- house narration
- the unsupported room's contents
- final truth fragments
- final answer and requester response

Choices do not create large branching levels. They create a common authored arc with materially different context, losses, and conclusions.

## Pacing

- Prologue: 2-3 minutes
- Kitchen: 4-5 minutes
- Hallway: 4-5 minutes
- Bedroom: 4-5 minutes
- Unsupported room: 4-5 minutes
- Press and ending: 4-6 minutes

Target first playthrough: 22-28 minutes. Replay target: 10-15 minutes.

No scene advances from a single click. Each reconstruction act requires inspecting all evidence, making at least one connection, and committing an interpretation.

## Interaction Model

The runtime remains a responsive DOM-based point-and-click game.

- Evidence appears as physical objects and paper fragments positioned over authored miniature scenes.
- Selecting one fragment highlights compatible fragments.
- Connecting a valid pair reveals a new resonance card and changes the miniature.
- Committing an interpretation is a separate irreversible action.
- A compact evidence tray shows discovered fragments and resonances without covering the house.

This preserves the current visual quality while adding an actual game loop. A free-walking avatar is intentionally avoided because locomotion does not serve the central fantasy.

## Visual Direction

Retain handcrafted isometric dollhouses, deep indigo void, warm tungsten light, brass mechanisms, paper, worn wood, and the cracked porcelain Attendant.

New key scenes:

- empty brass foundation receiving evidence
- kitchen with a visibly ambiguous third place
- impossible hallway with a blank wall and latent fourth door
- unsupported attic room assembled from inherited details
- completed house entering the answer press

Rooms should visibly retain earlier choices so the house feels accumulated rather than replaced.

## Audio Direction

- Each evidence source has a short tonal signature.
- Valid connections resolve two dissonant tones into a motif.
- Committing a room adds an instrument to the house theme.
- Dismantling removes those instruments from the final theme.
- Silence accompanies the discovery of the unsupported room.

## Architecture

Split the current monolithic presentation into focused modules:

- `src/story/types.ts`: serializable story state and identifiers
- `src/story/content.ts`: evidence, resonance, room-choice, and ending copy
- `src/story/state.ts`: pure transitions and validation
- `src/story/ending.ts`: final answer composition
- `src/audio.ts`: authored WebAudio motifs
- `src/render.ts`: scene rendering and event wiring
- `src/main.ts`: application bootstrap only

Save the current run to local storage after every irreversible commit. A player can continue from the start of the latest act, but cannot undo an act without starting over.

## Testing And Kill Tests

Unit tests must prove:

- a room cannot be committed before its required evidence and resonance are discovered
- choices persist into later inherited details
- the unsupported room is derived from prior choices
- exactly three of five final fragments survive
- final answers are stable regardless of selection order

Browser tests must prove:

- a complete desktop and mobile route takes every act through its required interactions
- alternate kitchen, hallway, and bedroom choices alter later content
- the final answer excludes dismantled fragments
- continue restores the current act

Release kill tests:

- the first meaningful choice cannot occur in under three minutes during an unassisted first playthrough
- every act contains a discovery before a commitment
- at least two later moments visibly recall each early choice
- the premise is understandable without mentioning artificial intelligence
- the unsupported room revelation is understandable without explanatory exposition
- a complete route takes at least fifteen minutes when read at a natural pace

## Scope Boundary

This expansion is one complete mystery with five acts. It does not add procedural generation, free movement, inventory puzzles, voice acting, online AI generation, or dozens of branches. Depth comes from authored discovery, accumulated context, and consequential compression.

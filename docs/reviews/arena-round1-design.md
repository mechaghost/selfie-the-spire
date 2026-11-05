# Arena review — round 1: game design and deckbuilder combat

Reviewed draft 1 of `docs/2d-combat-implementation.md` on November 5, 2026, with the research and `gameStore.ts` END_TURN/CALCULATE_INTENTS paths. This is an AI role-based review from two disciplinary perspectives, not a claim of human professional credentials or affiliation with Mega Crit.

## Perspective 1: game designer

### D1 — P1: The earliest layout gate tests the easiest scene

W1 requires one hero and one monster. The product promises a hero plus three readable monsters at 320px, but that hardest constraint is only exercised after renderer work and finished art. A one-enemy composition can pass while the actual game cannot fit.

**Remedy:** W1 must include placeholder silhouettes for small, bulky, tall and boss actors; prove 1/2/3-enemy layouts with real-sized HUD text and hand at 320×568 and 844×390 before W2. Do not require finished art to test this geometry. Define an explicit fallback layout when normal slots cannot fit, keeping non-overlapping controls and stable actor identity rather than shrinking text.

**Acceptance:** Screenshot and automated bounds assertions at the two limiting viewports, with three maximum-envelope monsters, visible intent values and 44px targets. A tester identifies each intent's owner without selecting it.

### D2 — P1: Full-run visual quality is discovered too late

W7 first promises full roster coverage and permits static art for less prominent enemies. That can turn the polished encounter into an isolated demo while the normal run repeatedly exposes unfinished actors. The pool contains 23 enemy assets, not simply the three showcase monsters.

**Remedy:** Add a reachable-roster coverage ledger in W0, with identity, available cutout, animation tier and encounter reachability. Require every reachable enemy to have an approved full-body silhouette and fallback before enabling the new renderer for an unrestricted run. Define explicit public milestones: controlled preview, full-run beta, portfolio release. Static fallback is acceptable as failure recovery; any intentional lower-motion production tier should meet an explicit quality bar rather than be labeled fully animated.

**Acceptance:** Enumerate every production encounter and resolve all actor asset IDs; produce a contact sheet across the five locations and log intentional animation exceptions. No fallback to a rectangular portrait.

### D3 — P2: Visual success lacks a player-comprehension gate

The test matrix is strong mechanically, but screenshots and parity cannot establish whether a new player reads the hero, target and impending danger. A busy Neo Miami scene can be technically correct and tactically opaque.

**Remedy:** Add a small formative playtest (e.g. five first-time players, reported as a sample rather than population proof). Ask each to identify their hero, identify the highest incoming threat, inspect a status, play a targeted card and end a turn without coaching. Record confusion and correction time; do not use this sample to claim universal usability.

**Acceptance:** No repeated critical targeting or intent-association confusion across participants; any repeated failure gets a revision and a fresh task check. Keep a phone recording of the final flow for portfolio evidence.

## Perspective 2: Slay the Spire-style deckbuilder specialist

### D4 — P1: Intent semantics are not specified across the turn boundary

The plan requires readable imminent actions, but does not say whether values are current previews or predictions after status decay. `END_TURN` currently decays statuses before enemy effect resolution; `CALCULATE_INTENTS` updates future moves afterward. A current-Weak attack preview can differ from resolved damage if Weak expires. Replacing the renderer must not silently promise a precise forecast it cannot deliver.

**Remedy:** Define a shared intent-view-model contract: effect-derived hit count, damage basis, Block/debuff components, and explicit preview semantics. During enemy execution retain the executing intent until its cue/effects finish; reveal the next intent only at the existing calculation boundary. Keep rules changes out of this pass. If exact end-turn forecasting is not implemented, label it a current preview in inspection and explain relevant expiry behavior without cluttering the main battlefield.

**Acceptance:** Fixtures for Weak/Vulnerable expiring, Strength changing, combined attack/defend, attack/debuff and multi-hit. Compare displayed components with the same effect payload used by the queue; verify old/next intents never swap prematurely.

### D5 — P1: New animation timings can stack on old queue waits

The plan lists attractive per-attack timings, but current code already includes a 650ms intent announcement and 400ms per-enemy delay in addition to animation work. Adding new anticipation/recovery without a timing ownership decision can make three enemies and multi-hit effects feel slow.

**Remedy:** Inventory current delays and designate one owner for each anticipation, impact and recovery interval. Replace redundant presentation waits rather than layering them. Define encounter-level pacing targets and a fast/reduced setting. Preserve readable hit ordering and status reactions; don't conflate faster playback with skipped gameplay effects.

**Acceptance:** Record elapsed time for single attack, three-hit attack, three-enemy turn and area attack with retaliation, under normal/reduced/disabled animation. Suggested provisional gates: ordinary single-card response under 800ms; ordinary three-enemy turn under 4s excluding deliberate boss spectacle; tune after player tests and report exceptions explicitly. Rules parity remains exact.

### D6 — P2: Showcase enemy choice needs explicit fixture boundaries

Street Runner + Rat/Golem/Spider is useful visual coverage, but the plan calls it the first finished encounter while promising unchanged encounter weights. A reviewer could implement it as a new production fight or make Ocean Drive harder to showcase the renderer.

**Remedy:** Name this a developer-only composite fixture, and separately select an existing production encounter for the end-to-end battle demonstration. Rendering must not imply world positions affect attack range, defense or enemy selection unless a later design change introduces those rules.

**Acceptance:** Production encounter definitions and weights are unchanged; composite fixture is absent from the production bundle. Both the fixture and the chosen legal encounter pass input and visual checks.

## Verdict

**Revise before implementation sign-off.** The actor-based direction, five-location reuse and separation of mechanics from presentation are sound. Resolve D1, D2, D4 and D5 in the specification before renderer/art production scales. D3 and D6 should be explicit work-package acceptance criteria. These are planning findings; no runtime bug was fixed or new renderer validated by this review.

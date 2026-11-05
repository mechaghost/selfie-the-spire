# Round 1 — developer/technical review

Reviewed draft 1 of `docs/2d-combat-implementation.md`, the research, and current queue, save, targeting and HUD code. This is an AI role-based engineering review, not a human credential or execution sign-off.

**Verdict: revise before implementation.** The architectural direction is sound, but persistence, queue synchronization and targeting contracts need concrete decisions. None of the proposed renderer tests has run.

## E1 — P1: save/checkpoint and RNG behavior are not specified tightly enough

Evidence: `saveRun()` only rejects `isResolving`; it does not reject a nonempty action queue. `PERSISTED_KEYS` excludes the queue, and `loadRun()` reconstructs RNG from the seed with a comment admitting that its position will differ. The plan promises interrupted-presentation saves and RNG parity without accounting for this current behavior.

Remedy: adopt explicit atomic command checkpoints. Persist only a complete stable gameplay boundary, with RNG state/cursor, save-schema version and visual-mapping version. State whether reloading during an unresolved card/turn restores the last completed command or resumes an effect journal; the former is much smaller scope. Save before accepting the next command and do not depend solely on the 100ms debounce. For old saves lacking RNG state, document a deterministic legacy fallback and do not claim exact historical continuity. Keep this prerequisite distinct from aesthetic renderer work.

Test: reload before/at/after each impact and enemy-turn phase; verify a restored command cannot partly spend energy, lose its card or gain partial rewards. For new saves, a full resumed run must match uninterrupted RNG and deck order. Include old saved runs and localStorage failure.

## E2 — P1: presentation wait protocol still has two possible clocks

Evidence: `resolveEffects()` already inserts `PLAY_ANIMATION`, 250ms delay, damage, stagger, 320ms delay; `resolveQueue()` advances via timers. Draft 1 adds impact timestamps, acknowledgments and bounded waits without stating which replaces these delays. Area damage is a serial set of queue actions despite its simultaneous visual comment.

Remedy: define one clock and precise queue-state transitions. Replace or adapt existing delay actions, do not add a second independent animation scheduler. Specify stable IDs for nested expanded actions, impact-order mapping, deadline ownership and exactly-once settlement. Cancellation from a new battle must invalidate both queued timer continuations and renderer callbacks. Context loss skips visual waiting but does not alter effect ordering. Define when game over/victory removes actors versus when defeat feedback finishes.

Test: injected duplicate/late acknowledgments, timeout and cancellation at every transition; multi-hit and area attacks with lethal first target, Thorns and mixed effects. Compare after each authoritative action, not just end-of-fight.

## E3 — P1: DOM inspection dialog conflicts with stage targeting

Evidence: the current hand opens a native `CardInspector` dialog, and target selection is a list of buttons inside that modal. Draft 1 also says tapping the world monster while targeting selects it. A modal dialog makes the world behind it inert.

Remedy: choose one contract. Retain modal target list as accessible fallback; if arena targeting is desired, close the modal into a dedicated nonmodal targeting state and restore focus when cancelled. Centralize selected card/target state rather than keeping incompatible local state inside `HandHUD`. Ensure End Turn is inactive during confirmation and resolution.

Test: touch and keyboard through inspect → Play → target → cancel/commit; target disappears; focus after cancellation; no accidental click-through when a modal closes. Check zoom and screen-reader navigation.

## E4 — P1: fallback and asset ownership need an actual resource contract

Draft 1 calls for both missing-asset and renderer fallbacks but defines fallback as an image inside the same potential failed renderer. It does not say which component owns shared atlas references, fetch cancellation, bundles, textures or async initialization after unmount.

Remedy: define resource ownership and lifetime: stage-owned Application/ticker/listeners; shared asset-cache acquire/release with no destroying textures still in use; generation tokens for pending loads; explicit cleanup after StrictMode double mount. Add a minimal DOM actor layer using local transparent fallback assets if Pixi cannot initialize or loses context permanently. Reserve a local built-in silhouette fallback when an individual actor asset fails, so a broken remote URL does not block play. Define loading behavior before player input unlocks.

Test: missing atlas JSON/page, failed remote actor, rapid district changes, unmount during async init, duplicate mount, forced context loss, offline transition. Resource counts should settle after repeated cycles; input remains usable.

## E5 — P2: coordinate contract must replace all old hit-testing paths

Evidence: `TargetingArrow.tsx`, `CardItem` drag logic and `EntityPanel` currently use DOM/client-space coordinates and independent radius heuristics. Merely publishing normalized scene anchors will not remove those inconsistencies.

Remedy: name coordinate spaces: logical stage, CSS-local stage, viewport/client, and backing-buffer/device pixels. One projection/hit-test service must serve HUD, arrow, drag preview and commit. DPR affects rendering resolution, not client hit testing. Use actor slots to provide stable hit regions during lunge. Remove the old radius-plus-25 heuristics, and compute targets from living entities only.

Test: stage offset within page, scrolling, browser zoom, DPR 1/2/3, canvas letterboxing, resize while targeting, overlapping tall sprites, dead actor removal. Pointer location and selected DOM target must agree.

## E6 — P2: performance and coverage are aspirations rather than measurable release criteria

Draft 1 gives useful budgets but does not define capture method, device tier, acceptable percentile frame time or failure policy. The five-location matrix and full roster imply substantially more art than the initial slice.

Remedy: name representative devices before W1, define a repeatable scene/script and frame-time/resource recording approach. Assign a minimum supported configuration and fallback threshold; report measured texture estimates separately from actual browser/GPU memory. Maintain a roster manifest checklist showing finished animation versus approved static fallback. Require all reachable enemies to have valid manifests before enabling the full run.

Test: repeatable 10-minute scenario, battle/location churn, cold and warm cache. Record p50/p95/p99 frame times, long frames, texture dimensions/counts and loaded bundle ownership; test a full reachable roster through asset validation.

## Strengths worth preserving

- Renderer is presentation-only; effects remain data-driven.
- No mandatory React upgrade; plain Pixi mount is appropriately bounded.
- Separate visual and combat RNG.
- Five locations are data-driven without secretly changing encounter balance.
- Honest distinction between limited preview and complete-run release.

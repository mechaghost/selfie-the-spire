# Round 2 — developer/technical review

Reviewed draft 2 and current `playCard`, `cleanupPlayingCard`, `resolveQueue`, persistence and RNG implementations. AI role-based review; no implementation/test execution is implied.

**Verdict: much stronger; one new P1 and one recovery-policy clarification remain before implementation.** The binding decisions provide a workable scope and resolve the original conceptual gaps.

## Previous findings

| ID | Status | Assessment |
|---|---|---|
| E1 | Addressed in design, with E7/E8 follow-through | Stable command checkpoints and explicit RNG snapshots replace unsafe debounce assumptions. |
| E2 | Addressed in design, with E7 follow-through | One queue clock, ordered child IDs, bounded barriers, late callback handling and terminal presentation window are now specified. |
| E3 | Addressed | Native modal closes before stage targeting; controller, focus and commit semantics are explicit. |
| E4 | Addressed | Ownership, async generations, reference counts and independent DOM fallback are explicit. |
| E5 | Addressed | Named coordinate spaces and one hit-test service replace competing heuristics. |
| E6 | Addressed as planning gates | Device selection is a W0 deliverable; percentile timing/resource churn and full roster ledger are specified. Actual measurements remain outstanding. |

## E7 — P1: played-card ownership still depends on an independent visual timer

Current `playCard()` removes the card from hand, puts it into nonpersisted `playingCards`, and schedules `cleanupPlayingCard()` after 800ms. That cleanup performs a **gameplay mutation**: it moves the card into discard or exhaust. A fast/disabled-animation command can settle before 800ms, checkpoint a state where the card is absent from every persisted pile, or allow another draw/reshuffle before the prior card reaches discard. Changing animation timing therefore changes gameplay despite queue parity goals. Victory also cancels outstanding timers.

Required decision: define an authoritative card-resolution zone/ownership step. On accepted play, remove the card from hand into command-owned resolving state; run effects; finalize its discard/exhaust destination in the command coordinator, including all terminal-result paths, **before checkpoint and before accepting the next command**. Visual `playingCards` are ghosts/references only and can disappear later without changing any pile. During a card's own draw effects, it must remain unavailable for reshuffle unless game design explicitly chooses otherwise. Characterize the old timer-dependent behavior, fix the invariant as a separate prerequisite, then freeze the rules baseline used for visual parity.

Tests: zero-cost draw, empty draw pile reshuffle, card that both draws and exhausts, Power, last-enemy kill, player defeat by retaliation, repeated next-card input, reduced/disabled animation, and reload before/after ownership finalization. Assert every physical card instance has one authoritative owner, and no ownership mutation is driven by a rendering callback.

## E8 — P2: define unsafe legacy-save recovery, and RNG snapshot API

The new-save policy is implementable, but a legacy save may already contain `isPlayerTurn: false` with no queue. Its previous command checkpoint cannot be reconstructed. Do not describe every legacy save as safely resumable merely because new saves will be atomic.

Required decision: versioned validation classifies legacy saves into resumable stable states versus unsafe/incomplete states. Preserve raw unsafe data, explain the problem and offer an explicit recovery/new-run path; do not silently restore an idle renderer over an unusable game phase or invent/replay missing effects. For stable legacy saves, allow the documented seed-based RNG migration, acknowledging replay divergence. Keep this separate from valid v2 checkpoint restoration.

Implement `RNG.snapshot()`/`RNG.restore()` around the generator's actual internal state and algorithm version, or a bounded cursor with all draws counted. Current `nextInt()` calls the generator directly, so adding a counter only to `next()` would be wrong. Validate snapshot range/version before restore. Prefer fixed-size generator state to replaying an unbounded cursor from untrusted storage.

Tests: stable legacy map/player-turn/reward saves; legacy enemy-turn or missing/inconsistent pile data; malformed RNG snapshots; `next`, `nextInt`, randomElement and shuffle continuity through snapshot/restore.

## Minimal-scope recovery policy recommended

- Restore the last complete v2 command checkpoint; do not resume partial effects.
- Keep an in-memory checkpoint even if persistent storage fails, but communicate that reload recovery is unavailable.
- Do not make progress persistence contingent on renderer readiness/completion.
- Quarantine unsafe legacy states rather than adding a complex old-queue reconstruction engine.
- Fix card ownership and RNG capture before establishing the baseline for renderer equivalence.

No further renderer or asset-system expansion is needed to address these findings.

# 2D combat plan — three-round review log

Review method: three AI reviewers cover five distinct role lenses: game designer; Slay the Spire-style deckbuilder specialist; art director/2D artist; UX/UI designer; developer. These are role-based critiques, not external human expert certification. Each round reviews the latest specification; findings are incorporated before the next round. No implementation is implied by a plan review.

Specification: [2D combat implementation](2d-combat-implementation.md).
Research: [2D arena research](2d-combat-arena-research.md).

## Round 1 — feasibility and missing contracts

Completed against draft 1. All five lenses requested revisions before affected implementation.

Reports: [game design + deckbuilder](reviews/arena-round1-design.md), [art + UX/UI](reviews/arena-round1-art-ux.md), [engineering](reviews/arena-round1-engineering.md).

| Findings | Resolution in draft 2 |
|---|---|
| D1, U2 | W1 includes worst-case three-monster/10-card phone layouts before art lock. |
| D2, A1 | W0 reachable roster ledger; separate preview, beta and portfolio quality gates. |
| D3 | First-time-player comprehension protocol with formative evidence limits. |
| D4 | Current-preview intent semantics and executing/next action boundary. |
| D5, E2 | One coordinator replaces old delays; effect IDs, cancellation and deadlines. |
| D6 | Composite encounter is dev-only; legal production fight verified separately. |
| A2 | Shared light, scale, anchor, padding and mirroring style sheet. |
| A3 | Exact selfie guarantee, preview and separate head-customization spike. |
| U1, E3 | Close modal before nonmodal arena targeting; explicit focus and commit rules. |
| U3, E5 | Stable slots and HUD identity; unified coordinate/hit-test service. |
| U4, E4 | Loading/degraded states, DOM fallback, reference-counted resources and disposal. |
| E1 | Atomic command checkpoints and RNG persistence prerequisite. |
| E6 | Named-device requirement and repeatable frame-time/resource measurements. |

“Resolved” here means addressed in the specification, not implemented or runtime-verified.

## Round 2 — adversarial review of revised specification

Completed against draft 2. Reports: [design](reviews/arena-round2-design.md), [art + UX/UI](reviews/arena-round2-art-ux.md), [engineering](reviews/arena-round2-engineering.md).

All Round 1 findings were addressed in the specification. Round 2 exposed one additional P1: E7, card disposal was tied to a visual cleanup timer. Draft 3 makes resolving-card ownership/finalization authoritative before checkpoints and before freezing the parity baseline. E8 adds unsafe legacy-save quarantine and an actual fixed-size RNG snapshot API.

D7/A4 consolidate release tiers; D8 qualifies intent previews at the decision point; A5 specifies loop/completion/missing-clip behavior; U5 removes duplicate target focus paths and live-region noise; U6 adds concrete contrast checks. All are written requirements, not implementation evidence.

## Round 3 — final readiness review

Completed against draft 3. Reports: [game design + deckbuilder](reviews/arena-round3-design.md), [art + UX/UI](reviews/arena-round3-art-ux.md), [engineering](reviews/arena-round3-engineering.md).

| Perspective | Final plan verdict | Evidence still required |
|---|---|---|
| Game designer | Ready for staged implementation; D1–D8 addressed | Worst-case composition, first-time-player tasks and full-run quality |
| Slay the Spire-style specialist | Ready for staged implementation; D1–D8 addressed | Intent understanding, timing and action-level parity |
| Art director / 2D artist | Ready for W0/W1; A1–A5 addressed | Finished cutouts, animation, style consistency and full roster coverage |
| UX/UI designer | Ready for W0/W1; U1–U6 addressed | Real touch, screen reader, contrast and target association checks |
| Developer | Begin W0a; E1–E8 addressed | Actual invariant tests, lifecycle tests and device profiling |

Nine review reports cover fifteen role-specific assessments across three successive drafts. All 27 finding IDs are addressed at specification level. No remaining material plan blocker was reported in Round 3. The reviewed document is now labeled specification v1; the final label and this summary do not change the reviewed technical decisions.

The most important sequencing decision is to fix and verify command-owned card disposal plus atomic saves/RNG before freezing the renderer parity baseline. Do not skip directly to animation work and call the old timer-driven behavior the reference.

## Evidence boundary

This review validates the written plan only. Finished artwork, renderer code, device measurements, player usability tests, and a live deployment remain implementation work. Existing local tactical/victory changes are not part of this documentation pass.

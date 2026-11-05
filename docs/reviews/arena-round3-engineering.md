# Round 3 — final developer/technical review

Reviewed draft 3, including the binding Round 1 and Round 2 contracts, against the previously inspected queue, persistence, RNG and input implementation. This is an AI role-based specification review. No renderer code or new runtime verification was performed.

**Verdict: ready to begin staged implementation, starting with W0a. No unresolved material engineering specification blockers found. This is not release approval.**

## Finding closure

| ID | Final assessment |
|---|---|
| E1 — checkpoints/RNG | Addressed: stable command boundaries, queue/in-flight guards, versioned persistence, explicit storage-failure behavior and bounded legacy recovery. W0a precedes the visual parity baseline. |
| E2 — queue clock | Addressed: one coordinator replaces existing presentation delays; ordered action IDs, exactly-once barriers, cancellation and bounded terminal presentation are specified. Renderer callbacks cannot apply effects. |
| E3 — modal targeting | Addressed: native inspector closes before nonmodal targeting; shared controller, no duplicate submission and explicit focus restoration. |
| E4 — resource/fallback ownership | Addressed: stage ownership, shared reference-counted assets, async generation checks, StrictMode cleanup, and independent DOM/local fallback. |
| E5 — coordinates | Addressed: logical/CSS/client spaces and backing pixels are separated; one hit-test/projection service replaces independent heuristics. |
| E6 — measurable gates | Addressed as planned gates: device identification, percentile frame times, resource churn and complete actor coverage. These are not measured results. |
| E7 — card ownership | Addressed: authoritative resolving-card zone, discard/exhaust finalization on terminal paths before checkpoint/next command, and presentation-only flying ghosts. The baseline is frozen after this correctness prerequisite. |
| E8 — legacy saves and RNG API | Addressed: fixed-size validated algorithm-state snapshots across all RNG paths; unsafe legacy states are preserved/explained where possible rather than inventing missing effects. |

## Implementation guardrails

1. Keep W0a correctness work independently reviewable. Tests must establish card ownership, effect ordering, RNG continuity and atomic reload before W0b freezes the baseline.
2. Keep the authoritative finalization path independent of renderer availability, clip presence and terminal result overlays. Presentation can be skipped; state settlement cannot.
3. Add assertions and fake-clock tests around the actual coordinator and storage entry points, not only mocks of the planned interface.
4. Treat the W1 mobile composition and real-device measurements as genuine stop/go gates. A specification cannot prove the art fits or the scene performs.
5. Do not mark full-run release complete until every reachable actor has a validated manifest, appropriate motion tier and independent local fallback, including legacy/runtime reachability exceptions.

## Evidence still required

Implementation is still outstanding. Planned tests include new-save uninterrupted/resumed equivalence, unsafe legacy recovery, reduced/disabled-motion parity, duplicate/late callback suppression, context loss, StrictMode disposal, zoom/DPR target alignment, full actor validation, and device frame-time/resource measurements. None of those renderer-specific tests is claimed passed by this review.

The existing tactical tests from earlier work do not certify this future renderer. Production deployment should follow the final specification's acceptance gates and live mobile smoke test, with the previous release retained for rollback.

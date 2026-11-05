# Upgrade execution log

## UI release — November 5, 2026

Deployed `f1bf50350c6c313b5d747de647908ed4cba4ec02` to Railway production, deployment `81c7871a-1362-4d71-80ae-7ad804dc18dc`, status SUCCESS. Live asset: `/assets/index-DufaYwnP.js`.

Verified through real UI at selfiethespire.com: 390×844 hand cards measure 152px with 12px rules text; 320×568 compact hand and 844×390 landscape preserve controls and targets. Completed the existing test run's floor-2 fight, inspected victory rewards, reached the lower reward at 320px, added Ricochet, returned to map, and reloaded with a 14-card deck. Browser warn/error log empty. `/health` returned ok. These are browser viewport checks, not physical touch-device certification.

Evidence in ignored local artifacts: `tests/.e2e-out/live-larger-cards-landscape.png`, `tests/.e2e-out/live-victory-larger-cards.png`.

## Reviewed upgrade plan

Active objective: execute `2d-combat-implementation.md` through its staged gates. W0a correctness work follows this UI release. No 2D renderer or new actor art is claimed deployed yet.

## W0a — correctness baseline

Implemented command-owned resolving cards and terminal finalization; visual ghost cleanup no longer moves cards. Save schema v2 records fixed-size Mulberry32 state and writes only stable command boundaries. Reload validates ownership and whitelists data fields. Unsafe saves are preserved for recovery; storage failure surfaces a notice while play remains available.

Verified `tests/command-checkpoints.mjs`: 10,000-value original RNG parity; mixed RNG call continuity; slow multi-hit beyond 800ms; draw/reshuffle ownership; Power/exhaust; lethal hit and retaliation death; atomic enemy turns; actual store reload; quota failure/recovery; unsafe legacy recovery; save field injection resistance. Existing action-guards, save-and-generation, combat-tactics and copy-contracts pass. TypeScript, Vite production build and diff whitespace check pass.

This baseline also includes the previously reviewed tactical changes (varied enemy moves, enemy Block expiration, Voltage attack payload and starter Cheap Shot/Torch It). Renderer parity starts after this commit; these are not renderer balance changes. Updated obsolete combat-layout guidance to the approved shared-ground actor model. No new renderer is live yet.

## W0b / W1 progress

Corrected rules baseline: `b69d51d`. Presentation work must compare against this revision. Hardware device models and a five-person formative study are not available in this environment; no physical-device or participant results are claimed.

Added a pure CSS-pixel arena layout and shared hit-test projection. Automated `tests/battle-layout.mjs` verifies 105 combinations of dimensions and enemy counts: minimum 44px targets, nonoverlap, art/HUD clearance, viewport offsets, dead-target rejection and stable slots. Added a development-only `?arena-study=1` with ten actual cards, long monster names, status-overflow notation, three maximum-envelope silhouettes and a boss variant. Browser checks at 320×568 and 844×390 caught and corrected compact card-art clipping and landscape actor compression. Selection and defeated-slot stability checked through UI. Evidence: `tests/.e2e-out/arena-study-320.png`.

W1 is in progress, not art-scale lock: silhouettes are placeholders, status inspection and gameplay integration remain in W3, and physical touch/comprehension gates remain outstanding. No prototype is included in production. Next: complete roster ledger, renderer lifecycle/manifests, then shared targeting and presentation coordinator.

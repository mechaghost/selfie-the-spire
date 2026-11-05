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

## W2 — renderer foundation

Pinned plain PixiJS 8.22.0, preserving React 18. Implementation follows the [official Application lifecycle](https://pixijs.com/8.x/guides/components/application); renderer state has no access to store actions or gameplay RNG. Added `BattleScene`, React `BattleStage`, shared texture leases, capped DPR, visibility/reduced-motion handling, canvas disposal, context-loss fallback and retry. DOM fallback is outside the canvas, with inline vector recovery if its local image fails. The approved full-body art/atlas pipeline remains unfinished; current scene uses explicitly tagged placeholder silhouettes.

All 23 enemy definitions (including the two developer/legacy definitions) plus five hero archetypes now have manifest entries. Runtime trace: map generator selects easy/elite/boss pools, enterNode resolves pool IDs and caps encounters at three; Vending Golem appears in developer fixtures and Payphone Phantom has no production-pool reference. Both remain covered for older saves. `renderer-assets.mjs` joins every encounter and definition to the registry and checks local fallback existence. The five floor mappings are tested, but location artwork is not produced yet.

Verified shared leases, late load/disposal, retry after load failure, StrictMode-style pending ownership and 20 resource-disposal cycles in automated tests. Browser: 20 actual scene mount/unmount cycles each produced exactly one canvas on mount and zero after unmount; forced fallback preserved four actors and removed canvas; re-enable restored graphics. 390×844 preview rendered; console warning/error log empty. Evidence: `renderer-mount-cycles.json`, `renderer-mobile-preview.png` under ignored `tests/.e2e-out`. Adjusted HUD vertical anchors after the mobile preview revealed excessive separation from actors on tall screens; that adjustment passes pure layout checks, with refreshed visual proof still pending.

TypeScript, layout/asset tests, production build and diff check pass. Root production dependency audit reports zero vulnerabilities. Pixi remains excluded from the production bundle until gameplay integration; live release is still the verified larger-card/victory release. W2 is not fully gated: actual context-loss injection, late-init browser tests, district artwork loading, full memory/performance profiling and physical-device checks remain.

## W3 interaction and generated-monster pass

Added one nonmodal card-target controller with revalidation, Escape cancellation, text targets and actor target buttons. End Turn is disabled while selecting. Exact shared rectangle detection replaces radius-padding mismatch in card release, arrow preview and legacy entity highlight. Actor HUD derives attack counts/damage from executable effects. Development `?review=1&arena=1` connects the renderer to actual combat without enabling it on production.

Tests: `combat-interaction.mjs` passes cancellation/no spending, invalid target rejection, duplicate commit, target gaps/dead rejection and effect-derived intent values. Existing action guards and checkpoint tests pass. Browser: inspected Torch It, entered nonmodal targeting, verified first monster focus and disabled End Turn, escaped back to inspector, then played against Rat: HP 13→9, energy 3→2, Burn applied. Focus restoration after commit still needs refinement; full keyboard and mobile interaction gates are not claimed complete.

User explicitly requested image-generated monsters. Used built-in image generation for original Alley Rat, Vending Golem and Fire Escape Spider transparent idle cutouts, saved under `public/assets/battle/actors/` and connected all three manifests. Exact prompts and provenance: `battle-art-prompts.md`. Alpha-zero background pixels verified; transparent composition observed in the actual combat preview. Mobile screenshot: `tests/.e2e-out/generated-monsters-mobile.png`. Small sprite readability/scale remains a concern at three enemies in portrait; composition must be refined. Hero remains a technical placeholder; these three monsters have no authored attack/hit/defeat frames yet and are marked review, not approved.

## Hero art and portrait composition

Generated original full-body Street Runner idle artwork and identity-referenced attack key poses for Street Runner and Alley Rat with the built-in image tool. Saved all three in `public/assets/battle/actors/`; exact prompts in `battle-art-prompts.md`. The starter hero now resolves to generated art. Added optional key-pose texture loading and swapping from existing lunge signals as a temporary integration; this is not the final action-ID/timing coordinator or a complete animation clip. Reduced-motion mode keeps the idle pose. Missing optional pose textures retain usable idle art.

Tall portrait with three monsters now uses two depth rows, wider actor envelopes and a larger hero envelope. Raised the technical street horizon so both rows stand over the ground region. Browser visual proof at 390×844: `tests/.e2e-out/hero-monsters-depth-layout.png`. Pure layout tests (105 cases), asset/pose existence and ownership tests, and TypeScript pass. The 320px short layout still uses the compact row and needs additional art readability review. Authored backgrounds, remaining poses/roster, motion protocol, selfie contract and release gates remain open.

## Five generated district plates

Built-in image generation produced Ocean Drive, Wynwood After Dark, Floodline Underpass, Club Backlot and Skyline Rooftop environment plates. Original PNGs are saved in `public/assets/battle/locations/`; exact prompts/provenance are in `battle-location-prompts.md`. All location definitions reference these assets and remain in review. These flattened plates do not yet satisfy the independent background/ground/foreground animation package.

Renderer loads the selected location with shared leases, reinitializes on district changes and releases old resources. Missing art retains the technical ground fallback. Added pure aspect-preserving ground-aligned framing, checked over 10 viewport/horizon combinations for full coverage and no distortion. Tests verify all five files exist and the nine-floor mapping remains unchanged.

Browser proof: actual floor-3 combat displays Wynwood with generated hero and monsters at 390×844 (`wynwood-playable-mobile.png`). All five district transitions reached ready in the local review scene; portrait captures saved as `district-*-mobile.png` in `tests/.e2e-out`. Warning/error log empty. Underpass also inspected on desktop. This is not the complete five-district × encounter × viewport matrix, device profiling, layered-motion approval or release certification.

## Queue timing foundation

Centralized combat anticipation/recovery/announcement/enemy-gap timing in `combatTiming.ts`. The same authoritative queue executes normal, reduced and off modes. Added generation-guarded `CombatClock` so even a cancelled callback already captured by a host scheduler is inert. Added battle/command/action identities and begin/complete notifications; child expansions retain parent command identity. Notification listeners cannot interrupt authoritative effects if they throw. These completion events describe queue processing, not yet structured HP/Block impact-result events.

`combat-presentation.mjs` verifies identical player/enemy state, piles, RNG and rewards after card and enemy-turn commands across all three motion modes, exactly one completion per started action, unique IDs, shared command ancestry, throwing subscriber isolation and late-callback cancellation. Measured fake-clock fixture: normal card 320ms, three-enemy turn 2100ms; reduced 100/960ms; off 0/0ms. This is one characterized encounter, not full-roster pacing certification. Existing action guards, checkpoint tests and tactics tests pass. Actor arena follows prefers-reduced-motion for queue policy and key poses.

Remaining protocol work includes structured impact outcomes, action-keyed scene reactions, explicit timing/deadline tests across terminal/area/multi-hit/status paths, and full renderer parity. New graphics remain development-only; no production deploy in this pass.

## Authoritative impact feedback

Added action-identified result notifications for actual damage/Block consumption, fully blocked hits, Block gain, capped healing, Spikes retaliation and separate Burn/regen outcomes. The visual layer cannot mutate combat. DOM feedback labels remain independent of canvas availability; bounded subscriptions/timers clean up on unmount. Renderer adds a brief result-colored reaction and small recoil, skips motion for reduced-motion/hidden-page cases, and expires reactions using elapsed time so background return does not replay stale hits. Full authored hit/defeat animation remains outstanding.

Expanded `combat-presentation.mjs` verifies partial Block (3 consumed/5 HP lost), capped heal (35), fully blocked hit, retaliation (3) and separate Burn -3 / regen +2. Timing parity and checkpoint regressions still pass. Browser: Finesse showed `+3 Block` and hero Block 3; Haymaker showed `-8` and Golem HP 34→26; enemy turn displayed Burn -3 and settled with refreshed intents. Completion restored focus to End Turn. Console warn/error log empty. Evidence: `combat-block-feedback.png`, `combat-damage-feedback.png` under ignored `tests/.e2e-out`.

Corrected legacy floating damage labels to show HP actually lost rather than pre-Block attack power. Further checks remain for status labels, full death/result timing, all-mode real-browser behavior and animation art coverage. No release deployment in this pass.

## Separate portrait and battle appearance

Generated and saved Chrome, Volt, Concrete and Smoke full-body idle cutouts using built-in image generation. All five archetypes now have generated actor art in review. Alpha-zero transparency verified for the four new PNGs; prompts/provenance saved in `battle-hero-prompts.md`. Attack/hit/guard/defeat coverage is not complete.

Added `Player.combatAppearance` and canonical archetype/registry normalization. Generated-run creation no longer assigns portraitUrl to spriteUrl. The same lookup drives the pre-run battle preview and combat actor; appearance persists as player data. Legacy saves lacking appearance use Street Runner, preserve the portrait, and show a migration notice when a personalized portrait is present. Invalid/foreign/nonhero registry keys fall back safely without loading arbitrary assets.

Acceptance UI now shows portrait beside full-body battle character, discloses that only the portrait is personalized, and offers Back to menu before starting. `combat-appearance.mjs` verifies five-archetype preview/start/reload parity, preserved portrait, distinct battle asset, unchanged RNG, old-save notice and invalid-key fallback. Existing checkpoint and save/generation tests pass. Browser at 320×568 confirms both images/disclosure readable and Back returns to menu without starting. Screenshot: `tests/.e2e-out/appearance-preview-mobile.png`. Full selfie provider flow, missing-image acceptance behavior and all-archetype browser matrix remain to verify.

## Early encounter monster art expansion

Generated Stray Voltage (electrical cable hound), Dumpster Crawler (scrap crab) and Graffiti Imp (street goblin) with built-in image generation. Copied original transparent PNGs into the actor asset directory and mapped their existing encounter IDs to the new artwork. Saved exact prompts and updated the coverage ledger, including the previously stale Street Runner entry. All three images inspected visually and alpha verified (48–61% fully transparent pixels); idle art remains in review, not approved animation.

Renderer asset validation, TypeScript and production build pass; git whitespace check clean. This pass validates asset/registry integration, not a new browser or hardware review. Six monster designs and five hero archetypes now have generated idle art; seventeen monster definitions remain placeholders. New arena is still development-only and has not been deployed.

## Complete early-pool idle artwork

Generated Smoke Specter, Taxi Ghost, Manhole Mimic and Neon Hunger with built-in image generation and recorded exact prompts. All eight unique easy-pool enemies now have generated idle artwork; total monster coverage is ten of 23 definitions. Thirteen entries still need art. Alpha inspection confirms 45–65% fully transparent pixels for the new four assets. Renamed the displayed Junkie enemy/encounter to Neon Hunger to match its new neon-consuming creature design; stable IDs and mechanics preserved.

Added per-slot roster selection to the development art review scene, including correct Billboard selection for the boss layout. The first mobile inspection caught an extra navigation row displacing the grid; controls now share the existing horizontal toolbar. At 390×844, verified Specter/Taxi/Mimic then Neon Hunger/Taxi/Mimic render as transparent actors against Ocean Drive with legible HUDs and cards. Console warning/error log empty. Evidence: tests/.e2e-out/early-monsters-mobile.png. This is composition review, not actual encounter or hardware certification.

Renderer assets, combat tactics, copy contracts, TypeScript and production build passed before the review controls were added; TypeScript/whitespace checked again after controls. Remaining work includes elite/boss art, authored motion, full gameplay/device verification and release. Arena remains development-only.

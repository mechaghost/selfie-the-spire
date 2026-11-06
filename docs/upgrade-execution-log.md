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

## Full roster idle-art coverage

Generated thirteen additional original transparent monster assets with built-in image generation: Boombox Brute, Neon Wraith, Sewer Slime, retained Payphone Phantom, Neon Sentinel, Chrome Phantom, Voltage King, Circuit Breaker, Neon Yakuza, Chrome Bouncer, Billboard, Subway Wyrm and DJ Phantom. Inspected generated compositions, verified alpha transparency (29–72% fully transparent pixels), copied originals into project assets, assigned foot anchors and connected every existing enemy ID to its own artwork. Exact prompts and source dimensions are recorded. All 23 enemy definitions and five hero archetypes now have generated idle cutouts; technical vectors remain emergency renderer fallbacks only.

This closes primary idle-art coverage, not art approval or animation coverage. Generated source images still require full-roster mobile staging, consistent apparent scale/pivot review, edge/glow cleanup where needed, runtime compression and performance measurements. Some designs fill their source frame closely, so margin/pivot consistency needs inspection in motion. Authored attack/hit/defeat coverage remains incomplete. No new browser review or production deployment in this pass.

Renderer asset validation, TypeScript, production build and whitespace checks pass. The reviewed arena remains development-only pending remaining gates.

## Per-actor motion foundation

Replaced uniform breathing with pure motion profiles: restrained weight shift for heavy machines, hovering for spirits, planted breathing for agile actors and squash/stretch for slime. Added attack anticipation, directional contact at 140ms and recovery within the existing 320ms queue beat. Existing generated attack key poses still layer with the transform; this does not substitute for the missing authored pose/clip coverage. Defeated actors settle and fade over 280ms while their semantic slots remain unchanged. Terminal combat may still leave the arena before the full defeat motion; result/defeat presentation gating remains open.

The scene tracks each legacy animation's unique token so snapshot refreshes do not restart attacks and successive attacks can restart without an intervening idle render. Absolute elapsed time expires stale motion after hidden-tab pauses. Reduced motion skips transient transforms and uses the static defeated state. Renderer logic remains presentation-only and cannot change the combat queue.

New actor-motion tests cover direction, wind-up/contact/recovery, stale elapsed time, repeated tokens, defeat and reduced-motion behavior. Combat presentation parity tests, TypeScript, production build and whitespace checks pass. No browser animation review in this pass; visual easing, full roster bounds and authored motion remain to verify before release.

## Intent Block accuracy

Found that arena/legacy intent previews used base Block while the queue applied recipient Dexterity per effect. Extracted shared blockGain calculation and used it in the authoritative GAIN_BLOCK handler, arena intent model and inspection descriptions. Legacy enemy panels now display the derived total instead of optional decorative intent.block metadata. Mixed attack/defend arena labels include the Block amount, and status names use the player-facing registry name. Enemy Block totals exclude effects granting Block to the player.

Added intent-block-parity coverage: 66 roster/current-Dexterity combinations compare previews against actual queue-applied Block, plus repeated Block effects and misleading decorative metadata. Combat presentation parity, copy contracts, TypeScript, production build and whitespace checks pass. These remain current-state previews; sequential status changes earlier in the move are not simulated, as disclosed by the inspection copy. Browser wrapping/short-screen mixed-intent review remains open. No deployment in this pass.

## Terminal presentation and preview qualification

Added a bounded 280ms overlay reveal delay for the development actor arena, matching its defeat transform duration. Victory/defeat and rewards are still committed by the authoritative queue immediately; no renderer completion is awaited and saves are unchanged. Existing reward checkpoints open immediately on mount. Reduced-motion preference, hidden document, unmount and result changes cancel/skip pending presentation work via CombatClock. Legacy production layout retains immediate reveal. Full terminal browser timing/focus verification remains outstanding.

Added the specified current-preview marker: intent models identify previewKind=current, damage badges show ≈ and expose a Current damage preview accessible label, with explanatory title text and inspection copy. This avoids presenting current modifiers as an exact end-turn forecast. Cleared stale plan introduction claiming implementation had not started. Attack marker wrapping and screen-reader behavior still require the planned viewport/accessibility checks.

Actor motion, command checkpoint and intent Block parity tests pass, along with TypeScript, production build and whitespace checks. No new live-site verification or deployment in this pass.

## First encounter attack key poses

Generated identity-preserving attack edits for Vending Golem and Fire Escape Spider using their idle files as references. Golem extends a heavy punch; Spider extends its foremost legs and opens its fangs. Preserved original PNGs, verified alpha, recorded exact prompts and connected both to the renderer. Source dimensions remain effectively the same as idle (Golem 1240×1269 versus 1239×1269; Spider 1536×1024). Foot anchors remain .94 pending motion review.

The first composite encounter now has attack key poses for hero, Rat, Golem and Spider. Added finite key-pose selection: idle during initial anticipation, attack from 80–240ms, idle through late recovery and any stale attack snapshot. This also prevents a hidden-tab return from holding a strike indefinitely. Motion tests exercise interval boundaries and reduced-motion fallback. Renderer assets, TypeScript, production build and whitespace checks pass.

These are key poses, not full animation clips or a finished-encounter gate pass. Hit/guard/defeat/celebrate artwork, pivot consistency in playback, full battle video, mobile art envelope checks and release gates remain open. No deployment or browser review in this pass.

## Independent optional-art streaming

Found scene readiness awaited every optional key pose and the full backdrop before actors could become ready, allowing missing optional assets to impose the 12-second image timeout. Background layers now stream independently; mandatory actor idle textures determine scene readiness, while optional poses load without blocking and fall back to idle on failure. Late arrivals reframe/update the current scene only while owned. The existing technical ground is visible while backgrounds load.

Fixed load-order-dependent composition by enabling child sorting and assigning stable roster z-indices to actor/shadow pairs and authored depth indices to backdrop layers. Network completion order no longer defines who draws in front.

Added controlled renderer tests with a minimal Pixi double and manually resolved/rejected Image loads. Tests cover delayed mandatory actor readiness, unresolved optional textures, reversed actor/background completion order, optional-pose failure, disposal during optional loading, mandatory actor failure, late-load disposal, listener removal and zero remaining leases. These exercise BattleScene directly but do not certify actual GPU behavior, visual layering or mobile frame times. Existing renderer asset tests, TypeScript, build and whitespace checks pass. No release deployment in this pass.

## Small portrait and landscape layout correction

Actual 320×568 combat with a ten-card hand exposed undersized monsters in the compact single row. Added a short-portrait depth preset for 220–299px arena heights: ordered HUD strip above, two enemies in the upper lane and one nearer the foreground. Hero remains lower-left, target slots remain stable and nonoverlapping, and art keeps its aspect ratio. Compact non-attack intent badges use numbers/icons with full accessible labels; inspection still spells out Block/status effects. Golem inspection was exercised successfully.

Actual 844×390 inspection found End Turn overlapping the Spider and the stacked hand extending below the viewport. Added a short-landscape side-hand grid: 180px side panel holding readable 152×220 cards, combat in the remaining width, controls in their own bottom row. Fixed the competing mobile.css bottom offset with a more specific actor-arena rule. Final screenshot shows all four actors and End Turn in distinct regions. Development fixture toolbar overlays the lower right of the evidence capture; it is not shipped in production.

Evidence: tests/.e2e-out/compact-depth-320.png and landscape-side-hand.png. Console warning/error log empty. Expanded pure layout checks to 168 cases including 250/288/299px heights; renderer streaming tests, TypeScript, build and whitespace checks pass. This is viewport emulation, not physical touch-device certification. Card scrolling/targeting in the new side panel and the full count/boss/district matrix still need testing. No deployment in this pass.

## Street Runner reaction artwork

Generated identity-preserving hit, guard, kneeling defeat and celebration key poses from the Street Runner idle reference. Saved transparent 1106×1422 originals and exact prompts, and registered optional poses. Renderer asset validation, TypeScript and whitespace checks pass. Defeat can use its registered pose; hit/guard event selection and victory celebration dispatch still require wiring and browser review. These images do not constitute completed clip/atlas approval. User asked how selfie personalization reaches combat: current implementation personalizes portrait/deck but uses shared archetype bodies; full-body selfie likeness remains unimplemented and must not be represented as available.

## Reaction pose dispatch

Connected actual damage/Thorns/Burn impact notices to hit key poses and Block-gain/fully-blocked notices to guard key poses. Reactions override ordinary attack/idle artwork for 220ms, while defeat and celebration take precedence. Missing optional artwork still uses idle. Victory snapshots request the hero celebration; it ends at 600ms. Defeat holds its registered final pose, including the static reduced-motion presentation. No visual path mutates combat state.

Expanded motion tests for hit/guard/cast expiration, finite celebration, held defeat, reduced-motion defeat and impact-to-pose mapping. Renderer streaming, authoritative combat presentation parity, TypeScript, production build and whitespace checks pass. Browser frame/transition review and full mandatory roster animation coverage remain open; no deployment in this pass.

## Lossless runtime asset packaging

Measured 41 original battle PNGs at 72,689,365 bytes. Added repeatable lossless WebP encoding with exact RGBA comparison for every asset; runtime total is 50,735,578 bytes (30.2% smaller). Preserved original PNGs under art-source/battle outside the public build, switched manifests to WebP, updated coverage references and recorded per-file dimensions/transfer bytes/decoded RGBA estimates in battle-art-package.json. No resizing or artwork alteration; decoded memory requirements are unchanged. This is not a completed mobile texture-memory budget.

Renderer assets, five-archetype appearance persistence, TypeScript, production build and whitespace checks pass. Browser at 390×844 reached ready with transparent hero/Rat/Golem/Spider and Ocean Drive; console warnings/errors empty. Screenshot: tests/.e2e-out/lossless-runtime-mobile.png. Full browser compatibility, measured cold/warm transfer, GPU profiling, resolution tiers and atlas packing remain open. No deployment in this pass.

## First encounter monster reaction assets

Integrated six previously generated transparent hit/defeat poses for Alley Rat, Vending Golem and Fire Escape Spider. Preserved PNG originals in the source archive, recorded exact reference prompts and registered optional WebP textures against existing damage and terminal presentation events. Asset packaging verified exact RGBA equality for all 47 images: 82,962,599 source bytes to 57,753,676 runtime bytes. No combat rules changed.

Renderer asset existence/manifest checks, finite motion and reduced-motion tests, and controlled optional streaming/disposal tests pass. The generated canvases match idle aspect ratios except Golem's one-pixel width difference. Alpha bounds reach some canvas edges; visual scale, anatomy, foot contact and transition consistency remain review gates. These are key poses, not completed animation clips. No browser visual approval or deployment is claimed for this pass.

## In-scene motion review controls and mobile defeat check

Added developer-only replay controls for idle, attack, hit, guard, cast and celebration, with hero selection and pose reset. Each replay supplies a fresh motion identity to the actual renderer; it does not modify combat state. Controls share the existing horizontally scrolling toolbar so they do not consume the arena's grid row. Missing artwork remains explicitly labeled as an idle fallback.

Exercised Rat hit replay and Rat/Golem defeat in the Pixi study. Desktop and 390×844 screenshots show grounded defeated silhouettes without moving surviving slots, and mobile cards/End Turn remain visible. Console warnings/errors empty. Evidence: tests/.e2e-out/monster-defeat-mobile.png. This is a composition fixture, not a legal combat or captured hit-transition approval. Defeated fixture HUD still displays its synthetic attack/status example; actual gameplay HUD is separate. Full motion capture, scale/pivot review at contact, and physical-device performance remain open.

## District atmosphere presentation

Added five distinct low-opacity ambient presets behind the actor layer: Ocean Drive pavement shimmer, Wynwood drifting dust, Underpass rain, Club Backlot reflected light pulses, and Rooftop wind particles. Sampling is deterministic and independent of gameplay RNG. At most 16 simple marks are drawn; no new images, filters, timers, or texture leases. Existing scene ticker stops while hidden; reduced-motion snapshots omit atmosphere completely. Existing flattened district artwork remains unchanged, so independent painted parallax layers are still outstanding.

New tests cover all five presets at four viewport sizes, deterministic sampling, disabled reduced-motion output, no Math.random calls, bounded mark count/opacity/position through a full day of elapsed time, and distinct district output. Renderer lifecycle/streaming tests, TypeScript, production build and whitespace checks pass. This pass has no browser aesthetic approval or physical-device frame-time measurement; those gates remain open. Changes remain local.

## Timed key-pose clip playback

Connected ActorVisual clip metadata to renderer playback through an absolute-time sampler. Supports variable frame durations, looping, hold-last or return-to-idle completion, skipped-frame catchup and reduced-motion terminal states. Reaction clips use impact elapsed time; ordinary clips use action identity timing. Added explicit 80/160/80ms idle/attack/idle timelines for Street Runner, Rat, Golem and Spider, preserving the existing 140ms contact beat. No animation completion callback controls combat.

Current frames reference registered key-pose names (or idle); validation rejects missing frame references and invalid completion/loop metadata. This is a key-pose timeline foundation, not a packed-atlas implementation or newly authored in-between frames. Atlas loading/trim metadata and full art approval remain outstanding.

Boundary/loop/hold/skipped-time/reduced-motion tests pass, as do renderer assets, streaming lifecycle, authoritative normal/reduced/off combat parity, TypeScript, production build and whitespace checks. No browser animation capture or deployment this pass.

## Atlas frame rendering foundation

Added optional inline atlas metadata with packed rectangles, untrimmed source dimensions, trim offsets and per-frame foot anchors. The renderer loads the atlas independently of mandatory idle readiness, builds Pixi texture views sharing the atlas source, and resolves arbitrary named clip frames. Individual key poses and idle remain available if loading fails. Views are destroyed without destroying their shared source before the atlas lease is released. Full manifest bounds are checked before creating views to avoid partial allocations on malformed metadata.

Tests use real Pixi Texture/TextureSource objects to verify untrimmed width/height, trim offsets, source sharing and disposal, plus invalid bounds and named-frame validation. Controlled renderer tests now exercise optional atlas arrival and scene-owned view cleanup; existing readiness/disposal assertions remain passing. Clip tests, TypeScript, production build and whitespace checks pass. No actors are assigned a production atlas yet: source packing, padding/extrusion, mobile texture tiers, real browser rendering and art approval remain open. This is renderer support, not an atlas release-gate pass.

## First packed monster atlas

Packed Vending Golem attack/hit/defeat into a 1244×3819 lossless WebP atlas with two-pixel edge extrusion. The repeatable build script copies original pixels without scaling or repainting, verifies the entire decoded atlas, and verifies every source-frame region byte-for-byte. Generated typed metadata preserves canvas dimensions and anchors. Atlas encoded size is 3,648,334 bytes; decoded RGBA estimate is 19,003,344 bytes, so this alone does not meet the overall mobile texture budget.

Registered this atlas in the actual actor manifest. Optional loading now avoids downloading individual poses covered by a successful atlas; on atlas failure, it releases that lease and loads individual pose fallbacks. Disposal prevents late fallback requests. Controlled renderer tests exercise successful no-duplicate loading, view cleanup and failed-atlas fallback with zero retained leases. Real Pixi frame tests, renderer assets, TypeScript, production build and whitespace checks pass. Browser visual verification of the packed asset, device memory measurements and further atlas/resolution work remain open; no deployment.

## Mobile atlas and fallback alignment review

Verified the registered Golem atlas's defeated pose at 390×844 in the Pixi layout fixture. Evidence: tests/.e2e-out/golem-atlas-mobile.png. Forced simplified graphics exposed divergent image framing: DOM images used bottom-centered contain inside the art rectangle instead of the canvas foot anchor. Extracted shared idle placement math and applied it to both canvas scaling and loaded fallback-image dimensions. Fallback source changes remount image state; failed images retain the technical silhouette, including while loading.

Rechecked mobile fallback geometry and graphics recovery: ready status returned, console warnings/errors empty. Evidence: tests/.e2e-out/fallback-aligned-mobile.png. Simplified mode still uses idle art for defeated actors and its recovery notice overlaps the lower foot area; this remains a polish concern. This review verifies composition/recovery, not attack-contact capture, GPU texture memory or physical-device certification. No deployment.

## Runtime texture resolution limits

Added power-of-two bitmap decode tiers: loose actors capped at 768px, atlases at 2048px, and location plates at 1536px. Pixi source resolution plus original logical frames preserve source-space anchors and atlas metadata; rounded dimensions keep every source coordinate inside the decoded extent. Browsers without supported bitmap resizing retain original images. Final texture lease disposal explicitly closes ImageBitmap resources after GPU source destruction.

The loose-asset manifest estimates aggregate decoded RGBA storage at 295,703,036 → 96,359,732 bytes. This is not simultaneous residency, measured VRAM, initial-download reduction, or a peak decode-memory measurement. Golem's atlas decodes at 622×1910 instead of 1244×3819. Original images still download and decode before resizing, so initial transfer and transient memory remain concerns for offline resolution variants.

Tests cover all registered loose asset dimensions, caps, source-space bounds, small-image preservation and atlas sizing. Controlled scene tests exercise resized bitmap creation and closing every owned bitmap at disposal. Mobile 390×844 shows aligned hero/monsters and the Golem atlas defeat with ready status and no console warnings/errors; evidence tests/.e2e-out/texture-tiers-mobile.png. TypeScript, build and whitespace checks pass. Physical-device quality/frame timing and the ten-minute performance gate remain open; no deployment.

## Complete-encounter motion parity sweep

Added a deterministic command-driving test over every production encounter pool: 22 encounter definitions × three seeds × normal/reduced/off motion = 198 complete battles. Uses real enemy factories, starter deck shuffling, playCard, endTurn, queue resolution, status ticks, enemy AI and terminal reward generation. Compares authoritative state after every command, including HP/Block/statuses, all card zones, RNG snapshots, rewards and terminal flags. Asserts no resolving card remains at a command boundary and no duplicate card ownership at battle end.

All comparisons pass. The 66 unique encounter/seed scenarios produce 62 victories and four defeats with the simple first-affordable-card policy; longest battle takes nine enemy turns and 42 commands. These outcome counts are test coverage, not balance or player-experience conclusions. Detailed report: tests/.e2e-out/encounter-motion-parity.json. This is a complete-encounter sweep, not a continuous nine-floor run, save/reload playthrough, actual renderer stress test or device performance certification. Those gates remain open; no deployment.

## Continuous seeded-run motion parity

Added a continuous run driver using generated maps and only legal onward connections, matching the map UI's initial floor-one selection rule. Runs use the unmodified starter character/deck and actual advanceFloor/playCard/endTurn/reward/rest/shop/mystery actions; no HP refills or combat-state shortcuts. Twenty seeds across three motion modes produce 60 run playthroughs with command-by-command equality of combat, map position, deck, gold/rewards, event state and RNG snapshots. Repeated reward claims are asserted to have no effect.

All comparisons pass. Ten of the twenty seeds reach a floor-nine boss victory in every mode; the rest terminate consistently in defeat. The deterministic bot prefers rest/events over combat and plays the first affordable card, so these results are correctness evidence, not a balance benchmark or usability test. Report: tests/.e2e-out/run-motion-parity.json. This closes the automated continuous-run timing-parity check; browser playthroughs, save/reload across transitions, animation quality and physical-device gates remain open. No deployment.

## Continuous-run save/reload verification and copy fix

Added storage-backed run continuity tests that re-import a fresh store module at pending combat rewards/open node events and after choices/transitions. Old-document timers are cancelled to model page reload. Ten seeded runs with 175 module reloads match uninterrupted command/state traces, including subsequent RNG, deck, gold, event choices and final outcomes. Valid saves are accepted without recovery notices; reward duplicate protection is exercised as in the route test.

The first test failed because new card instances retained template descriptions while restored cards regenerated descriptions from effects. Updated createCardInstance to use the same effect-description generator as loading and upgrades. This prevents card wording changing merely because the page reloaded. Effects, costs, identities and RNG use remain unchanged.

Save continuity, copy contracts (27 base and 50 archetype cards), 60 continuous motion-parity runs, command checkpoints, TypeScript, production build and whitespace checks pass. This uses actual persistence serialization/module initialization with in-memory localStorage, not a physical browser reload or storage-pressure test on a phone. Browser copy layout and device/release gates remain open. No deployment.

## First encounter guard and cast artwork

Generated Golem crossed-arm guard and Spider raised-front-leg cast key poses from their original idle references using built-in image generation. Archived PNG originals, exact prompts and lossless WebP runtime copies; 49 loose assets pass exact decoded RGBA packaging verification. Golem guard is outside its existing three-pose atlas and loads as the intentionally uncovered optional pose.

Registered both poses. Existing Block impact reactions select Golem guard. Added a presentation-only action subscription that selects a finite 220ms cast on the source of APPLY_STATUS; reduced motion/hidden documents omit it, defeat/celebration take precedence, and disposal removes subscription/state. Combat timing and rules are unchanged. The Spider's Burn action can now present distinct casting art rather than remaining idle.

Controlled renderer tests verify status actions animate their source, not recipient, and cast state is cleared on disposal. Asset manifests, 60 continuous-run motion-parity simulations, TypeScript, build and whitespace checks pass. Pose anatomy/scale/contact timing still require browser/art review; full authored animation baseline and release gates remain open. No deployment.

## Legal encounter mobile input and text review

Entered a legal floor-one Specter/Taxi Ghost encounter through the normal map at 390×844 (arena flag only, no review fixture). The existing local legacy run displayed its migration notice and was continued through the UI. Played Haymaker, Shiv Toss and Jab against Taxi using both scene targeting and the text target list. Observed 8 damage, Vulnerable-amplified 6 damage, then capped lethal 4 HP loss. End Turn let the surviving Specter deal 7 damage; next player turn restored 3 energy, drew five cards and moved focus to End Turn. Updated Haymaker's longer canonical text fits the visible mobile card.

A brief page-focus state during resolution initially looked like a focus-return defect; inspection confirmed the existing ready-phase focus effect restores focus once resolution completes. No speculative focus change made. Found and fixed a real accessible-label defect: dead enemies retained their obsolete attack intent in aria-label. They now announce defeated only; obsolete Block/status detail is hidden and live single-status text uses singular effect.

Browser confirmed Taxi Ghost, defeated in its disabled control after the fix. Console warnings/errors empty. Evidence tests/.e2e-out/legal-encounter-mobile.png. TypeScript/build/whitespace pass. The encounter remains active for later continuation; this is one actual combat turn, not a full browser run or physical-device test. No deployment.

## Legal mobile victory, reward reload and result accessibility

Completed the normal-map Specter/Taxi encounter through three player turns at 390×844. Exercised self Block/draw, all-enemy damage, enemy Block lasting into the player turn, target selection and lethal capped damage. Victory offered Panic/Surf/Ballad and 16 gold. Reload before claiming preserved the same reward choices; claiming Surf changed deck 12→13 and gold 99→115, and a second browser reload preserved both and returned to the legal map path. Evidence: tests/.e2e-out/legal-reward-reload-mobile.png. Console warnings/errors empty.

Found victory left focus on the page and exposed underlying combat controls in accessibility navigation. Converted the result backdrop to a native modal dialog with its heading label and initial heading focus, retaining the existing layout and bounded reveal timing. Escape cannot dismiss an unresolved reward/result. Nested native card/deck inspection remains supported. Local Rewards fixture verified only reward controls are exposed, initial Victory heading focus, and closing Jab inspection returns focus to the Jab reward. Evidence: tests/.e2e-out/victory-modal-mobile.png. TypeScript/build pass. Full keyboard loop/physical screen-reader validation and remaining art/performance/release gates remain open; no deployment.

## Attack art across all hero archetypes

Generated identity-preserving attack contact poses for Chrome, Volt, Concrete and Smoke from their existing idle references using built-in image generation. Chrome uses a short armored forearm strike, Volt an open-palm thrust, Concrete a boxer punch, and Smoke a low palm strike. Archived original transparent PNGs and exact prompts; lossless runtime packaging now verifies 53 loose assets. Registered each attack with a .98 foot anchor and the existing 80/160/80ms idle/contact/recovery key-pose timeline. This completes attack-key-pose availability for all five archetypes, not full animation approval.

Added hero selection to the developer composition/motion review so archetype comparisons no longer require changing code or generating a selfie. Expanded clip tests to all five heroes; contact timing, reduced-motion fallback, archetype appearance start/reload parity, unchanged RNG, renderer assets, TypeScript, build and whitespace checks pass. New poses require browser scale/foot/contact review; non-Neon reaction/guard/defeat/celebration coverage and full authored clips remain open. No deployment.

## Repeatable contact-frame review

Added a developer frame-time input and freeze toggle to the composition study. Optional presentation-only elapsed sampling lets the actual renderer hold a selected clip at a precise time without changing game state or normal gameplay clocks. Tests exercise the scene at 140ms contact and 320ms recovery, separately from transient impact/cast reactions.

Reviewed Chrome, Volt, Concrete and Smoke at 140ms in the 390×844 three-enemy composition. Each stays grounded, fits its space and leaves HUD/hand controls unobscured. Volt returns to idle at 320ms. Evidence: tests/.e2e-out/{chrome,volt,concrete,smoke}-contact-mobile.png. Console warnings/errors empty. These held-frame checks do not approve interpolated motion, all viewport sizes, new reaction poses or full roster animation. Renderer streaming/ownership tests, TypeScript, build and whitespace checks pass. No deployment.

## Build-time texture tiers reduce transfer

Moved loose-asset resolution limiting into the packaging step: power-of-two Lanczos derivatives capped at 768px for actors and 1536px for district plates, then lossless WebP encoding with exact derivative pixel verification. Original PNG artwork remains unchanged. Generated source-dimension metadata lets Pixi retain original logical frame/anchor coordinates without downloading or resizing the large source first. Dimension matching prevents stale metadata being applied to an unexpected asset. Atlas packaging remains separate and still uses runtime limiting.

The 53 loose runtime assets now total 21,852,648 bytes versus 63,488,704 previously (65.6% smaller). This is aggregate package size, not a measured cold encounter download; the 3.65MB Golem atlas is additional. The runtime no longer needs a full-size intermediate image for these packaged assets. Texture budget/source-metadata tests, renderer assets, lifecycle tests, TypeScript, build and whitespace checks pass.

Mobile 390×844 Concrete contact frame plus Rat/Golem/Spider remains aligned and readable; no console warnings/errors. Evidence tests/.e2e-out/packaged-tiers-mobile.png. Desktop high-DPR visual quality, full-roster image review, cold/warm network measurements and actual device memory/frame profiling remain open. No deployment.

### Four-pose Golem atlas packaging

Packed attack, hit, defeat and guard into a 2×2 source-space atlas, with two-pixel edge extrusion. Original PNG pixels are checked before derivative creation; the lossless WebP is checked against the downsampled derivative. Runtime dimensions are 1244×1273 at resolution 0.5, preserving 2488×2546 logical coordinates via generated metadata. Encoded size is 1,397,658 bytes versus 3,648,334 for the former three-pose atlas (61.7% smaller); successful atlas loading now also avoids the separate guard download. The decoded texture is 6,334,448 RGBA bytes, not a measured GPU allocation.

Validation: texture-budget, real-Pixi actor-atlas (all four production frames at half resolution), renderer-streaming, renderer-assets and clip-playback tests passed; TypeScript and production build passed. The first new atlas test incorrectly supplied physical dimensions as TextureSource logical dimensions; corrected the fixture to use a resource with physical dimensions, matching the runtime image-loading path. Browser visual review of the new packed guard frame remains pending. This does not satisfy animation approval, device performance or release gates. Personalized full-body selfie generation remains unimplemented; archetype bodies are still shared fallbacks.

### Packed Golem browser verification

Verified the actual local Pixi arena study after enabling its Pixi scene control (the study defaults to DOM silhouettes). Held Golem guard at 140 ms on 390×844, 320×568 and 844×390, with three enemies and the ten-card study hand. Also inspected the attack contact frame at 390×844. Both distinct atlas frames render at the intended size, with feet inside the actor area and no enemy HUD overlap or visible atlas-edge contamination. Browser warnings/errors were empty. Evidence: tests/.e2e-out/golem-packed-guard-mobile.png, golem-packed-guard-320.png and golem-packed-guard-landscape.png. Viewport override reset afterward.

This closes the previous atlas-specific browser check, not full animation approval or actual CombatView landscape hand verification. The study hero HP text has weak contrast over bright scenery; inspect the real combat HUD before deciding whether that is study-only. Production release and personalized selfie bodies remain open.

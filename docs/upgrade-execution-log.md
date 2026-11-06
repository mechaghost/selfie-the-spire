> November 5 update: user rejected server ONNX removal. Browser Canvas green-screen removal replaces that approach; native model deployment gates below are historical and superseded. See [current implementation and verification limits](browser-character-cutout.md).

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

### Cast-to-attack presentation correction

Reproduced a lingering source cast when DAMAGE_ENTITY begins within its 220 ms lifetime: the renderer-streaming regression failed before the fix. BattleScene now removes that source's cast on attack begin, before the attack anticipation/contact pose. Other actors' casts and completion notifications are unaffected; clearing also works while hidden or reduced-motion so a stale cast cannot reappear after a mode transition. This changes presentation only.

Validation: renderer-streaming passed with source-specific action-transition assertions and an atlas contact frame assertion (no manual cast-map clearing); actor-motion and combat-presentation passed, including normal/reduced/off outcome parity and impact-delta checks. TypeScript and diff checks passed. Continuous visual animation review remains open.

### Smoke Specter production-enemy attack art

Generated an identity-preserving full-body attack cutout from the existing Specter idle reference using built-in imagegen. Inspected the output: two clawed hands, matching torn teal/coral jacket and purple smoke body, distinct leftward claw extension, transparent background. Archived original PNG and packed a lossless 573×687 derivative (288,000 bytes); source-space dimensions remain 1145×1374 for both idle and attack. Registered the contact pose with .5/.99 anchor and the existing 80/160/80 ms attack timeline. This adds authored attack art to a production encounter enemy previously using idle art.

Validation: actual alpha channel range 0–255; source dimensions match idle; packaging verifies decoded derivative pixels; clip-playback (now including Specter), renderer-assets, texture-budget and TypeScript checks passed. In-arena mobile pose comparison and full motion approval remain pending. No deployment in this step.

### Personalized combat appearance transport

Added a version-2 CombatAppearance carrying a bounded embedded WebP idle cutout plus its fallback archetype ID. Version 1 registry appearances remain compatible. GeneratedCharacter may carry the appearance; reveal and startGeneratedRun use the same normalization, and loadRun preserves it. Personal visuals deliberately omit the shared archetype's attack/reaction atlas and key poses, so movement cannot replace a personalized person with a stock body. Existing procedural movement applies to the personal cutout. Reveal copy distinguishes personalized combat artwork from shared archetype bodies.

Transport accepts only base64 WebP with RIFF/WEBP header and at most 512,000 characters, rejects external URLs and SVG, and falls back to the archetype for invalid data. This is a transport sanity check, not full image decoding or alpha/likeness validation. The future server producer must validate dimensions, actual alpha, alignment and output size before returning this contract.

Validation: real WebP fixture survives preview/start/localStorage/reloaded-store identity; no shared key poses, no appearance-induced RNG change, invalid URLs/formats/oversized payloads fall back. Five existing archetype migration tests, save-and-generation, renderer-assets, TypeScript and production build passed. No provider generation has been added or claimed: the server currently returns only portrait/card artwork and therefore still produces shared battle bodies. Live provider generation, transparent cutout validation, failure/retry UX, mobile personal-character rendering, matching pose art and release remain open.

### Server combat-cutout validation and packaging

Provider finding: the existing server uses Gemini 3.1 Flash Image, whose official image-generation documentation explicitly says transparent background generation is unsupported (https://ai.google.dev/gemini-api/docs/generate-content/image-generation?hl=en, checked November 5, 2026). Do not enable a pretend transparent-output prompt on the existing route. A native-alpha provider or a separately verified matting stage is required before generation can supply the new personalized appearance contract.

Implemented prepareCombatCutout in server/src/services/combatCutout.ts. It decodes PNG/WebP with byte/pixel/dimension limits; rejects animation, missing or ineffective alpha, empty artwork and insufficient visible foreground; extracts the visible silhouette, fits it inside 480×736, centers it on a 512×768 transparent canvas, and places its bottom at y=760 for the .99 foot anchor. WebP output is capped at the client's 512,000-character save limit. This performs technical packaging, not background removal, likeness checking or proof of complete anatomy.

Validation: tests/combat-cutout.mjs passed real decoding of controlled and existing generated hero fixtures, exact normalized dimensions/base alignment, opaque/fully-transparent/JPEG/corrupt/oversize/tiny input rejection and bounded output. Server TypeScript passed. The processor is not yet wired to the generation route because the current provider cannot supply native alpha; no personal photo was submitted and no live generation success is claimed. Provider/matting integration and end-to-end selfie tests remain open.

### Gemini plus local background removal

User explicitly selected retaining Gemini and adding server-side background removal. Added pinned ONNX Runtime Node dependency and a CPU U²-Net segmentation adapter, checksum-verified model preparation script and upstream license/source notes. No additional image provider is used. The generation route now optionally generates a recognizable right-facing full-body studio actor, removes its background on-server, validates/normalizes the result and returns the version-2 saved appearance. Rollout flag ENABLE_PERSONALIZED_COMBAT remains unset by default. Preflight loads the model before Gemini calls; one extraction runs per process at a time; errors do not masquerade as successful personalized art.

Actual inference test flattened existing transparent hero artwork onto gray and compared the recovered mask against known alpha. Initial tests caught loss of the joined alpha and incorrect cover-resizing of the mask; both fixed. Final controlled mask IoU 0.98415, cold local extraction about 881 ms, normalized data URL 85,963 characters. Visual inspection still shows light edge fringe, so this is not production quality approval. Test artifact tests/.e2e-out/matted-hero.webp is existing-art extraction, not a generated selfie likeness. Live Gemini generation has not been exercised.

Validation: real combat-matting test, combat-cutout, combat-appearance, save-and-generation, mocked personalized-generation-route tests, server TypeScript and model checksum preparation passed. Route tests cover enabled version-2 assembly, disabled legacy response, preflight failure before provider calls, and extraction failure without silent stock-body substitution. Deployment native binaries/memory/concurrency, edge refinement, real self-photo consent/sample testing, generation latency, mobile visual verification and matching pose work remain open. No deployment or live flag change in this step.

### Conservative studio-matte edge refinement

Added border-connected uniform-studio-background fringe refinement after U²-Net segmentation. It activates only when corner colors agree, retains confident model foreground and does not globally key pale clothing colors. Pure tests cover connected fringe, pale confident clothing, dark fine details and bypass on nonuniform corners. Expanded actual inference regression from one to five hero fixtures with known original alpha.

Results: Street Runner IoU improved .98415 to .99101. Across five fixtures IoU .97992–.99284; foreground retention .99917–.99998; local cold inference/refinement 1,019 ms, warm 265–348 ms; normalized data URLs 83,663–99,803 characters. tests/.e2e-out/combat-matting-report.json and matted-{street-runner,chrome,volt,concrete,smoke}.webp record results. Actual visual inspection of Street Runner, Chrome and Volt shows preserved details and reduced fringe but still light edge contamination and enclosed background in Volt's arm/body gap. This is incremental improvement, not extraction-quality approval. The feature remains gated off. Server TypeScript, studio-matte and full five-fixture real-inference tests passed.

### Generation dependency scheduling

Checked local provider configuration without exposing credential contents: GEMINI_API_KEY is not configured in the local process/root/server dotenv inputs. No live generation or personal-photo upload was attempted. This leaves real-provider quality/latency verification open; it does not block other goal work.

Removed an unnecessary serial wait in generate-character: signature card art now depends only on its mechanics promise and can overlap portrait generation and combat cutout generation/extraction. Previously it started only after all three completed, increasing the critical path for the personalized flow. Request count and authoritative character/card assembly are unchanged.

Validation: a controlled route test holds portrait and cutout promises unresolved, observes signature art starting, verifies the route has not returned prematurely, then releases both and confirms all three artwork values in the response. Existing rollout/preflight/failure checks, save-and-generation and server TypeScript pass. This proves dependency ordering, not live timing or a reduction measured against the provider. Global generation deadlines/cancellation and real-provider latency remain review items.

### Shared generation deadline and cancellation

Added a 110-second server generation budget, below the client's existing 120-second wait. One abort signal now reaches moderation, analysis, mechanics, portrait, card art and combat art. Existing per-call limits remain; image calls now have 60-second limits. Retry backoff is abortable, late results are discarded, and terminal failure aborts sibling jobs. Request cancellation returns a cancellation response; whole-route expiry returns a clear 504 retry message. Explicit checkpoints prevent new dependent work after model readiness/moderation/analysis expires.

Validation: generation-budget tests cover deadline, sibling cancellation on failure, pre-cancelled no-work behavior, normal success, aborted retry and late result rejection. Hono route test cancels while combat art is pending and observes the same provider signal abort and no character result. Existing parallel dependency, rollout, model-preflight and failure tests, save-and-generation and server TypeScript passed. Inspected all SDK calls for signal propagation, including the combat image call. Native ONNX inference cannot be forcibly aborted by this mechanism: an already-started CPU pass may complete, after which its result is discarded and normalization is skipped. Live provider cancellation and hosting behavior still require integration verification; no provider credentials or production settings were changed.

### Personal appearance browser integration fixture

Added DEV-only Personal reveal/Personal combat review screens and a Personal cutout fixture option in the arena study. Fixture embeds the server-extracted Street Runner artwork in the version-2 format with a Chrome fallback ID, deliberately making an accidental shared-body substitution obvious. It is labeled a local art fixture with no photo; it is not evidence of real selfie generation or likeness.

Browser verification: at 390×844 opened Personal reveal, started its run through Begin your journey, selected an available floor-1 fight, and saw the same cutout in a legal two-Imp encounter. Reload preserved the character artwork, 80 HP, 13-card deck and encounter without a recovery notice. No browser errors/warnings. In the arena study held the personal actor's attack at 140 ms: it retains its own cutout and procedural movement rather than changing into Chrome attack art. At 320×568 the personal actor fits alongside three enemies and the ten-card hand. Forced DOM fallback also preserves the cutout.

Failure kept open: the fallback status/retry banner overlaps feet at 320×568; fallback layout is not passed. Study hero HUD contrast over bright scenery also remains an issue (actual combat HUD has its own dark background). Initial review storage from an older fixture had a recovery notice before selecting the new fixture; the newly created personal run reloaded successfully. Evidence: personal-reveal-mobile.png, personal-combat-mobile.png, personal-attack-320.png and personal-fallback-320.png under tests/.e2e-out. TypeScript and production build passed; output bundle remained unchanged, so these DEV fixtures are not part of the release bundle. No deployment.

### Fallback notice moved outside actor plane

BattleStage now portals its status/retry notice into a caller-owned footer instead of overlaying actors. BattleArena has a measured content plane plus an automatic-height footer; artwork, HUDs, target rectangles and drag projection all continue using the same resized content plane. The DEV study also receives a dedicated notice row. Added DEV-only `fallback=1` query support to exercise the actual combat component, rather than relying only on the study.

Actual combat browser verification with three enemies and ten cards: at 320×568, notice top y=250, actor bottoms <=242.18 and target bottoms y=242; at 844×390, notice top y=288, actor bottoms <=280.61 and targets y=280. Retry button remains 44px tall. Golem inspection opens from the relaid-out target and returns focus to it. Normal Pixi landscape has no empty footer and fills the restored space. Browser warning/error log empty. Evidence: fallback-footer-320.png, fallback-footer-landscape.png, normal-arena-after-footer.png under tests/.e2e-out. Full-hand DEV fixture again triggers save recovery on reload because its injected piles are not a legal saved run; recreated via review controls for the normal-renderer check. This is distinct from the successful personal legal-encounter reload tested earlier.

TypeScript, 168 pure layout cases, renderer-streaming and production build pass. Broader fallback/boss/district/browser matrix, study short-landscape footer sizing and recovery focus still need coverage. During Golem inspection, found irrelevant attack-preview caveat appended to its block/status-only intent; queued for text correction. No deployment.

### Intent description context correction

Moved the shared intent description into the pure intent-view module while retaining EntityPanel's public export for existing consumers. Damage-before-Block/status-change caveats now appear only for executable Damage effects; Golem's initial guard/status description is exactly “Current preview: Gains 10 Block. Gains 2 Spikes.” Healing wording distinguishes enemy self-healing from healing the player. No combat effects changed.

Validation: 78 roster intent descriptions checked for caveat relevance and undefined/NaN text; the real Golem definition is asserted directly. Modified-damage and healing-recipient examples pass. Existing 66 authoritative Block preview checks, copy contracts across 27 base/50 archetype cards, TypeScript and diff checks pass. The initial added example used the display name as a status ID; corrected it to use the real roster definition instead of an invented fixture. No deployment.

### Taxi Ghost attack art and pending Specter mobile check

Generated Taxi Ghost's leftward bite/lunge contact pose with built-in imagegen using its idle reference. Inspected four wheel-legs, checker stripe, rusted yellow body and toothed bumper; source canvas remains 1536×1024 with alpha. Archived original and generated a verified lossless 768×512 derivative (376,004 bytes), registered at .5/.99 and the existing finite 80/160/80 ms timeline.

Browser study at 390×844: held Taxi attack at 140 ms, then sampled 320 ms to confirm idle recovery; inspected the previously pending Specter attack at 140 ms. Both silhouettes remain distinct and grounded inside the scene without HUD overlap, and no rectangular background is visible. Browser warnings/errors empty. Evidence taxi-contact-mobile.png and specter-contact-mobile.png under tests/.e2e-out. These are contact/recovery samples, not full clip-motion approval or a complete device matrix.

Validation: clip-playback (including Taxi), renderer-assets, texture-budget, TypeScript and diff checks passed; 55 loose assets packaged with exact decoded derivative checks. Remaining enemy pose coverage, authored inbetweens, scene-wide motion review and release gates remain open. No deployment.

### Save-valid full-hand review fixture

The ten-card fixture now creates twelve owned deck instances, waits for initial combat draws to settle, then assigns ten to hand and two to the draw pile. It avoids changing a replacement review encounter if the user switches screens during initialization. Previously the fixture introduced cards outside the master deck and could race queued draws, making reload evidence unreliable.

Validation: a fresh bundled store reload accepts the actual review save without recovery and preserves all five card collections and RNG state; the production save key remains untouched. Client TypeScript and diff checks pass. Personalized generation route tests (mocked provider) and actual cutout validation/normalization tests also pass. User confirmed keeping Gemini with server background removal; that implementation remains gated pending real-provider selfie quality and hosting checks. No deployment or new browser verification in this pass.

### First independent location foreground

Generated and archived transparent Ocean Drive palm corners with the built-in image tool. Added an optional foreground plane above the actor world, independent texture streaming and bounded two-pixel foliage sway that becomes stationary under reduced motion/hidden state. Existing world child ordering and target geometry remain unchanged. Full prompt, paths, alpha checks and limitations are in ocean-drive-layer-art.md.

Verified the scene study at 390×844 and 844×390 with three enemies and ten cards; no actor occlusion, rectangular matte or browser warnings/errors. Captured ocean-layer-mobile.png and ocean-layer-landscape.png. The actual Full hand review fixture also reloaded in-browser with all ten cards and no recovery warning (the initial warning came from the old invalid stored fixture and disappeared after creating the repaired fixture).

Client TypeScript, renderer streaming/layer order/reduced motion/disposal, asset coverage/framing, texture budget and diff checks pass. Packaged 56 loose assets with exact decoded derivative equality. This adds one independent foreground, not full five-location ground/background separation or full parallax approval. No deployment.

### Ocean Drive independent background and ground

Generated separate scenery and wet-road layers from the original plate with built-in imagegen, preserving originals. Added shared aspect-preserving overscan/crop for layered scenery, bounded background drift and enforced stationary ground; reduced motion disables drift. Ocean Drive now has three independently streamed layers. Full prompts and source/runtime paths are in ocean-drive-separated-layers.md.

Verified browser study at 390×844 and 1280×800 with three enemies and ten cards: no visible curb gap, matte rectangle or actor displacement; logs empty. Tests cover 84 drift frames, viewport coverage, aspect ratio, fixed ground/reduced motion, and actual texture alpha overlap (minimum 98.04% coverage). TypeScript and renderer streaming/lifecycle checks pass. Packaged 58 assets. Four districts still need separation; broader art/performance/device/release gates remain open. No deployment.

### All five districts now have independent painted ground/scenery

Generated and integrated the remaining eight layer assets for Wynwood, Underpass, Backlot and Rooftop. Browser composites revealed pale ground-edge bands in Wynwood/Backlot; first corrections introduced unwanted dark alpha above the street and were rejected by image checks. Final v4 ground assets remove both defects. Rejected versions live outside runtime packaging. Exact generation/correction prompts are preserved in district-layer-*.json.

Reviewed all four districts at 390×844 and 1280×800 with three enemies/ten cards; accepted composites have no visible seams or matte rectangles, and browser logs are empty after cycling districts. Tests now consume the actual five-location manifest, require independent ordered layers, and check real alpha coverage plus motion framing. Final minimum combined alpha exceeds 97% everywhere and 99% through join rows. Detailed composition guides, texture cost and evidence scope: five-location-layer-review.md. Packaged 66 accepted loose assets. Full location/boss/device/performance gates remain open. No deployment.

### Sustained renderer benchmark and current motion inventory

Added a development-only performance screen with a visible ten-card hand, rotating heroes, three-enemy/boss scenes, timed poses and 20 district mounts/disposals. Cache diagnostics count pending loads and decoded source estimates without double-counting shared leases. Tests cover pending/shared/disposed diagnostics. A 60-second harness check proved cleanup; continuous RAF sampling was then extended across mounts before the ten-minute measurement.

The 600.331-second desktop-browser run at 390×844/DPR1 produced p95 17.5 ms, p99 18.1 ms and two intervals over 50 ms; all 20 disposals returned entries/references to zero. Peak decoded texture estimate 46.9 MiB. No hide/resize/failure events. Full JSON and limitations: arena-benchmark-results.md. This does not certify real phones, GPU execution time or cold-cache loading. Production build excludes the benchmark and passes TypeScript/resource checks.

Generated a current motion inventory from actor manifests and encounter pools, correcting the stale claim that no timelines exist: ten actors have attack timelines, while all 28 remain review status and portfolio animation coverage is unfinished. No deployment.

### Miami-inspired world street map

User redirected the world-map visual identity away from a Slay the Spire tower graph. Implemented original vector coastal cartography, city blocks/parks/buildings, named avenues, neighborhood signs, right-angle streets and labeled encounter pins. Reachable stops/streets are mint; current stop is amber. Kept seeded graph and encounter choices unchanged through a pure projection. Replaced obsolete map styling and corrected mobile header wrapping/current-stop scroll framing.

Verified 2,752 stops and 3,425 connections across 100 seeds/six widths. Browser checks at 320×568, 390×844, 844×390 and 1280×900; actual map → legal fight → victory/gold → map → reload retained route state and connected choices, without console warnings/errors. TypeScript, copy contracts and production build pass. Details/evidence: neo-miami-street-map.md. No deployment.

### Billboard defeat pose

Added a held collapse with buckled knees, lowered claws, and the coral sign face visible. The source is 1312 × 1199 with alpha ≥128 bounds (30,424)–(1257,1167), and the runtime anchor is [.5,.973]. The existing 280 ms defeat presentation uses the new frame. All 550 art budget combinations passed. The bounds audit found zero confirmed intersections across 876,888 samples. Texture, playback, and TypeScript checks passed. The Pixi boss study at 320 × 568 and 390 × 844 showed the collapse at 40 ms with both claws visible and the HUD and hand unobstructed. The target was disabled and labelled Defeated. Browser logs showed no warnings or errors. Local captures are `tests/.e2e-out/billboard-defeat-320.jpg` and `billboard-defeat-390.jpg`. Full-speed and physical-device review remain open.

Generation prompt: Create the final defeat pose of this exact Billboard boss as a transparent 2D game sprite. Preserve canvas size and proportions, rusted purple steel truss, two hooded lamps, teal sign with coral angular face, and two large claw arms. Its knees buckle inward under the heavy sign and the torso tilts down toward screen left, with both claws lowered alongside it. Feet and claws at original ground baseline. Compact low collapsed stance, about two thirds original height, occupying bottom of same canvas with clear empty alpha margins, no cut-off parts. Same painted inked lighting and 3/4 camera. Keep the unlit coral painted face readable, lamps off. No detached debris, sparks, floor, shadow, smoke, text or scenery. One recognizable defeated boss.

### Billboard hit reaction

Added an upright recoil with the near claw drawn across the sign. The 1312 × 1199 source has alpha ≥128 bounds (106,16)–(1282,1167) and uses the .973 foot anchor. The clip holds the recoil for 160 ms and returns to idle for 60 ms. All 550 art budget combinations passed. The bounds audit found zero confirmed intersections across 877,392 samples. Texture, playback, and TypeScript checks passed. At 320 × 568 and 390 × 844, the Pixi boss study showed the upright recoil at 80 ms with the HUD and hand clear. The 390 px sample at 220 ms returned to idle. Browser warnings and errors were empty. Captures are `tests/.e2e-out/billboard-hit-320.jpg`, `billboard-hit-390.jpg`, and `billboard-hit-recovery-390.jpg`. Full-speed and physical-device review remain open.

Generation prompt: HIT recoil frame of this exact Billboard boss for a 2D combat game. A short sharp jolt backward toward screen right: the teal sign torso tips back by about 12 degrees, the near claw lifts inward across its chest, far claw retracts, knees slightly flex but both feet remain firmly planted on their original ground baseline. It remains tall, distinctly upright and active. Preserve two lamp fixtures, coral angular face painted on teal, rusted purple steel lattice, original camera, rendering and scale. Same portrait canvas as reference with all appendages inside margins and real alpha transparency outside the outline. No sparks, effects, floor, shadow, backdrop or text.

### Billboard guard

Added a 160 ms brace and 60 ms idle recovery for Block. Both claws interlock across the sign while the coral eyes stay visible. The 1312 × 1199 source has alpha ≥128 bounds (32,16)–(1280,1183) with a .987 foot anchor. All 550 encounter budgets passed. The bounds audit found zero confirmed intersections across 877,896 samples. Texture, playback, and TypeScript checks passed. The Pixi boss study at 320 × 568 and 390 × 844 showed the brace at 80 ms with the coral eyes visible and the HUD and hand clear. Captures are `tests/.e2e-out/billboard-guard-320.jpg` and `billboard-guard-390.jpg`.

Generation prompt: The exact Billboard boss from the reference in a defensive BLOCK pose. Firmly planted in the same wide stance, lean the sign torso slightly forward, raise BOTH lattice forearms and interlock the claw pincers across the lower edge of the sign like a barricade. Keep coral eyes and most of teal face visible above the claws. Clearly deliberate frontal brace, no backward recoil. Same truss body, two lamp fixtures, rust patina, steel feet, three-quarter view and painted inked texture. Same canvas and overall scale, all parts inside canvas. Isolated alpha-transparent sprite only, no backdrop, shadow, sparks, shield prop, ground, debris or text.

### Billboard cast

Added a cast for the Billboard's opening Strength and subsequent status moves. It turns its lamps forward and raises one open claw for 160 ms, then returns to idle for 60 ms. The 1312 × 1199 source has alpha ≥128 bounds (31,10)–(1301,1170) and uses a .976 foot anchor. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 878,400 samples. Texture, playback, and TypeScript checks passed. The Pixi boss study at 320 × 568 and 390 × 844 showed the cast at 80 ms. Both lamps and the raised claw stayed inside the arena and the HUD and hand were clear. Browser logs for guard and cast showed no warnings or errors. Captures are `tests/.e2e-out/billboard-cast-320.jpg` and `billboard-cast-390.jpg`. Full-speed and physical-device checks remain open.

Generation prompt: One status CAST pose of the exact Billboard boss from the reference for Neo Miami 2D combat. Both feet planted exactly on the same baseline, raise the sign a little and turn its two lamp housings forward like stage spotlights. Open one claw, palm upward beside the sign, keep the other arm low. Elbows inside the idle silhouette. Coral eyes and jagged painted mouth fully visible. Preserve teal rusted sign, purple steel lattice, three-quarter perspective, canvas size, scale and inked rendering. No cast beams or glow outside the lamps, no particles, no ground, no backdrop, no shadow or text. Fully transparent margins and gaps between limbs. One complete sprite.

### Billboard idle shutters

The two lamp shutters close for 120 ms after 5,800 ms of idle. Both frames use the .99 foot anchor, and reduced motion holds the base idle. All 550 encounter art budgets passed. The transformed-alpha audit found zero confirmed intersections across 953,496 samples. Texture, playback, and TypeScript checks passed. At 320 × 568 the Pixi boss study showed closed shutters at 5,919 ms and open lamps at 5,920 ms. The body and foot baseline stayed visually stable, the hand and HUD remained clear, and browser logs showed no warnings or errors. Captures are `tests/.e2e-out/billboard-shutters-closed-320.jpg` and `billboard-shutters-open-320.jpg`.

Generation prompt: A precise idle alternate frame for the exact Billboard boss in the reference. Change only the face of the two little lamp fixtures on the top edge: close a narrow dark steel shutter across each pale glass opening. Keep both lamp housings and cables in the exact same position. Everything else including painted coral sign face, rust texture, claw positions, feet, proportions, baseline, canvas size, lighting and silhouette must remain fixed. No additional effects. Isolated sprite with transparent margins and gaps. The two tiny shutters are the only movement in a short mechanical blink.

### Subway Wyrm bite

Added a compact bite contact with a lowered train cab, closed fangs and tightly coiled tail. The 1536 × 1024 source has alpha ≥128 bounds (145,99)–(1361,1012), with a .988 foot anchor. The existing 80/160/80 ms attack structure holds the new pose at the contact beat. All 550 art budgets passed. Bounds audit found zero confirmed intersections across 954,252 samples. Texture, playback and TypeScript checks passed. Mobile visual review is pending.

Generation prompt: One compact bite CONTACT pose of the exact Subway Wyrm boss for Neo Miami combat. Same full-body 1536x1024 canvas, scale, planted feet, and three-quarter view facing left. Lower the train-cab head toward screen left, snap its upper and lower metal fangs nearly closed, bend its segmented neck inward behind its head. Keep rear cars and hooked tail tightly coiled, feet planted on original baseline. Preserve cream worn rail cars, turquoise stripes, coral doors, amber headlamps and purple bellows. Strong low bite within the original width, no long protruding neck, no detached or extra parts. Hand-painted inked style. Only the monster on true transparent alpha, including between coils, and clear margins. No glow halo, floor, shadow, text or debris.

### Subway Wyrm hit reaction

Added a compact head recoil with clenched fangs and the original left-facing orientation. The first candidate turned the head away from the opponent and was discarded. The 1536 × 1024 replacement has alpha ≥128 bounds (161,26)–(1360,1015), with a .99 foot anchor. Playback uses 160 ms recoil and 60 ms idle. All 550 encounter art budgets passed, and 954,756 sampled bounds produced zero confirmed intersections. Texture, playback, and TypeScript checks passed. Mobile visual review of bite and recoil remains open.

Generation prompt: Minimal pose edit of the exact Subway Wyrm. Its cab head remains at upper LEFT and the jaws point LEFT toward its opponent, same three-quarter camera. For a brief hit reaction, pull the cab a small distance inward toward its own neck while keeping it left of center and facing left, angle snout slightly up, clench fangs. Keep entire rear half, claw feet, tail, scale and framing fixed. No turning or mirroring. 1536x1024 with genuinely transparent exterior and between coils. Preserve cream and teal train cars, coral doors, purple bellows, amber lights and painterly linework. No glow, backdrop, debris, ground or other elements.

### Subway Wyrm defeat

Added a held collapse with folded legs, slack jaws and dim headlamps. The 1536 × 1024 source has alpha ≥128 bounds (48,515)–(1471,967), with a .944 foot anchor and a 280 ms defeat clip. All 550 art budgets passed. The bounds audit found zero confirmed intersections across 955,008 samples. Texture, playback, and TypeScript checks passed. Mobile visual review of the Wyrm's bite, recoil and defeat remains open.

Generation prompt: Final DEFEAT pose of the exact Subway Wyrm reference sprite. Collapsed train serpent, head resting low on pavement baseline facing screen LEFT, jaws slack and slightly open, amber lamps dark glass. Coiled connected cars settle down to half height, legs folded, tail relaxed and low. Keep its cream worn cars, teal stripes, coral doors, purple bellows and metal claws. Same 1536x1024 canvas and overall width, entire sprite fits within margins, low cluster occupying lower half. Transparent exterior and gaps, no visible pavement, no shadow, glow, scenery, smoke, sparks, text, broken-off pieces or gore. Same inked painterly style and camera.

### Subway Wyrm compact pose review

At 320 × 568 in the Pixi boss study, the 140 ms bite, 80 ms hit and 40 ms defeat frames all fit between the HUD and hand. The low cab bite, raised recoil and flattened defeat were visually distinct. The defeated target was disabled and labeled Defeated. Browser logs showed no warnings or errors. Local captures are `tests/.e2e-out/wyrm-bite-320.jpg`, `wyrm-recoil-320.jpg`, and `wyrm-defeat-320.jpg`. Full-speed combat and physical-device checks remain open.

### Subway Wyrm guard

Added a 160 ms brace and 60 ms idle recovery for Block. The Wyrm tucks its cab behind one raised foreclaw and coils its cars into a defensive wall. The 1536 × 1024 source has alpha ≥128 bounds (114,15)–(1379,1006) and uses a .982 foot anchor. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 955,512 samples. Texture, playback and TypeScript checks passed. Mobile visual review of the guard remains open.

Generation prompt: Defensive BLOCK pose for the exact Subway Wyrm train serpent in the reference, still facing screen left. Tuck the cab behind its raised near foreclaw, eyes visible and jaws shut, while the lower rail cars and tail curl together like a protective wall. A firm planted brace with a distinctive claw held up protecting the face. Keep the original cream and teal rail cars, coral doors, purple bellows, amber lamps, exact scale and 1536x1024 frame. All body parts within the original silhouette width. Transparent cutout, including gaps between cars and empty margins, no floor, shadow, props, detached parts, aura, glow or text. Match the inked painted style.

### Subway Wyrm cast

Added an upward roar for the Vulnerable status action. The 1536 × 1024 source has alpha ≥128 bounds (160,7)–(1345,1017) and uses a .993 foot anchor. The cast holds for 160 ms, then returns to idle for 60 ms. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 956,016 samples. Texture, playback and TypeScript checks passed. Mobile visual review of the guard and cast remains open.

Generation prompt: One CAST frame for this exact Subway Wyrm game sprite, announcing its Vulnerable move with a warning horn roar. Head remains on screen left facing the player, cab nose tilted diagonally up LEFT and mouth open in an unmistakable upward roar. Keep head within original top margin by compressing middle bellows and keeping rear cars, claw feet and tail planted in the exact original positions. Same cream teal cars, coral doors, amber headlamps, purple bellows, painterly inked lighting, 1536x1024 composition and scale. True alpha transparency outside body and in gaps. No sound lines, beams, smoke, debris, floor, external glow, shadow, text or props. One full creature.

### Subway Wyrm idle lamps

The cab lamps dim for 120 ms after 6,100 ms of base idle. Both frames use the .99 foot anchor, and reduced motion holds the base frame. All 550 art budgets passed. The bounds audit found zero confirmed intersections across 1,034,892 samples. Texture, playback and TypeScript checks passed. The idle transition, guard and cast still need mobile visual review.

Generation prompt: Precise edit of this exact Subway Wyrm to create a mechanical idle blink. Only dim the three glowing amber lamps on the cab to dark amber glass inside their original housings. Do not change the head shape, mouth, fangs, colors elsewhere, cars, tail, limbs, body silhouette, camera, texture, framing, canvas size or foot position. Same 1536x1024 frame. Transparent exterior and gaps between coils. The three small lamp lenses are the only change. No new parts, haze, shadow, floor or scenery.

### Subway Wyrm compact guard, cast and idle review

At 320 × 568 in the Pixi boss study, the 80 ms guard and cast cleared the HUD and hand. The raised claw and upward roar read as separate gestures. The lamps were dim at 6,219 ms and bright at 6,220 ms without visible displacement at the baseline. Browser logs showed no warnings or errors. Captures are `tests/.e2e-out/wyrm-guard-320.jpg`, `wyrm-cast-320.jpg`, `wyrm-lamps-dim-320.jpg`, and `wyrm-lamps-open-320.jpg`. Full-speed and physical-device review remain open.

### DJ Phantom scratch strike

Added a turntable scratch at the attack contact beat. The Phantom leans into the left record while its other claw works the crossfader. The 1210 × 1300 source has alpha ≥128 bounds (8,112)–(1208,1298) with a .998 foot anchor. The clip uses 80 ms idle, 160 ms contact and 80 ms idle recovery. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 1,035,648 samples. Texture, playback and TypeScript checks passed. Mobile visual review and full-speed four-hit combat review remain open.

Generation prompt: Attack contact frame for this exact DJ Phantom game boss. A rhythmic turntable scratch strike: lean sharply toward screen LEFT, press and drag the near claw diagonally across the left record, and plant the other claw on the central crossfader. Face the opponent left, head angled down into the scratch. Same purple angular mask, coral headphones, teal and coral long coat, two turntables with red record labels, and two trailing purple spectral tails with no legs. Preserve canvas dimensions, full size, baseline, painterly inked art. Keep both coat hems inside original silhouette width, elbows close, no stretching across screen. No sound waves, motion lines, sparks, external glow, extra equipment, backdrop, floor, shadow or text. Truly transparent exterior and gaps. One sprite.

### DJ Phantom hit recoil

The mask tips back and both claws lift off the decks. The 1113 × 1413 source has alpha ≥128 bounds (8,6)–(1105,1407). The .996 foot anchor and 1290/1401 scale align its tail baseline and visible height with idle. Playback holds the recoil for 160 ms and returns to idle for 60 ms. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 1,036,152 samples. Texture, playback and TypeScript checks passed. Mobile visual review of the scratch and recoil remains open.

Generation prompt: HIT recoil sprite of this exact DJ Phantom. Impact from left: still facing screen left, tip the mask up and back, pull both hands abruptly off the records and inward toward its collar. One claw near cheek, one near chest. Keep turntables level at original waist height with two records, same coral headphones, purple angular mask, teal coral long coat and two wispy purple tails, no legs. Preserve same 1210x1300 canvas, scale and lowest tail baseline; tighten elbows and coat hems so it is no wider than original. Painterly inked original style. Real transparent exterior and empty margins, no glow, sparks, shadow, scenery, text or extra equipment.

### DJ Phantom defeat

Added a bowed mask and sagging decks above a compact coil of spectral tails. The 1113 × 1413 source has alpha ≥128 bounds (8,658)–(1100,1404), with a .994 foot anchor and a held 280 ms defeat clip. All 550 encounter art budgets passed. The bounds audit found zero confirmed intersections across 1,036,404 samples. Texture, playback and TypeScript checks passed. Mobile visual review of the scratch, recoil and defeat remains open.

Generation prompt: Final defeat pose of exact DJ Phantom sprite. Bow the purple mask deeply down-left with eye extinguished, shoulders and empty claw hands droop over the two turntables, decks tilt down and sink with the torso, teal coral coat folds inward and spectral purple tails coil below. No legs. Entire character collapses to about 60 percent of original visible height at bottom of same 1210x1300 canvas, with both tail tips resting at original lowest baseline. Preserve same scale and gear, coral headphones, two records, palette and inked painterly texture. Keep whole silhouette inside canvas, no separate parts. Pure transparent background and clear gaps, no shadows, glow, floor, smoke, extra effects, scenery or text.

# Selfie the Spire experience improvement plan

Improve the path from first visit to first battle, make cards and decisions readable on phones, and carry the illustrated neon city into gameplay. Preserve the existing combat rules, archetypes, and universal Effect pipeline. Deliver the work in small, independently verifiable changes.

Status: reviewed implementation plan, November 4, 2026. Product changes have not been implemented. The baseline review inspected the local landing page at 390 × 844 and 1440 × 900, repository gameplay screenshots, and source code; it did not complete a live run. Three parallel reviewers checked experience, architecture, and verification; their dispositions appear below.

## Outcomes and boundaries

- A first-time visitor can enter a starter battle without a photo, camera permission, or generation service.
- Players can read every card and understand unavailable actions, then play through touch, mouse, or keyboard.
- Inspection never spends energy, claims a reward, buys, removes, or upgrades a card.
- Photo creation has a deliberate preview and submission step, understandable waiting and recovery, and cancellation that cannot be undone by a late response.
- Combat, map, rewards, shop, and rest share readable controls and consistent artwork treatment.
- Existing combat outcomes remain intact; UI and decorative randomness must not consume gameplay RNG.

The first release covers phases 0–3 below. Phase 4 is a separate art pass after those interactions work. New mechanics, archetypes, monetization, full audio production, and a larger procedural map are outside this work. Avoid promises about faster completion or improved conversion until measured.

## Verified baseline and risks

| Finding | Evidence | Consequence |
| --- | --- | --- |
| The README pointed to an obsolete Railway URL that returned 404. The owner confirmed https://selfiethespire.com/ as the live URL. | Owner clarification on November 4 | Update obsolete links and verify the custom domain; the earlier 404 did not establish a production outage. |
| Initial entry only exposes selfie creation. | src/App.tsx | Starter play needs an entry point; the existing initializeRun action already provides a starter character. |
| The hero overlay animates its entire opacity between 0.04 and 0.08. | src/App.css, ambientWash and landing-hero::before | Separate persistent contrast protection from decorative animation. |
| Mobile card descriptions use 0.5rem; unaffordable cards disable pointer events. | src/components/ui/CardItem.css | Readability and inspection must be separated from playability. |
| Camera starts on capture-screen mount; capture and file selection immediately submit. | src/components/ugc/SelfieCaptureScreen.tsx | Add deliberate camera activation and photo preview before sending. |
| Generation has rotating timed messages, no client fetch timeout, and no cancellation guard for late results. | SelfieCaptureScreen.tsx; src/store/gameStore.ts, submitSelfie/cancelUgc | Use honest indeterminate status, bounded waiting, and request identity checks. |
| Reveal hides the start action until 6.5 seconds. | src/components/ugc/CharacterRevealScreen.tsx | Make entry available immediately and provide Skip reveal. |
| Rewards claim on tap; deck count is informational only. | CombatResultOverlay.tsx; TopBar.tsx | Build a deck browser and explicit reward confirmation. |
| Core card and map interactions lack keyboard equivalents; zoom is disabled. | CardItem.tsx; MapView.tsx; index.html | Build semantic controls, focus management, and readable zoom behavior. |
| Reduced-motion support currently suppresses combat shake only. | src/components/combat/CombatView.css | Audit card, map, landing, reveal, and effect animations together. |
| Saves recreate RNG from its seed without restoring its position. | src/store/gameStore.ts, loadRun | Do not claim exact continuation after reload until RNG state is saved and tested. |
| Saves include the mystery-screen flag but omit its current event and outcome. | src/store/gameStore.ts, PERSISTED_KEYS | Reproduce reload before and after a choice; preserve event identity and avoid replaying effects. |
| Existing automated full runs primarily call store actions. | tests/e2e.cjs | They test mechanics, not the real player interaction path. |

Project skills are design constraints, but some describe older implementations. Reconcile them against current source before editing, particularly the card interaction model and combat layout. Keep the mobile portrait battlefield and bottom interaction zone as design intent; test actual current desktop and mobile layouts rather than imposing an obsolete structure.

## Phase 0 Establish a trustworthy baseline

**Work**

1. Identify the intended Railway service, deployed revision, domain, static asset root, and health route using read-only inspection. Prepare a concrete deployment/domain correction if needed. Update README and social metadata only to the verified URL. The production server already rewrites metadata origins from request headers; inspect the served HTML rather than assuming source fallback URLs cause the failure. Deployment is a later execution step, not part of writing this plan.
2. Record screenshots and console/network results for the existing landing, capture, reveal, map, one- and three-enemy battles, rewards, shop, rest, mystery, defeat, and victory states. Use controlled fixtures for states unavailable through normal navigation.
3. Add a deterministic local mock mode and synthetic photo fixture. It must be explicitly enabled, use fixed IDs, time, hero stats, gold, response and seed, avoid real generation credentials, and be unavailable in production. Include a portrait and signature hero card; the existing randomized fallback does not cover that contract. Do not send the existing photo fixture to a third party during routine tests.
4. Separate frontend build checks from server dependency installation. Document that npm run dev currently starts Vite only; the API starts separately. Add isolated test ports, readiness checks, and cleanup so tests cannot attach to an unrelated existing API.
5. Capture existing failures before changing behavior; distinguish pre-existing failures from regressions. Establish old-save fixtures before modifying persistence.

**Acceptance and verification**

- Frontend typecheck and production build pass; server dependency install/typecheck and production start are checked separately.
- Public URL, health endpoint, representative assets, and social image return the expected content, not merely HTTP 200 with a fallback HTML page.
- Tests fail fast if a real generation service is selected in the mock suite. Record mock/real mode in reports without printing credentials or photo data.
- Preserve baseline screenshots, test output, browser versions, viewport, seed, and commit ID under a gitignored evidence directory.

## Phase 1 Make entry and the first battle usable

**Work**

- Add Create my hero and Try a starter hero actions on the landing page. Keep the selfie identity prominent; the starter route must make its predefined hero clear.
- Use the existing starter deck and run initializer. Add a visible return-to-home/pause path and a way to resume a saved run; replacing an active run requires an explicit in-product choice. Home is a presentation state over the preserved run, not abandonRun or seed clearing. Pending combat resolves to a safe checkpoint before hiding gameplay; Resume returns to that checkpoint. Starting a starter run invalidates pending creation requests and clears stale creation fields.
- Fix the hero contrast layer, simplify headline color motion, raise body-copy readability, and show an actual gameplay preview plus a sample portrait/signature card. Keep any example labeled as an example.
- Add a brief, skippable first-battle guide for energy, enemy intent, attack, block, and End Turn. Tutorial dismissal and progress must survive refresh without modifying game outcomes.
- Add store-level validation for card play and End Turn before exposing more input methods: reject invalid phases, resolution in progress, pending actions, missing/dead targets, missing cards, and insufficient energy. Preserve valid existing effect behavior.
- Remove the viewport zoom lock and implement app-wide reduced-motion preferences in phases 1–2, including existing landing, reveal, map, hand, and combat effects. Static text and highlights must retain essential feedback, and game logic must complete without animation events. Phase 4 extends this baseline to new artwork effects.

**Acceptance and verification**

- From a clean session, starter battle is reachable within three deliberate actions, with zero camera requests and zero generation requests.
- Returning players can resume without accidentally replacing their saved run. Starter/new-photo choices clearly explain replacement when a save exists.
- Landing text stays readable throughout its animation; use a 4.5:1 normal-text and 3:1 large-text contrast target measured against the rendered background.
- Skipping or completing the guide leaves identical game state for the same subsequent actions.
- Rapid double activation, input during enemy turn, and input while effects resolve cannot spend energy twice, enqueue two turns, or damage an invalid target.

**Primary files:** src/App.tsx, src/App.css, src/index.css, src/store/gameStore.ts, src/components/combat/CombatView.tsx, src/components/ui/TopBar.tsx.

## Phase 2 Build readable cards and dependable decisions

**Work**

1. Create a shared card inspector used by combat, deck browsing, reveal, rewards, shop, and rest. Keep presentation reusable; the calling screen owns its explicit Play, Add, Buy, Remove, or Upgrade action. Do not couple inspection to mutation.
2. Make the deck count an accessible button that opens the actual current deck. For combat, expose draw/discard/exhaust information without leaking hidden draw order. Provide card counts and effect definitions.
3. Define one interaction model: tap/click or keyboard activates inspection; an explicit Play action on an Enemy card enters target selection, with a clear cancel action; Self/AllEnemies/None cards commit through their explicit Play action. Drag remains supported. Suppress the click following a drag so a single gesture cannot commit twice. Selecting a target takes priority over enemy inspection while targeting is active.
4. Keep unavailable cards inspectable, readable, and labeled with the reason. Use 16px body text in the enlarged inspector; compact hand cards may abbreviate but must always expose full text on demand.
5. Reward tap selects and previews, Add to deck commits once, and Skip retains the existing reward/gold rules. Show current deck during comparison. In rest, preview exact upgrade changes before confirming; preserve existing shop purchase confirmation.
6. Clear transient selection on turn change, target death, card removal, combat end, screen change, and reload. Select by instanceId so duplicate card templates remain distinct, and revalidate at commitment. Use semantic controls, dialog naming, visible focus, focus containment, Escape/back close, and focus restoration to a valid control. Make player statuses and enemy intents explainable by tap and keyboard, not title attributes alone.

**Acceptance and verification**

- Attack, Skill, Power, zero-cost, unaffordable, hero, upgraded, exhausted, and long-text cards all render and inspect without clipping.
- Opening/closing any inspector changes no HP, energy, gold, deck, rewards, or RNG state.
- Mouse, real touch, and keyboard each complete an attack, self action, and all-enemy action; invalid targets and cancellation consume nothing.
- Repeated confirmation adds/purchases/upgrades only once. Selecting a reward or closing its preview commits nothing. Skip banks exactly the existing expected gold.
- Deck browser shows the actual deck and does not reveal shuffled draw order. Keyboard users can reach and activate map choices and return from every modal.
- Test one and three enemies, hands of 0/1/5/10 cards, lengthy generated text, and narrow/short screens. Define an overflow strategy instead of shrinking all text or clipping controls.

**Primary files:** CardItem.tsx/.css, HandHUD.tsx, CombatView.tsx, EntityPanel.tsx, CombatResultOverlay.tsx, TopBar.tsx, ShopView.tsx, RestSiteView.tsx, CharacterRevealScreen.tsx, MapView.tsx, gameStore.ts.

## Phase 3 Make photo creation and continuation reliable

**Work**

- Offer explicit Use camera and Upload photo controls before requesting camera permission. Add a crop/preview step, Retake/Replace, and Use this photo to submit. Explain where the photo is sent in plain language, using verified handling facts; do not promise deletion or local-only handling without evidence.
- Validate file type/decode/size and provide recoverable failures. Stop camera tracks on exit, submission, cancellation, and late permission resolution after leaving the screen.
- Validate successful generation responses at runtime before committing state: required character/deck fields, finite bounded stats/costs, supported targets and Effect shapes, text limits, and usable image references with fallbacks. Treat malformed success as a recoverable error and retain the retry preview; a TypeScript cast is not validation.
- Use honest indeterminate waiting while the server exposes only one final response. Flavor messages must not imply completed backend stages. Do not add a fake percentage or unsupported time estimate.
- Add a client timeout, abort controller, and request identifier. Cancel/replace/retry invalidates previous responses; old success or error responses cannot overwrite current UI. Client cancellation does not imply provider work or cost has stopped.
- Provide retry using the retained preview and a starter-play exit for timeout, offline, server failure, rate limit, and daily cap. Avoid automatic repeated paid requests.
- Make the reveal skippable and entry immediately available. Keep the custom hero and signature move prominent.
- Commit to explicit restart semantics for this release: Play again reuses the same starting hero/deck with a new route; Retry seed reuses that hero/deck and original seed; starter entry explicitly selects the starter hero. Preserve an immutable run-origin snapshot, separate from the upgraded current deck; existing generic initializeRun(seed) cannot fulfill same-hero replay.
- Version saves and implement stable checkpoint restoration, including RNG state and event/reward identity where required. Preserve old-save compatibility or provide an explicit recovery choice. Keep photo previews, transient inspection state, and in-flight requests out of saved runs.

**Acceptance and verification**

- No upload occurs before Use this photo. Camera denial still leaves upload and starter play usable.
- Cancel request A, start B, then complete A after B: only B can change the screen. Cover late errors as well as late successes. Repeated submit creates one request.
- Permission resolving after navigation leaves no live camera tracks. Invalid and corrupt files leave a recoverable preview state.
- Every error path offers a usable next action and preserves a retryable preview when appropriate. Reload during creation returns safely without silently resubmitting.
- Reload at stable map, combat, reward, shop, rest, mystery, victory, and defeat checkpoints restores a usable consistent state. Reload while actions resolve returns to a documented safe checkpoint without duplicate rewards or a stuck turn.
- Exact continuation for new-format saves is a phase 3 release requirement: compare the next draws, intents, and rewards with an uninterrupted run using the same actions. Same-hero replay preserves original hero/deck; same-seed replay starts from original RNG state. Legacy saves cannot recover RNG position or original generated decks that were never stored: preserve their available state, clearly label limited retry/recovery options, and never claim exact replay for those saves.

**Primary files:** SelfieCaptureScreen.tsx/.css, CharacterRevealScreen.tsx/.css, gameStore.ts, core/rng.ts, core/models.ts, GameOverView.tsx, RunVictoryView.tsx; server routes/services only where necessary for validated response handling.

## Phase 4 Strengthen the illustrated world

**Work**

- Start with one combat environment and one map treatment before producing a full set. Use existing art wherever practical.
- Follow the project's flat-color risograph direction: sharp geometric forms, two or three ink layers, restrained neon, no grain/noise/halftone overlays. Remove the conflicting global grain treatment as part of the style pass.
- Introduce larger hero/enemy artwork and quiet illustrated scenery that preserves intent, health, status, targeting, and hand readability. Retain mobile portrait interaction geometry.
- Give the map subtle tower landmarks, a clear current position and boss destination, readable future routes, larger interaction areas, and a node preview describing the choice before entry. Decorative landmarks must not imply encounter information the game does not know.
- Use a consistent UI palette while preserving archetype palettes and semantic damage/block/healing colors. Pair color with labels or shapes. Keep display type for titles; compare a readable body font against the existing monospace before choosing.
- Reserve strong motion for actionable feedback. Extend reduced-motion handling across the entire app while preserving essential turn/target/result information. Ensure reduced motion cannot stall logic waiting for animation events.

**Acceptance and verification**

- Approve before/after captures with identical seed, hero, enemy count, cards, viewport, and state; do not compare unrelated attractive scenes.
- Environment art never obscures a target, health bar, intent, status, card, or action, intercepts input, or changes target hitboxes. Missing portrait/card/environment art has a readable fallback.
- Available routes remain distinct without relying solely on color, and future routes remain legible for planning.
- Every changed animation has a reduced-motion behavior. Disabling animation produces identical mechanical outcomes.
- Record transferred asset bytes and loading/interaction measurements before and after on the same device/profile. Provisional budget: no more than 250 KB extra compressed art fetched before starter play; target no more than 10% regression in median first-action readiness or interaction latency over five comparable runs. Investigate variance before accepting or rejecting a result.

## Verification matrix

| Layer | Required coverage | Evidence and pass condition |
| --- | --- | --- |
| Type/build | Frontend and server independently; production bundle | Successful commands and exit codes; production pages and assets render without unexpected errors. |
| Engine regression | Existing mechanics, victory, defeat suites; new phase guards and duplicate-action cases | Exact HP/block/status/energy/reward assertions pass with deterministic setup. |
| Real UI journey | Landing → starter → map → battle → reward; photo preview → mocked creation → reveal → battle | Use actual visible controls and gestures. Store mutations may arrange fixtures, never stand in for the actions being verified. |
| Failure recovery | Permission denied, corrupt image, offline, timeout, 422/429/500/503, malformed success, cancel races, missing image | Use controlled local responses and timing, not real quota or rate-limit clocks. Require actionable recovery, no silent resubmission, no stale overwrite, no unexpected requests. |
| Persistence | Legacy saves, stable checkpoints, pending actions, corrupted/unavailable storage, generated hero retry | No soft lock, duplicate reward, silent save destruction, or unsupported determinism claim. |
| Visual/responsive | 320 × 568, 360 × 640, 390 × 844, 768 × 1024, 1440 × 900, 844 × 390 | All required controls reachable; no obscured text/targets; documented scroll/overflow behavior and safe-area handling. |
| Input/accessibility | Keyboard-only; mouse; real iOS Safari and Android Chrome touch; 200% zoom; screen-reader spot check | Dialog focus correct, controls named, game path operable, no forced zoom lock, readable alternatives to color/motion. |
| Motion/performance | Normal and reduced motion; actual representative phone; repeatable network/device profile | Same outcomes, recorded metrics, art budget met; viewport emulation alone is not mobile validation. |
| Deployed smoke | Actual production build, verified domain/health/assets/social image, starter flow | Test production without the dev-only store hook. Real generation is a separate controlled smoke test using an explicitly authorized provider-compatible photo and known request limit. Current moderation requires a real photograph; synthetic inputs provide rejection coverage, not a successful-generation gate. |

## Commands and test infrastructure

Existing commands, run from the repository root after installing dependencies:

```sh
npm ci
npm --prefix server ci
npx tsc --noEmit
npx vite build
npx tsc --noEmit -p server/tsconfig.json
npm run test:e2e -- mechanics
npm run test:e2e -- victory
npm run test:e2e -- defeat
```

The server typecheck command needs its dependencies installed first. The browser harness needs a supported Chromium binary or PW_CHROMIUM. Frontend development and API startup are separate commands: npm run dev and npm --prefix server run dev. The existing npm run build also runs npm install inside server; avoid conflating that side effect with frontend compilation evidence.

Before running full-run suites, establish the isolated mock environment in phase 0: the current harness can reuse an already-running API, and server/.env can enable real generation. Existing full-run victory/defeat checks are not deterministic UI coverage and may need controlled seeds/encounters to avoid strategy-dependent results. Preserve a separate realistic seeded traversal test after adding precise outcome fixtures.

Add a separate interaction suite and visual capture workflow; these scripts do not exist yet. For agent-driven interactive checks in this workspace, use CUA and visible controls. Conventional browser tests may run in the project's normal developer/CI environment. Freeze fixture data and decorative motion for screenshot comparisons, wait for fonts and images, and capture reduced-motion variants. Compare within the same browser version, OS, fonts, and device scale. Record normal-motion interactions separately so stabilized captures cannot conceal broken feedback or timing. Do not approve visual baselines automatically.

Each implementation change should attach: revision, test mode, fixture/seed, browser/device/viewport, commands and exit codes, before/after captures, unexpected console/network errors, and any outstanding failures. Keep photo bytes and credentials out of logs and artifacts.

## Delivery order and release gates

1. Baseline, isolated fixtures, and deployment diagnosis.
2. Store action guards, then starter entry, landing readability, and first-battle guidance.
3. Shared inspector/deck browser, then touch/keyboard targeting and reward/rest confirmation.
4. Photo lifecycle, skippable reveal, save/retry semantics, and recovery tests.
5. One art prototype, visual review, then remaining environment/map polish.

Every phase requires its acceptance checks plus affected engine regressions. Before release, run all regression suites and both real UI journeys, verify legacy saves and cancellation races, review the full viewport matrix, and record at least one iOS and Android touch pass. Missing device or provider evidence remains an explicit unchecked gate; a mock pass does not substitute for it. No unresolved blocker may prevent starting, reading/playing cards, ending turns, choosing rewards, recovering from generation failure, or resuming supported saves.

Prepare the deployment revision and rollback target after checks pass. Keep save migration backward compatibility in view: rolling back code must not silently corrupt new saves. Deployment should happen only as a separately authorized execution action.

## Review disposition and baseline execution

| Reviewer | Findings incorporated | Disposition |
| --- | --- | --- |
| Player experience | Inspection versus commitment; actual deck browser; saved-run protection; camera lifecycle; narrow/short screens; input/focus semantics; zoom and reduced motion moved into the first release | Reviewed actual draft; requested clarifications incorporated. |
| Architecture | Store action guards; stale generation response rejection; runtime response validation; immutable run origin; RNG/event persistence; home preserving the run; production metadata handling; real-photo requirement for provider success smoke | Reviewed actual draft; requested corrections incorporated. |
| Testability | Store-driven versus UI evidence; fail-closed mock mode; fixed signature-card fixtures; isolated servers; separate server typecheck; controlled failure responses; comparable visual baselines; production and real-device gates | Reviewed actual draft; no additional blockers after listed corrections. |

Checks actually run during planning:

- Frontend TypeScript check: PASS, tsc --noEmit.
- Frontend production build: PASS, vite build. Output CSS 99.04 KB (17.88 KB gzip), JavaScript 252.25 KB (76.25 KB gzip). These figures exclude artwork and are not a page-load benchmark.
- Whitespace/diff check: PASS. Documentation links and source paths checked before delivery.
- Server typecheck, engine/browser suites, real-device verification, deployment smoke, and provider success smoke: NOT RUN during planning. These remain implementation gates, not implied passes.

Only this plan is being added; no product code, deployment, or saved game was changed. No claim of completed implementation acceptance follows from the baseline build passing.

## Implementation progress

First batch implemented locally: starter entry, stable landing contrast, zoom and reduced-motion CSS, combat command guards, generation cancellation identity and timeout, explicit camera activation and photo confirmation, and immediate reveal entry. README and metadata now use the owner-confirmed custom domain. Shared card inspection, complete input accessibility, save/replay migration, art pass, and remaining release gates are still pending.

Validation: frontend typecheck/build and tests/action-guards.mjs pass. Browser interaction verified landing → starter map → first combat without a photo. Reviewer-found stale-drag rejection and LAN seed compatibility issues were fixed with regression coverage for drag cleanup. Photo upload/camera lifecycle changes still require browser/device acceptance checks. No production deployment performed.

Second batch implemented locally: shared native-dialog card inspector, hand inspection with explicit play and enemy selection, readable unavailable cards, deck browser, reward inspection plus Add to deck, and keyboard-operable map nodes. Browser checks passed for attack target selection, defensive card inspection/play, keyboard inspection, Escape focus restoration, and deck browsing. Tests now cover duplicate reward commitment. Review findings on pre-threshold drag hit testing and trigger focus were fixed. Full touch/device coverage, reward UI journey, shop/rest/reveal reuse, and remaining plan work are still pending.


## Text audit follow-up — November 5, 2026

Implemented meaningful-upgrade eligibility, one-use Power behavior, honest generation-unavailable errors with a starter path, saved-description migration, shared attack preview math, multi-hit labels, and a source-backed photo-handling disclosure. See `text-and-meaning-audit.md` for decisions and verification limits. Run `node tests/action-guards.mjs`, `node tests/copy-contracts.mjs`, and `node tests/save-and-generation.mjs`; the last requires server dependencies (`npm ci --prefix server`). No live provider calls are made by these tests.

> November 5 update: user rejected server ONNX removal. The current selfie flow uses browser Canvas to fit the photo into an illustrated Street Runner. Earlier server-model and Gemini color-key experiments are historical. See [current implementation and verification limits](browser-character-cutout.md).

# 2D combat implementation specification

Revision: reviewed specification v1, November 5, 2026 (draft 3 passed Round 3). Implementation is in progress; evidence and remaining gaps are tracked in upgrade-execution-log.md. This specification translates [the research](2d-combat-arena-research.md) into work packages. Review findings and resolutions belong in [the review log](2d-combat-review-log.md).

## Review outcome and starting point

Three completed review rounds covered five disciplines through three AI reviewers, producing nine reports and 15 role-specific assessments. All 27 tracked findings are addressed in this specification; reviewers found no remaining material planning blocker. This is not a claim of human expert certification or runtime readiness.

Start with W0a: isolate and test command ownership, checkpoint and RNG correctness. Freeze the corrected baseline in W0b, then prove worst-case mobile composition in W1 before expanding renderer or art production. References to W0 below mean the combined W0a/W0b preparation phase.

Supporting documents: [review findings and resolutions](2d-combat-review-log.md), [initial actor inventory](2d-combat-actor-inventory.md), [research and primary sources](2d-combat-arena-research.md).

## Product contract

The player controls a full-body 2D street hero facing full-body monsters on a shared street/level. Neither side is enclosed in a card or portrait frame. Cards remain the action interface. Health, Block, status and intent remain readable near actors. Preserve the current nine-floor run and turn-based rules. Five locations use the same renderer: Ocean Drive (1–2), Wynwood After Dark (3–4), Floodline Underpass (5–6), Club Backlot (7–8), Skyline Rooftop (9).

This release changes presentation, not enemy stats, card balance, reward pools or encounter weights. The preceding uncommitted tactical changes are a separate baseline decision: establish and record a rules commit before parity tests. No copied Slay the Spire assets, UI artwork or characters. Use its clear separation of action cards, actors and intentions as a design reference.

## Architecture and ownership

React 18 owns navigation, card hand, dialogs, target buttons and text HUD. Zustand owns authoritative combat state. The existing sequential action queue applies effects. A plain PixiJS Application mounts within a React-owned element; no React major-version upgrade or Phaser migration is required. Select and pin a compatible PixiJS version during the initial technical spike using the official sources linked in the research.

Proposed modules:

| Module | Responsibility |
|---|---|
| `components/combat/BattleStage.tsx` | Mount/unmount renderer, resize observation, fallback, subscription boundary |
| `rendering/BattleScene.ts` | Layers, actor objects, camera transform, atlas playback, effects |
| `rendering/CombatPresentation.ts` | Translate identified queue actions to visual cues; cancellation and deadlines |
| `rendering/battleLayout.ts` | Pure layout function, actor anchors, projected HUD/target bounds |
| `components/combat/ActorHUD.tsx` | Semantic actor inspection/target controls, health, Block, intents |
| `data/locations.ts` | Five location definitions, floor mapping and asset bundles |
| `data/actorVisuals.ts` | Actor manifest registry and fallback references |
| `core/battleVisualModels.ts` | Versioned data contracts, validation and safe defaults |
| `public/assets/battle/` | Authored actors, atlases, location layers, effect textures |

The scene never mutates HP, energy or statuses. React does not rerender once per animation frame. Sprite transforms belong to the scene ticker. Publish anchors on layout changes rather than flooding the store every frame. The accessibility/target layer and the renderer consume the same layout result. Target bounds remain stable during decorative recoil/lunges.

## Proposed contracts

```ts
type LocationId = 'ocean-drive' | 'wynwood' | 'underpass' | 'club-backlot' | 'rooftop';
type ActorClip = 'idle' | 'attack' | 'cast' | 'hit' | 'guard' | 'defeat' | 'celebrate';
interface CombatAppearance {
  version: 1;
  actorVisualId: string; // validated registry key, not an arbitrary executable asset
  paletteId?: string;
}
interface ActorVisual {
  id: string;
  atlasUrl: string;
  fallbackImageUrl: string; // transparent full-body art
  footAnchor: [number, number];
  facing: 'left' | 'right';
  mirrorAllowed: boolean;
  visualHeight: number;
  clips: Partial<Record<ActorClip, { frames: string[]; durationsMs: number[]; loop: boolean; completion: 'idle' | 'hold' }>>;
}
interface PresentationCue {
  battleId: string;
  actionId: string;
  sourceId: string;
  targetIds: string[];
  clip: ActorClip;
  impactAtMs: number[];
  durationMs: number;
}
```

Location definitions contain layer URLs and mobile/desktop variants, light/shadow palette, crop preset, ground plane, actor slot sets, boss slot set and bounded ambient-effect preset. Actor data must support large/wide monsters without distorting aspect ratio. Require foot anchors and validate clip frame counts/durations before loading.

Persist appearance and location mapping version/ID, not animation frames, GPU resources or in-progress renderer objects. Existing saves without visual fields resolve to archetype actors and deterministic floor mapping. Preserve existing gameplay RNG state. Decorative motion uses an independent seed or time source.

## Action and animation protocol

Assign stable battle/action IDs when actions are enqueued. Presentation begins anticipation; the authoritative queue owns the impact step and applies each effect once. Events carry the action ID and targets. UI health and hit effects use the same authoritative result. Callbacks may acknowledge completion but never apply damage.

Normal attacks: anticipation → attack/travel → impact → reaction → recovery. Multi-hit uses one impact per Damage action; area attacks use a shared visual cue but preserve existing target order and trigger semantics. Block, HP damage, Burn ticks, healing and Thorns need distinct feedback. Dead enemies stop acting and no longer accept input.

Every animation wait has a deadline and a battle cancellation token. On missing assets, reduced motion or renderer failure, immediately settle/skip the visual wait and continue the authoritative queue. On scene disposal/new run, cancel old presentation work and subscriptions. Visibility loss stops ambient work; resuming must not replay applied effects. Exercise this with fake-clock tests before real artwork integration.

Initial motion targets for playtesting: roughly 100–160ms anticipation, 100–180ms swing/travel, 150–250ms reaction/recovery. Avoid an extra long delay per small damage tick. Offer reduced motion with no shake or parallax; keep readable result feedback.

## Interaction and layout

Desktop: hero left, enemies right, shared ground; compact stat HUD above the arena, hand and End Turn below. Portrait: hero lower-left, enemies in staggered right-side depth slots. The actor art and HUD are placed independently so intent information cannot be hidden by weapons or tall heads.

Compute layout from usable CSS viewport excluding header, controls, hand and safe-area insets. Never resize the whole desktop interface into portrait. Provide presets for one, two, three enemies and a large boss. Minimum interactive target regions are 44×44 CSS pixels and may extend beyond visible sprite silhouettes, but cannot overlap each other. HUD must preserve stable association between each actor and its intent.

Input states: idle → inspect card → choose target → submitting → resolving → idle. Tap a monster while idle to inspect; while targeting, select that enemy. Escape/Cancel returns to inspection without spending energy. Revalidate card, energy, target and phase at commit. Disable repeated submissions during resolution. Keyboard controls and visible focus use DOM buttons. Decorative canvas is hidden from assistive technology; DOM labels expose actor name, HP, Block and imminent action.

Keep drag optional. Use shared layout projection for drag/drop, pointer targeting and DOM positions. Recompute on resize/rotation; cancel active drag on orientation change. Do not let the arena intercept hand scroll or UI clicks. Retain inspect-then-confirm as the reliable phone path.

## Art production package

Style: illustrated Neo Miami cutouts with strong silhouettes, three-quarter side view, consistent warm/cool rim lighting, restrained texture and clearly planted feet. No photographic heads pasted onto incompatible painted bodies. No rectangular baked glow or scene backdrop inside actor files.

First finished encounter: Street Runner, Rat, Golem and Spider, deliberately covering small, bulky and multi-hit enemies. Produce idle, attack/cast, hit, guard and defeat as applicable; hero also celebrates. Use existing mechanics for demonstration, not new enemy tuning. A temporary static cutout is acceptable for layout exploration but cannot pass the finished-encounter gate.

Deliver source artwork, transparent fallback, packed atlas, frame metadata, foot anchor, scale reference, contact-shadow settings and asset provenance. Use tagged animation exports and preserve trim/pivot metadata. Test on pale/dark backgrounds and at phone size. Atlas animation must not wobble at the feet. Boss and ordinary monsters have separate scale allowances.

Location briefs:

| District | Ground and silhouette landmarks | Motion | Avoid |
|---|---|---|---|
| Ocean Drive | Wet street, palms, Art Deco hotel edges | Slow palms/reflections | Bright signs behind intent text |
| Wynwood | Cracked pavement, mural walls, shutters | Distant light sweep | Murals competing with actors |
| Underpass | Concrete pillars, water edge, service lights | Sparse ripples/drips | Hidden feet or actor/water ambiguity |
| Club Backlot | Loading dock, cables and speaker silhouettes | Slow haze | Strobe effects or obscuring smoke |
| Rooftop | Roof markings, skyline and antennae | Wind/cloud drift | Foreground masking boss targets |

Each location delivers desktop and portrait composition guides and independent background/ground/optional foreground layers. Visual location selection does not restrict encounter pools in this release.

## Selfie integration

Updated by the user's subsequent requirements: a submitted selfie must produce a personalized full-body battle character, with the exact accepted cutout used in preview and gameplay. Keep `portraitUrl` separate from `combatAppearance`. Gemini generates controlled green-screen character art; browser Canvas removes the background without an AI removal model or paid removal service. Server ONNX matting was rejected on cost grounds and is removed. Existing Gemini generation charges remain.

Persist the bounded transparent WebP as version 2 appearance. Personalized cutouts use procedural movement and must never switch to another hero's authored action poses. The full-roster authored animation requirement still applies to stock actors; personalized procedural motion is an explicit separate representation requiring quality review. Show the exact battle character before starting the run. The rollout flag remains disabled until real generated-image quality and browser compatibility pass.

An invalid backdrop, clipped silhouette or processing failure returns an actionable retry message with the existing starter-hero escape path. Do not silently replace failed personal artwork with stock art. Existing saves without personalized cutouts keep explicit archetype resolution and recovery feedback. No battle-time image generation, model downloads, or photo-to-removal-service transmission is needed. Preserve generation cancellation, stale-request protection and the existing photo-handling disclosure.

See [browser character cutout implementation and evidence](browser-character-cutout.md). Earlier face-personalization exclusions in the original review record describe the initial scope and are superseded by this user requirement.

## Work packages and dependency order

| ID | Work | Depends on | Acceptance evidence |
|---|---|---|---|
| W0a | Characterize and separately fix command ownership, checkpoint/RNG invariants; inventory assets and obsolete layout guidance | None | Prerequisite invariant tests; scope distinct from renderer aesthetics |
| W0b | Freeze corrected rules baseline and record revision; finalize reachable roster ledger | W0a | Parity baseline after correctness fixes; no further balance changes |
| W1 | Layout spike and one-hero/three-monster stress layout and art study | W0b | 320px, portrait, landscape and desktop composition proofs |
| W2 | Renderer lifecycle, manifests, loading/fallback and pure layout | W1 | Mount/unmount/resize/missing-asset tests; no stale subscriptions |
| W3 | Queue-to-presentation protocol and actor HUD/target layer | W2 | Rules parity and input tests; exactly-once effect application |
| W4 | Finished hero + three-monster encounter, timing and effects | W3 | Full battle and reward video; readable intent and reactions |
| W5 | Five locations, deterministic mapping, migration and streaming | W4 | All districts across enemy-count/layout matrix |
| W6 | Personalized selfie cutout, browser removal, explicit starter fallback | W3, W4 | Preview/run/save identity, real generated-image quality, browser compatibility and failure-path tests |
| W7 | Full roster coverage, device QA, performance and deployment | W5, W6 | Every reachable encounter has usable actors; release checklist passes |

Release tiers are explicit:

| Tier | Required coverage |
|---|---|
| Controlled preview | Named legal encounter and dev stress fixture only; clearly scoped preview. |
| Full-run beta | Every reachable actor has approved full-body art and an assigned motion tier; any limited-motion exceptions are listed openly. |
| Portfolio release | Every reachable actor has authored idle, attack, hit and defeat; cast/guard when mechanics require them. Any exception requires a recorded art/design review, never a silent static fallback. |

Static full-body/silhouette display is degraded error recovery, not evidence of completed ordinary animation. [Initial actor inventory](2d-combat-actor-inventory.md) lists 23 enemy definitions, 21 referenced in encounter pools, and five player archetypes; trace runtime/legacy reachability before excluding either unreferenced definition.

## Verification and release gate

- Roster art: run `node scripts/report_battle_motion.mjs --check-release` before publishing the portfolio build. This checks registered stock heroes and encounter actors for authored motion coverage and explicit art approval. Visual review supplies the approval.
- Automated parity: same seed/input sequence with normal, reduced and disabled animation; compare HP, energy, statuses, piles, RNG and rewards after every resolved action.
- Timing/lifecycle: multi-hit, area attacks, Burn before enemy action, Thorns, dead targets, simultaneous defeat, double taps, renderer deadline, late callbacks, new run, StrictMode mount/unmount and context loss.
- Saves: old starter/generated runs, location/appearance missing fields, reload and interrupted presentation. Never serialize graphics objects.
- Visual matrix: five districts × 1/2/3 enemies/boss × 320×568, 390×844, 430×932, 844×390, tablet and 1440×900. Assert no HUD/hand/target collisions; capture named screenshots.
- Real devices: iOS Safari, Android Chrome and one lower-powered phone. Verify touch, rotation, background/resume and a complete nine-floor run.
- Accessibility: keyboard-only combat, focus restoration, readable labels, reduced motion and no ambient flashing.
- Performance targets to validate: 60fps typical combat, optional 30fps low mode, initial art around 3–5 MB, texture estimate around 64–96 MiB; cap resolution and effects. Record frame-time distribution and texture/resource counts over ten minutes and repeated district transitions.
- Loading: slow/offline/missing image paths produce a usable actor fallback; switching districts does not retain all full-resolution textures.
- Release: build/regression checks pass, dev fixtures absent in production, live mobile smoke test covers combat → rewards → map → reload. Retain previous release for rollback.

These gates are planned evidence, not completed tests. Renderer implementation, final art, hardware profiling and deployment remain outstanding.


## Round 1 decisions — binding implementation contracts

These decisions refine the sections above. They are required work, not completed fixes.

### Checkpoints and RNG (E1)

Implement save-schema v2 as a prerequisite in W0a: atomic stable-command checkpoints. Persist the pre-command checkpoint before accepting a card or End Turn; persist the post-command checkpoint only after all resulting effects, phase transitions and rewards are settled. Persist the RNG's serializable internal state/cursor. A reload during a command restores the previous complete checkpoint; it does not resume partial effects or spend a card twice. Do not save while a command is in flight, the queue is nonempty, or resolution is active. Replace the debounce-only safety assumption.

Legacy saves cannot recover their original RNG cursor. Migrate deterministically from the stored seed and explicitly do not promise historical replay continuity. Test legacy data independently from new-save continuity. Storage failure must leave the in-memory run playable with an honest “Progress could not be saved” notice; never report a successful checkpoint when persistence fails. Visual preferences and scene initialization never draw from gameplay RNG.

### One queue clock and explicit timing ownership (D4, D5, E2)

The queue coordinator owns all impact scheduling. Replace existing 250ms pre-hit and 320ms recovery presentation delays, 650ms announcement waits and 400ms enemy gaps with one timing policy; do not append new waits. Give every parent command an ID and every expanded action an ordered child ID. The coordinator applies an effect once, then emits its actual result. Renderer completion can shorten a recovery wait, but cannot apply an effect or move its impact earlier. A timeout settles a presentation barrier once; late/duplicate callbacks are ignored. New-run cancellation invalidates both coordinator timers and renderer generations.

Keep serial effect/retaliation ordering even when area-hit visuals are grouped. Victory/defeat is committed by the queue; dead actors are immediately inert and show their defeat animation for a bounded presentation window before the result overlay. The checkpoint is not contingent on a canvas animation callback.

Intent view model: derive hit count, current damage modifiers, Block and status components from the same effect payload. Main badges are current previews; inspection states that expiring statuses can change damage before an attack. Retain the executing intent through its effects, reveal the next only at CALCULATE_INTENTS, and never imply an exact end-turn forecast without implementing it. Test expiring Weak/Vulnerable, changing Strength and combined intentions.

Provisional pacing gates: ordinary single-card resolution ≤800ms, ordinary three-enemy turn ≤4 seconds excluding documented boss spectacle. Measure multi-hit and retaliation cases; tune with comprehension tests. Disabled animation removes visual waits, not game effects.

### Targeting and focus (E3, U1, E5)

Play closes the native inspector before entering a nonmodal target state. Show a compact selected-card summary and Cancel, focus the first living target, and provide a text target list using the same controller. Selecting a valid target commits immediately—no extra confirmation. Escape/Cancel spends nothing, reopens inspection and restores its Play focus. After commit, focus the next available hand control or End Turn. End Turn is unavailable while targeting or resolving. Ignore the pointer event that closed the modal so it cannot also select a monster.

Keep target state in one controller, not divergent HandHUD/modal/scene local states. Revalidation failures stay in targeting with a clear message or cancel if no legal targets remain. Self/all-enemy actions follow the same submission guard without a target-selection step.

One hit-test service replaces all radius-plus-25 heuristics in EntityPanel, CardItem and TargetingArrow. Named spaces are logical-stage units → CSS-local stage pixels → viewport/client pixels. Canvas backing pixels are rendering-only; DPR must not change hit testing. Share projected regions across arrow, preview, commit and DOM controls. Slots and target regions remain stable during animations and after other monsters die; decorative movement does not imply range or collision mechanics.

### Loading, ownership and fallback (E4, U4)

Stage owns its Application, ticker, observers and listeners. A reference-counted asset cache owns shared textures; acquire/release bundles and only destroy resources after their final user releases them. Async init/load results carry a stage-generation token; disposal releases late results and prevents stale attachment. StrictMode mount/unmount must not leave an extra canvas or ticker.

States: loading (status + no combat input), ready (normal scene), degraded (DOM full-body actors + readable controls), unavailable (local built-in silhouette/semantic target controls while retry is offered). The DOM fallback is outside the failed canvas and uses bundled transparent images or inline vector silhouettes independent of remote atlases. Unlock input only when actors and their target identities are represented by a working scene or fallback. A failed individual asset uses its approved local actor fallback. Context loss during selection preserves or safely cancels selection without spending; during resolution the coordinator continues and fallback reflects authoritative state. Retry only reloads presentation; never restart the encounter or grant rewards twice.

### Art coverage and style gate (A1–A3, D2, D6)

W0 includes a coverage ledger for all reachable enemies, bosses and all five player archetypes: template/visual ID, encounter reachability, source/provenance, required clips, fallback, artist/reviewer owner, status and intentional animation tier. Join it automatically to production encounters. Decide tiers before W4 art lock. Full-run beta requires approved full-body assets for every reachable actor; portfolio release also requires a reviewed animation baseline across the roster. Static fallback is error recovery, not an undisclosed finished animation tier.

Rat/Golem/Spider together are a developer-only composite fixture. Separately test one unchanged legal production encounter. Exclude composite fixtures from production. World position never changes combat mechanics.

Approve a style sheet with neutral baked key light, restrained location tint, scale lineup, contact-shadow rules, maximum attack silhouette bounds, transparent motion padding and mirroring permission per actor. Lock atlas dimensions, padding and extrusion based on the W1 spike; verify trim/pivot consistency and no edge bleed. Face personalization remains a separate opt-in scope gate. Every accepted generated run must show the same battle actor as its preview; a later fallback must be identified by visible feedback.

### Worst-case mobile and comprehension gate (D1, D3, U2, U3, E6)

W1 must prove 1/2/3-monster and boss layouts with small/bulky/tall maximum-envelope silhouettes, long names, status overflow, a 10-card hand and real-sized HUD at 320×568 and 844×390. Critical HP/intent/control numbers use a minimum 14px UI size; no hidden or overlapping 44px targets. On short screens the hand has a bounded-height horizontal scroller, not expanding rows. Show at most three status icons plus a “+N” inspection control. Preserve actor-slot/HUD association after deaths, with paired focus/selection highlighting and non-color-only indicators. Never move surviving targets into dead slots mid-fight.

If ordinary portrait slots fail, use a compact arena preset with decorative labels removed and a separate ordered intent/target strip, preserving a visible hero and monsters on shared ground. Prove the preset before art scale lock; do not solve failure by shrinking critical text. Confirm on a real touch device before locking production art scales.

Name the actual test-device models and browser versions at W0. Measure a fixed ten-minute combat/churn script with p50/p95/p99 frame times and long frames; target p95 ≤20ms in standard mode, ≤35ms low mode, with visible quality reduction when budget fails. Record texture dimensions/allocation estimates and resource counts separately from browser process memory; do not label estimates measured VRAM. A repeatable scene must pass cold/warm loading and return resources near baseline after 20 mount/district cycles.

Run a small formative study with five first-time players: identify hero, associate highest threat with its monster, inspect status, target a card and end turn without coaching. Record errors and time; repeated critical confusion requires revision and a fresh task check. This sample provides formative evidence, not statistical certification.


## Round 2 decisions — final protocol refinements

### Card ownership, checkpoint recovery and RNG (E7, E8)

Before freezing W0b's baseline, fix the existing 800ms `cleanupPlayingCard` dependency: accepted cards move from hand into an authoritative resolving-card zone owned by the command. Effects run while that card is unavailable for draw/reshuffle. A coordinator finalization step moves it to discard or exhaust (including Power cards) on every terminal path, including last-enemy kill and player death by retaliation, before the checkpoint or another command. Keep the visible flying card as a presentation-only ghost; its cleanup never changes gameplay piles. Do not assume a queue-empty condition alone proves all command state has settled.

Assert exactly one authoritative owner per physical card instance: draw, hand, resolving, discard or exhaust within battle ownership. Master deck remains the run template inventory, not a second battle-pile owner. Test zero-cost draw, reshuffle, draw+exhaust, Power, lethal hits, retaliation death and reload around finalization with animation normal/reduced/off. Characterize any changed legacy behavior and document the correctness fix separately from visual parity.

Implement fixed-size `RNG.snapshot()` / `RNG.restore()` with algorithm version and validated integer state. All consumption paths (`next`, `nextInt`, `randomElement`, `shuffle`) must capture the same underlying generator progression; counting only `next()` is insufficient. Do not replay an unbounded cursor from untrusted save data.

Validate saves before migration. Valid v2 checkpoints restore a complete command boundary. Stable legacy map/player-turn/reward states may migrate using the documented seed fallback; unsafe legacy enemy-turn or inconsistent pile states have no recoverable missing queue. Preserve their raw data in a quarantine/backup record where storage allows, show a clear recovery explanation, and offer an explicit new run or return to menu. Do not silently invent effects or claim the old turn resumes. In-memory checkpoints remain available when storage fails; tell the player reload recovery is unavailable.

### Animation semantics and release consistency (D7, A4, A5)

Idle loops. Attack/cast/hit/guard/celebrate default to finite playback then idle. Defeat interrupts other visuals, holds its specified final frame, and is removed after the terminal presentation window; it never loops. A missing optional cast/guard clip uses idle plus bounded cast/guard FX. Missing mandatory clips fail asset acceptance and use degraded fallback at runtime. All playback returns or disposes deterministically; no queue progression depends on clip presence. Verify every actor's full clip cycle, optional fallbacks, defeat interruption and disposal. Mandatory tier/clip requirements live in the coverage ledger and its validator.

### Intent qualification, accessibility and contrast (D8, U5, U6)

The intent view model exposes `previewKind: 'current'` and an accessible “Current damage preview” label. Use a persistent compact non-color-only approximation marker with an inspectable explanation on preview damage, avoiding false precision while modifiers may expire. Executing-hit feedback shows actual resolved amounts. Include Weak expiry in the formative End Turn decision task; no speculative prediction engine is added here.

Use one primary sequential DOM target-control set: arena-overlay buttons on roomy layouts, the ordered target strip on compact layouts or when explicitly selected by the user. Do not expose duplicate tab stops for the same target. Pointer sprite regions map to those same controls. Actor inspection remains available outside targeting. One polite live region announces concise turn/result summaries; individual HP and intent fields are not separate live regions. Verify with keyboard and an actual screen reader; after focus target death, advance to the next living target or Cancel.

Project readability targets: HUD text at least 4.5:1 and essential graphical indicators/control boundaries at least 3:1 against their rendered backing. Give critical information stable backing surfaces, check all five district palettes and brightest/darkest motion frames, and verify selected/focused targets in grayscale and reduced motion. These are project acceptance targets, not a claim of completed accessibility certification.


## Additional user requirement — readable cards

Cards must not be shrunk to fit the entire hand. Current local UI adjustments use a 152×220px portrait hand, 144×180px on short screens, and 190×270px desktop cards. Mobile rules text is 12px minimum and inspection provides full-size 16px text. Use horizontal hand scrolling on mobile and keep the arena/End Turn unobstructed. Preserve this readability requirement in the new renderer prototype; test long generated descriptions, all ten cards, keyboard focus and real touch scrolling. These local sizes have browser viewport checks but are not physical-device certification or part of the prior three-round specification review.

# Arena review — round 1: art and UX/UI

Reviewed: `docs/2d-combat-implementation.md`, draft 1, plus research and existing `HandHUD.tsx`, `CardInspector.tsx` and mobile combat CSS. This is an AI role-based review using two separate professional lenses, not a claim of human credentials. No visual prototype exists yet; findings concern the specification and existing integration points.

Severity: P1 = resolve before the affected implementation package; P2 = resolve before release. Verdict: **revise before implementation**, with strong overall direction.

## Art director / 2D artist lens

### A1 — P1: Full-run asset coverage remains an unbudgeted final-stage task

The plan defers all reachable actor coverage to W7 while promising a five-location nine-floor run. The repository has 23 enemy images and five player archetypes; a hero plus three monsters is a useful slice, but it does not bound the remaining art work. “Static fallback for less prominent enemies” needs a defined coverage inventory, otherwise late monsters will be visibly unfinished or missing.

**Remedy:** W0 should produce an actor coverage table containing every reachable template and each archetype, required clips, hero/boss priority, fallback asset, source/provenance, status and review owner. Split the release definition into a limited encounter preview versus a full-run release. Every reachable full-run actor must pass the cutout/silhouette/anchor standard; identify which static actors are intentional and acceptable before W4 art lock, rather than at W7.

**Test:** An automated manifest/encounter join detects missing actor definitions and fallbacks. A contact sheet renders every actor on pale and dark ground at minimum phone scale; every reachable boss is inspected in its dedicated slot. Full-run release cannot pass with missing entries.

### A2 — P2: Lighting and asset export specifications are not concrete enough for consistent production

“Warm/cool rim lighting” plus five dramatically different locations can result in actors with conflicting baked lighting, unlike apparent scale and inconsistent ground contact. The brief also leaves idle silhouette, animation overshoot, padding and horizontal mirroring rules undefined.

**Remedy:** Add an approved visual style sheet: common neutral key light, limited location tint, scale lineup, ground shadow rules, transparent bounds and motion padding. Specify whether each actor can be mirrored; asymmetric equipment and lettering must not flip unintentionally. Author foot anchor and maximum attack bounds from the same coordinate convention. Specify runtime atlas maximum dimensions and padding/extrusion after the spike rather than leaving exporters to guess.

**Test:** One hero and the small/bulky monsters render across all five district light palettes with the same apparent scale and grounded feet. Atlas-edge and attack-overshoot tests verify no cropped extremities or texture bleed.

### A3 — P1: Selfie representation needs a firm first-release product contract

The proposed initial bodies may preserve only a palette while the product promises a recognizable selfie hero. “Conditional head customization” is not a bounded deliverable and could invite a late art-pipeline expansion or an unexplained downgrade.

**Remedy:** State precisely what the initial release guarantees: authored archetype body, optional validated stylized head, portrait elsewhere, and whether outfit matching is excluded. Treat face customization as a separate gated spike. Preview the exact combat actor alongside the generated portrait, explain any fallback, and let the player return or accept it before run creation. Do not imply personalization that is absent.

**Test:** Exercise recognizable head, unsupported head, failed image and old-save flows. In each, the actual battle actor matches the preview; the fallback never silently substitutes after player acceptance except through explicit error feedback.

## UX/UI lens

### U1 — P1: Arena targeting conflicts with the current native modal inspector

The plan says tapping a monster during targeting selects it. Today `CardInspector` calls `dialog.showModal()`, making the arena behind it inert, and `HandHUD` lists target buttons inside the modal. An implementation could leave visible monsters unclickable or remove the modal without defining focus behavior.

**Remedy:** Define one explicit transition. Recommended: the Play action closes the native inspector and opens a nonmodal target-selection state with a compact selected-card summary, Cancel, arena target buttons and keyboard focus on the first valid target. Alternatively retain all target choices inside the modal and do not promise arena tapping. Document whether choosing the target commits immediately or requires another confirmation, consistently across touch/keyboard. On cancel restore the selected card inspector; on commit restore sensible hand focus.

**Test:** Native dialog is closed before arena targets activate. Card → Play → target spends energy once; Cancel/Escape spends nothing and restores focus. Test touch, keyboard, target invalidation, reflow and next-turn transitions.

### U2 — P1: The narrow-screen layout gate must include the actual worst-case hand and HUD

W1 proves only one hero and one monster. The hardest constraint is three monsters plus 10 cards, long names, several statuses, safe areas and a 320×568 viewport. “Excluding the hand” does not establish enough usable stage height or an overflow policy. Discovering that at W5 would force redoing art scales and anchors.

**Remedy:** Make W1 include a placeholder stress layout with three monsters, boss, 10-card hand and maximal HUD. Specify a fixed/minimum arena region and horizontal hand browsing on short screens rather than growing the hand into actors. Define status overflow (e.g. limited visible icons plus a count opening inspection) and reserved intent bands. Do not reduce critical numbers below a chosen readable UI text size to satisfy geometry.

**Test:** 320×568 and 844×390 stress fixtures show health/intent values, selected target, energy and End Turn simultaneously; hand scrolling never scrolls or triggers the arena. No targets overlap. Confirm with a real touch device before final artwork scale lock.

### U3 — P2: Stable actor-to-intent association needs more than readable labels

With staggered depth, large monsters and independent HUD placement, a player can read an intent but attribute it to the wrong monster. Missing semantic differentiation also makes color-only Weak/Block cues unclear.

**Remedy:** Keep actor HUD identity stable through an entire combat, including death gaps. During inspection or targeting, highlight the actor and corresponding HUD together. Show damage and hit count, distinguish attack-plus-Block and attack-plus-debuff, use text/icon shape alongside color, and provide a short “next action” description accessible without hover. Avoid moving surviving targets into dead slots until combat ends.

**Test:** Three-monster scenario with two similar enemies and different multi-hit/Block/debuff intents: select each HUD/actor pair, kill one, and confirm survivors and their focus/labels keep association. Screen-reader announcement references enemy name and its own intent.

### U4 — P2: Loading and renderer fallback need player-facing states

A “usable actor fallback” and resource deadline are technical requirements, but the player experience while a new district or actor loads is unspecified. An empty stage with active cards is especially damaging for the portfolio demo.

**Remedy:** Define loading, ready, degraded and unrecoverable visual states. Keep actions unavailable until either the main scene or an accessible fallback is ready; do not spend energy during an incomplete target scene. Use the existing local transparent fallback without presenting portrait frames. Provide retry/back-to-map behavior only where it cannot duplicate or reset combat outcomes.

**Test:** Slow district assets, missing atlas, context loss during a target choice and failed fallback image all give an intelligible state. An attempted play cannot hit an invisible ambiguous target or duplicate an action when rendering recovers.

## Round 1 exit conditions

Resolve A1, A3, U1 and U2 in the implementation specification before starting their dependent work. A2, U3 and U4 need explicit contracts/tests before production art and release. No art or UX acceptance has been empirically earned yet; this review approves the direction but not a shipping experience.

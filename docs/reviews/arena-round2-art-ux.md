# Arena review — round 2: art and UX/UI

Reviewed draft 2, including the binding Round 1 decisions. AI role-based review; no artwork or live renderer was tested. Verdict: **the Round 1 P1 specification blockers are resolved; proceed to W0/W1 after small clarifications below.** This is not visual or release approval.

## Art director / 2D artist lens

| Finding | Status | Reason |
|---|---|---|
| A1 — coverage inventory and release scope | Resolved in plan | W0 now joins an owned coverage ledger to reachable encounters; beta versus portfolio tiers are explicit and static error recovery is distinguished from finished art. |
| A2 — consistent art/export standards | Resolved in plan; proof pending | Style sheet now covers key light, scale, padding, bounds, mirroring, contact shadows and atlas settings locked by the spike. |
| A3 — truthful selfie contract | Resolved in plan | Guaranteed archetype body, optional separate head spike, exact preview and fallback feedback are explicit. |

### A4 — P2: Remove contradictory release-tier wording before implementers consume the plan

The W7 paragraph still permits “approved static full-body fallback art for less prominent enemies,” while the binding decision says static fallback is error recovery and portfolio release needs a reviewed animation baseline. The later section is explicitly binding, so the policy is recoverable, but two opposite instructions invite accidental scope erosion.

**Remedy:** Rewrite the original W7 paragraph to use the final beta/portfolio definitions. State that the coverage ledger's animation tier specifies the minimum approved motion per actor, and static-only display is a declared degraded state rather than a hidden lower-quality ordinary enemy.

**Test:** Every reachable template in a release audit maps to exactly one approved tier with a listed minimum clip set. The release checklist does not allow an actor to pass solely because a static fallback exists.

### A5 — P2: Specify animation playback defaults in the manifest contract

The typed actor manifest has frame durations but does not say which clips loop, what frame an interrupted guard/hit returns to, or what a missing optional clip does. Different actors could otherwise freeze after a hit or loop death indefinitely despite having valid atlases.

**Remedy:** Add playback policy: idle loops; attack/cast/hit/guard/celebrate are finite unless explicitly authored otherwise; defeat holds a defined final frame until removal; missing optional clips use a named bounded fallback (e.g. idle plus flash/guard FX). The coverage ledger defines mandatory clips for each tier. Keep this policy data-driven and independent of combat effect application.

**Test:** Cycle each approved actor through all supported and deliberately missing optional clips, interrupt with defeat, then dispose. No attack/death loops, floating feet, frozen interactive actor or hung queue.

## UX/UI lens

| Finding | Status | Reason |
|---|---|---|
| U1 — native modal blocks arena targets | Resolved in plan | Inspector explicitly closes, target state is nonmodal, pointer click-through is suppressed and cancel/commit focus are specified. |
| U2 — smallest viewport/worst-case hand | Resolved in plan; proof pending | W1 includes 3 enemies, boss, 10 cards, long names, real HUD and status overflow; compact fallback preset and real-device gate are explicit. |
| U3 — actor/intent association | Resolved in plan | Slots remain stable after deaths; actor/HUD highlight together; current-preview limitations and combined intents are explicit. |
| U4 — loading/fallback UX | Resolved in plan | Four states, independent local fallback, input readiness, presentation-only retry and context-loss handling now exist. |

### U5 — P2: Accessible parallel controls need one focus and announcement policy

Draft 2 requires DOM actor buttons and a parallel text target list. Without a deliberate accessibility policy, keyboard users may tab through duplicate targets and screen readers may announce every changing HP/intent label while the queue runs.

**Remedy:** Choose one primary sequential target-control set per layout/input mode. If both visual and text lists remain visible, make their relationship explicit and avoid a doubled default tab path. Announce a concise turn/result summary through one live region; do not mark every actor stat as independently live. Preserve meaningful actor inspection outside the target-selection state.

**Test:** Keyboard-only three-enemy targeting visits each legal target once in the intended order, Cancel restores Play focus, and a multi-hit turn produces a comprehensible concise announcement rather than dozens of competing updates. Confirm with a screen reader, not just the accessibility tree.

### U6 — P2: Readability gate should include contrast, not only font size

The 14px minimum is useful, but bright district art and colored status icons can still obscure critical values and focus rings.

**Remedy:** Add project acceptance targets of at least 4.5:1 for ordinary HUD text and 3:1 for essential graphical indicators/control boundaries against their actual rendered surfaces. Put critical text on a stable backing rather than sampling unpredictable background art. Verify focus and selected-target distinction in grayscale and with reduced motion.

**Test:** Check the brightest/darkest frame of all five locations and all input states; no critical value depends solely on neon hue, bloom or animated contrast.

## Round 2 exit conditions

A4–A5 and U5–U6 are specification clarifications before their respective production/integration packages. No additional P1 blocker found. W1 remains an empirical art/mobile feasibility gate; the document alone cannot establish professional visual quality.

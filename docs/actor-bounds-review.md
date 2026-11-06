# Actor artwork bounds review

The expanded portrait enemy lanes exposed a Rat attack-frame sizing mismatch: the idle source is 1536 pixels wide while the attack source is 1774. Applying the idle scale directly enlarged the attack's source canvas. The attack now uses a per-frame scale of 1536/1774, keeping its intended horizontal footprint without shrinking every enemy lane.

`node scripts/audit_actor_bounds.mjs --check` measures alpha >=32 bounds from packaged runtime artwork and projects them using source resolution, anchors, per-frame scale, and sampled procedural motion. It checks eight stage sizes, one/two/three enemy layouts, each actor in its eligible slots, and available idle/keypose art. It writes `docs/actor-bounds-audit.json` and exits unsuccessfully when any canvas or HUD intersection candidate exceeds the two-pixel tolerance.

Before the correction, three candidates involved the Rat attack and player HUD at 390×380, 390×464, and 430×520 stage sizes. After correction: 2,328 samples, zero candidates. The 168-case layout suite and clip playback suite also pass.

Browser verification used the actual Pixi scene at a 390×844 viewport, Rat in the upper-left enemy slot, Golem upper-right, Voltage lower-right, ten-card hand, and frozen attack contact at 140ms. The Rat clears the player HUD and remains inside the canvas. No browser warnings or errors were captured. Evidence: `tests/.e2e-out/rat-attack-bounds-mobile.png`.

This audit uses conservative bounding rectangles, not pixel-perfect collisions. It samples contact/anticipation/recovery times rather than every animation time, does not cover boss-specific layout, and treats loose pose sources as atlas-equivalent art. It is not a full animation, roster art-approval, or physical-device certification. These changes remain local.

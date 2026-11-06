# Actor artwork bounds review

The expanded portrait enemy lanes exposed a Rat attack-frame sizing mismatch: the idle source is 1536 pixels wide while the attack source is 1774. Applying the idle scale directly enlarged the attack's source canvas. The attack now uses a per-frame scale of 1536/1774, keeping its intended horizontal footprint without shrinking every enemy lane.

`node scripts/audit_actor_bounds.mjs --check` measures alpha >=32 bounds from packaged runtime artwork and projects them using source resolution, anchors, per-frame scale, and sampled procedural motion. It checks eight stage sizes, one/two/three enemy layouts, each actor in its eligible slots, and available idle/keypose art. It writes `docs/actor-bounds-audit.json` and exits unsuccessfully when any canvas or HUD intersection candidate exceeds the two-pixel tolerance.

Before the correction, three candidates involved the Rat attack and player HUD at 390×380, 390×464, and 430×520 stage sizes. After correction: 2,328 samples, zero candidates. The 168-case layout suite and clip playback suite also pass.

Browser verification used the actual Pixi scene at a 390×844 viewport, Rat in the upper-left enemy slot, Golem upper-right, Voltage lower-right, ten-card hand, and frozen attack contact at 140ms. The Rat clears the player HUD and remains inside the canvas. No browser warnings or errors were captured. Evidence: `tests/.e2e-out/rat-attack-bounds-mobile.png`.

## Expanded motion and boss pass

The audit now samples idle, attack, hit, guard, cast, celebrate, and defeat every 20ms through completion, plus authored frame boundaries and their preceding millisecond. It resolves the active artwork through the renderer's clip sampler and pose fallback. Every sample includes normal/reduced motion and idle-wave extrema. Solo boss layouts use the authoritative boss encounter roster; ordinary layouts continue to exercise all artwork in each enemy slot.

Conservative alpha rectangles identified small overlaps around floating actors' transparent corners. HUD candidates now receive a second pass: inverse-transform CSS pixel centers into the packaged texture and check alpha >=32, excluding a two-pixel inset around the HUD. This avoids shrinking artwork to correct empty corners. Canvas containment still uses conservative rectangles.

Result: 522,304 samples, 1,104 rectangle candidates, zero visible HUD intersections or canvas overflows beyond the tolerance. A deliberate regression check temporarily restored the old Rat attack scale: the command exited 1 with 27 Rat findings. Restoring the corrected scale returned exit 0. No temporary manifest change remains.

Limitations: discrete time and pixel-center sampling are not continuous-time or GPU-filtering proof. Overlapping reaction/cast overrides during another motion, failed texture loading, personalized cutouts, and simultaneous actor-to-actor intersections are not covered by this script. Loose pose sources represent atlas-equivalent art. This is not a full animation, roster art-approval, or physical-device certification. These changes remain local.

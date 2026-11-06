# Neon Wraith hit reaction

Added `art-source/battle/actors/neon-wraith-hit-v1.png` and its lossless runtime WebP, generated with the built-in image tool from the existing idle source. Source: 1199 × 1312 RGBA, alpha 0–255, alpha≥128 bounds (314,16)–(951,1298). The mask tilts back and claws fold inward in a compact recoil; the ribbon-tail retains the idle baseline. Anchor [.5,.99], no scale correction. Hit clip: reaction140ms, idle80ms, then idle; gameplay timing is unchanged.

Visual review: 390 × 844 and 320 × 568, three enemies and ten cards, hit sampled at80ms. The pose remains within its target region and below its HUD. No browser warnings/errors. Evidence: `tests/.e2e-out/wraith-hit-390.jpg` and `wraith-hit-320.jpg`. Smallest-layout monster detail remains limited by available arena height and still needs physical-device comprehension review.

Validation: transformed-alpha audit758,052 samples, zero confirmed clipping/HUD conflicts. All550 encounter/hero/district inventories stay below5MB transfer and64MiB estimated decoded RGBA; maxima4,772,610bytes and46,493,696bytes. Clip lifecycle and texture metadata tests pass. Packaging verifies91 assets155,983,367→24,605,088bytes. These are asset estimates, not measured device memory or frame rates.

This is a hit-pose prototype, not final animation approval. Wraith still needs defeat, idle-loop and cast artwork plus full-speed motion review. No production rollout occurs with this asset commit.

## Generation prompt

Create a HIT REACTION frame of the exact reference Neon Wraith 2D game sprite. Preserve same portrait canvas, full body height, camera, rendering, turquoise angular neon mask and bracketed tubes, two coral eyes, two purple skeletal arms with claws, striped torn purple cloth and floating ribbon-tail; no legs. It faces screen left. Recoil slightly toward screen RIGHT from a strike arriving on left: tip mask back slightly, turn shoulders away, raise near claw protectively across chest and fold far elbow close. Keep silhouette compact and same scale as reference, tail hanging down to same low baseline, no extended horizontal cloth. Keep head and every claw and ribbon tip inside canvas with transparent padding. Painterly inked Neo Miami game art, transparent background. No impact flash, particles, haze, ground, shadow, text or additional objects. This must read as the SAME monster briefly flinching, not a new design.

# Roomy portrait hero scale

The optimized solo-fight screenshot exposed an undersized player: the ordinary layout allocated only 22% of portrait width to the hero, versus the larger hero lane in three-enemy battles. Roomy portrait stages (width below 600, height at least 300) with one or two enemies now allocate 34% width capped at 150px, with an art-height cap of 240px. Enemy cells start after that larger hero allocation, preserving nonoverlap. Short portrait, three-enemy depth lanes, landscape and desktop retain prior sizing.

At 390px width the hero envelope grows from 85.8px to 132.6px; the Neon idle's width-limited scale grows 54.5%. Aspect ratio, source artwork, foot anchors, card sizes and gameplay remain unchanged. Boss layouts share the revised hero allocation when the same portrait conditions apply.

Verified: 168 pure layout cases pass target size, projection and nonoverlap checks. The 588,240-sample alpha-aware artwork audit passes with no confirmed HUD/canvas findings, including boss layouts and clip motion. At 390×844, actual Pixi study views of solo Rat and Rat/Golem show the larger hero and separate monster/HUD regions; no warnings/errors. Evidence: `tests/.e2e-out/portrait-solo-hero-scale.png` and `tests/.e2e-out/portrait-two-hero-scale.png`.

This is a composition improvement, not a final roster scale lock or physical-device certification. Two-enemy monsters remain width-constrained on portrait and still require full art/design review. Local only.

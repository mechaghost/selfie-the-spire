# Rat idle blink prototype

Built-in image generation edited `art-source/battle/actors/alley-rat-idle-v1.png` into `art-source/battle/actors/alley-rat-blink-v1.png`. Runtime output is `public/assets/battle/actors/alley-rat-blink-v1.webp`. Both sources are 1536×1024 RGBA, alpha 0–254. Alpha≥128 bounds: idle (37,73)–(1461,965), blink (44,69)–(1462,966). Closed eyelids replace the cyan eyes; there is minor edge variation, so this is close registration rather than pixel-identical preservation.

The loop holds idle for 3500ms and blink for 100ms, repeating at 3600ms. Reduced motion stays static. All poses use their existing anchors, with [.5,.94] for blink. This remains a prototype pending final animation review.

Adding the frame exceeded five encounter inventories. Rat runtime textures now have a 672px cap, retaining any already-smaller tier and preserving original source art. Lossless WebP pixels are verified against the resized source. Across 550 encounter/hero/location combinations, max transfer inventory is 4,943,712 bytes and max estimated decoded RGBA is 48,088,928 bytes. All pass the existing limits; these are inventories rather than measured network/GPU performance.

Clip tests cover blink entry, exit, second cycle and reduced motion. TypeScript and texture metadata tests pass. The full-cycle bounds audit covers 725,724 samples with zero confirmed canvas/HUD conflicts. A 390×844 browser review with one Rat and ten cards shows closed eyes at 3550ms and reopened eyes at 3600ms, with no visible stance jump at this scale and no browser warnings/errors. Evidence: `tests/.e2e-out/rat-idle-blink.png`, `rat-idle-open.png`. Physical-device and full-speed animation review remain open. Local only.

## Final prompt

Use case: precise-object-edit. Make a localized idle blink frame of this exact Neo Miami Alley Rat game sprite. Change ONLY the two visible cyan eyes to closed dark eyelid slits, with no luminous eye showing. Preserve the exact stance, silhouette, camera, scale, canvas registration, fur, torn ears, whiskers, curled pink tail, four planted paws, turquoise harness and pouch, gold pendant, lighting and inked painterly rendering. Same 1536x1024 landscape canvas. Do not move or repaint any other body part. This frame alternates briefly with the source, so registration is essential. Truly transparent background; retain clean subject alpha, no haze, ground, backdrop, shadow, text, effects or extra objects. One full-body sprite, not a sheet.

# Street Runner idle blink prototype

Built-in image generation made a localized eye edit of `art-source/battle/actors/street-runner-idle-v1.png`. Saved source: `art-source/battle/actors/street-runner-blink-v1.png`; runtime: `public/assets/battle/actors/street-runner-blink-v1.webp`. Both sources are 1106×1422 RGBA with alpha 0–255. Alpha≥128 bounds: idle (147,13)–(928,1398), blink (145,10)–(928,1400). The stance is closely registered with minor edge variation, not identical outside the eye. Both use [.5,.99] foot anchors.

Idle holds 4200ms, blinks 100ms and repeats at 4300ms. Reduced motion is static. Rat, Golem, Spider and Street Runner now all have authored idle blink prototypes, alongside their attack sequences. This does not approve their full animation or close the finished-encounter gate.

The added frame exceeded encounter transfer limits at the old texture size. Street Runner's runtime pose set now uses a 640px maximum dimension, preserving source PNGs and lossless WebP pixels after resizing. Package: 89 assets, 153,848,413 source bytes to 24,151,656 runtime bytes. All 550 encounter/hero/location combinations pass: max 4,772,610 transfer inventory bytes and 46,493,696 estimated decoded RGBA bytes. These are file inventories rather than network/GPU measurements.

Clip tests cover blink entry, exit, second cycle and reduced-motion fallback. TypeScript and texture metadata checks pass. Bounds audit: 756,972 samples, zero confirmed canvas/HUD conflicts. Browser 390×844, one Spider and ten cards: compared 4250ms and 4300ms; no visible stance jump at this scale and no warnings/errors. Evidence: `tests/.e2e-out/runner-idle-blink.jpg`, `runner-idle-open.jpg`. Full-speed playback and physical-device quality review remain open. Local only.

## Final prompt

Use case: precise-object-edit. Localized idle blink for this exact Street Runner full-body game sprite. Close her visible eye with a natural eyelid while preserving her confident expression. Change only the eye/eyelid. Preserve exact canvas size, stance, silhouette, face identity, head angle, curled undercut hair, coral jacket, raised fists, turquoise gloves/pouch/belt, purple cargo trousers, shoes and planted feet. Preserve exact spatial registration and lighting; this frame alternates briefly with the original. Do not repaint, reposition, resize or redesign any other part. Maintain genuine transparent alpha, no backdrop, ground, haze, cast shadow, text or added objects. Single full-body sprite, no sheet.

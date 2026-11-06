# Neon Wraith idle blink

Added original generated `art-source/battle/actors/neon-wraith-blink-v1.png` and its lossless runtime WebP. Source1199×1312RGBA, alpha0–255, alpha≥128 bounds(18,0)–(1192,1311); idle bounds(19,0)–(1187,1309). The generated edit is not pixel-identical outside the eyes; slight contour/texture differences remain. At390×844, the frozen5150ms blink and5200ms open frame showed no obvious body jump at rendered scale. This is not final animation approval.

Timeline: idle5100ms, blink100ms,5200ms loop, foot anchor[.5,.99]. Reduced motion resolves to the original idle image. Teal tubes do not intentionally flash. Tests cover exact blink boundaries and repeat cycles. Wraith now has prototype idle, attack, hit, cast and defeat coverage; it requires no guard pose under its current executable effects. Its attack still uses idle/contact/idle, so authored anticipation/recovery and full-speed art polish remain.

Verification:815,292 transformed-alpha samples, no confirmed clipping/HUD conflicts.550 inventory combinations remain below5MB transfer and64MiB estimated decoded RGBA.94 assets package159,509,991→25,343,194bytes. Clip, scene-event, texture and TypeScript checks pass. No browser warnings/errors. Screenshots:`tests/.e2e-out/wraith-idle-blink.jpg` and `wraith-idle-open.jpg`. Motion inventory regenerated; zero actors marked approved. No live release in this change.

## Prompt

Precise minimal edit to this exact Neon Wraith game sprite for an idle blink frame. Change ONLY the two coral glowing eyes: close them into thin coral eyelid slits. Keep every other feature and its position unchanged: canvas dimensions, mask and neon tube geometry, constant teal brightness, both arms/claws, striped cloth, floating tail, foot baseline, silhouette, palette, camera, texture and lighting. Do not repose, redraw, shift, scale, crop, or add details. No neon flicker, no spark, no glow halo. Transparent background preserved. This frame must alternate with the reference for a very short blink with no visible body jump.

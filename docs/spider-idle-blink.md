# Spider authored idle blink prototype

Built-in image generation produced a localized eye edit of the Fire Escape Spider idle. Source: `art-source/battle/actors/fire-escape-spider-blink-v1.png`. Runtime: `public/assets/battle/actors/fire-escape-spider-blink-v1.webp`, lossless RGBA at the existing runtime tier.

Both reference and blink are1536×1024 with alpha0–254. Alpha≥128 bounds are(42,109)–(1489,953) for idle and(42,108)–(1489,953) for blink. The eyes close into thin amber slits; the legs, body and ground anchor remain registered. Same[.5,.94] foot anchor. This is close registration, not a claim that all non-eye pixels are identical.

Loop: idle4700ms, blink100ms, repeat at4800ms. Its cycle differs from Golem's4010ms cycle. Reduced motion uses static idle. The timeline is an authored idle prototype alongside existing procedural movement, not complete animation or art approval.

Checks:86assets packaged; clip tests verify boundaries, second cycle and reduced-motion fallback; TypeScript passes. Expanded bounds audit685,764samples, zero confirmed clipping/HUD conflicts.550production encounter/hero/location inventories remain below5MB and64MiB estimated decoded RGBA (max4,978,056bytes transfer inventory and48,760,160decoded bytes). Browser390×844, one Spider and ten-card hand:4750ms closed eyes and4800ms reopened eyes inspected, stance stable at this scale, no warnings/errors. Evidence:`tests/.e2e-out/spider-idle-blink.png`, `spider-idle-open.png`. Sampled frame checks are not a full-speed recording or physical-device certification. Production status stays review. Local only.

## Final prompt

Precise localized edit for a game sprite idle blink. Change ONLY the cluster of amber eyes on this exact mechanical Fire Escape Spider: close the eyes into narrow dark metallic eyelid slits with only a thin muted amber line remaining. Preserve the eye socket positions. Preserve the exact stance and silhouette, all eight legs and their tips, fangs, turquoise rusted rails, coral joints, ladder and ironwork, purple graffiti abdomen, camera, scale, lighting and transparent alpha. Do not repaint/repose/redesign the body or move any limb. Keep the same1536x1024 landscape canvas and exact spatial registration to this reference, since the edited frame alternates with the original for a brief blink. Same illustration, no added effects, ground, background, shadows, text or objects. Single full-body transparent sprite; only the eyelids change.

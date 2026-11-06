# Golem authored idle blink prototype

Built-in image generation made a localized eye edit of the existing idle source. Saved source: `art-source/battle/actors/vending-golem-blink-v1.png`; runtime: `public/assets/battle/actors/vending-golem-blink-v1.webp`. The amber eyes close to slits while the stance and vending-machine structure remain registered to the reference.

Source1240×1269 RGBA, alpha0–255; alpha≥128 bounds(42,92)–(1200,1189). Reference1239×1269 bounds(41,91)–(1199,1190). The one-source-pixel dimension/bounds differences are subpixel at runtime; this is close registration, not a claim of identical pixels outside the eyes. Anchor[.5,.94] matches idle. The frame streams independently of the existing atlas.

Authored idle loop: base idle3900ms, blink110ms, repeat at4010ms. Reduced motion uses static base idle. Attack/reaction/gameplay timing remains unchanged. This is a minimal authored idle prototype combined with existing procedural body movement, not final art/animation approval or proof that all other idle work is complete.

The dev pose scrubber now accepts up to60000ms so long idle cycles can be reviewed. The bounds auditor samples the full authored clip duration rather than only the old default duration, retaining20ms and boundary samples. It passes633,492samples with zero confirmed clipping/HUD conflicts. Clip tests verify3900/4010ms transitions, the second loop and reduced-motion fallback. Renderer streaming tests and TypeScript pass.85assets packaged; production encounter budgets remain within their previous limits (Golem remains a legacy/dev actor explicitly required by W4).

Browser390×844, one Golem and ten-card hand: frozen3950ms closed eyes and4010ms open eyes checked; no visible stance/ground jump at this size and no console warnings/errors. Evidence:`tests/.e2e-out/golem-idle-blink.png`, `golem-idle-open.png`. These are sampled-frame checks, not a high-frame-rate recording or device certification. Production status stays review. Local only.

## Final prompt

Precise localized edit for a two-frame sprite blink animation. Change ONLY the two glowing amber eyes inside the vending machine's lower dispensing slot: make both eyes closed, reduced to narrow slanted amber eyelid slits. Preserve every other pixel and absolutely the same pose, silhouette, framing, canvas dimensions, foot positions, arm positions, fingers, cracked glass, cans, surface chips, lighting and transparent alpha. Do not repaint or redesign the character; do not move the body or camera. Keep the eye socket dark and its metal dispensing lip unchanged. Full body of the same Vending Golem, identical transparent backdrop. This output will alternate briefly with the reference as an idle blink, so exact spatial registration is essential. No new elements, background, shadows, effects or text.

# Stray Voltage attack contact

Generated with the built-in image tool, using `art-source/battle/actors/stray-voltage-idle-v1.png` as identity/style reference. Accepted original: `art-source/battle/actors/stray-voltage-attack-v1.png`; runtime: `public/assets/battle/actors/stray-voltage-attack-v1.webp`.

Prompt: same mechanical street dog, rusty teal armor with lightning warning icons, coral antenna ears, amber lamp eyes, copper electrical ribs, bundled cables, four articulated clawed legs and curled plug tail. Painterly outlined game art, facing left in an aggressive low biting lunge with open jaws, head forward, one front paw reaching, other lower and rear paws braced. Preserve approximate 1536×1024 canvas/body scale and .96 baseline; keep all paws, ears and tail in frame. True transparency outside silhouette and gaps, no floor, broad aura, backdrop, UI or extra characters; compact orange electricity inside jaws/ribs only.

Output matches 1536×1024. Opaque bounds (37,127)–(1523,942) yield an attack foot anchor .92; idle remains .96. No additional scale correction. Attack contact is 80–239ms, includes the 140ms damage beat, and returns to idle by 320ms. This is a contact-pose review, not completed multi-frame animation.

During reference inspection, the preview appeared to contain broad background haze. Pixel inspection showed the sampled apparent backdrop had alpha zero (hidden RGB), and the runtime scene confirmed clean transparency. A background-extraction attempt was not adopted; the original idle remains unchanged. This distinction avoids treating RGB preview artifacts as runtime alpha defects.

Verified the 140ms contact and 320ms recovered idle in Pixi at 390×844, three monsters and ten cards: distinct low biting silhouette, clean street visibility around the dog, consistent ground line, no HUD/neighbor obstruction, no browser warning/error logs. Clip-boundary/reduced-motion tests pass. Screenshot: `tests/.e2e-out/stray-voltage-attack-mobile.png`. Physical-device and full battle animation approval remain outstanding.

# Dumpster Crawler pincer contact

Built-in image generation, with `art-source/battle/actors/dumpster-crawler-idle-v1.png` as reference. Accepted source `art-source/battle/actors/dumpster-crawler-attack-v1.png`; packaged runtime `public/assets/battle/actors/dumpster-crawler-attack-v1.webp`.

Prompt: preserve rusty teal dumpster body, dented coral lid, two orange eyes, huge red crab pincers, four chunky metal legs, rust and painterly outlines. Face left in a heavy forward-driving strike: torso tips forward, pincer thrust left and snapping shut, other claw braced lower, front legs bent/rear legs planted. Keep lid low, entire silhouette visible, same approximate body scale and 1536×1024 canvas, baseline near .96. True transparency including leg gaps, no floor/aura/backdrop/streaks/text/UI, no redesign or sprite sheet.

Actual output 1536×1024, opaque bounds (11,148)–(1524,932); contact foot anchor .91 aligns the changed stance. Idle remains .96. Existing heavy procedural attack motion combines with contact at 80–239ms; the 140ms impact beat is unchanged and idle returns at 320ms. Clip-boundary/reduced-motion tests pass.

Browser Pixi study at 390×844 with three enemies and ten cards: 140ms contact and 320ms idle inspected, ground alignment consistent, clean alpha, no neighboring-actor or HUD obstruction, no warning/error logs. Evidence `tests/.e2e-out/dumpster-crawler-attack-mobile.png`.

Scale concern remains: broad silhouettes are constrained by the narrow portrait slots and read smaller than tall monsters. This contact pose does not approve the lineup scale or finish the animation gate. The scale/layout pass must consider larger wide actors without covering targets, HUD, or the hand. Wind-up, recovery, reactions, physical-device and full battle checks remain outstanding.

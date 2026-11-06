# Neon Wraith casting pose

Added original generated `art-source/battle/actors/neon-wraith-cast-v1.png` and lossless runtime WebP, derived from the idle source using the built-in image tool. Source1199×1312RGBA, alpha0–255, alpha≥128 bounds(171,8)–(897,1304). The raised palm and cupped far claw distinguish curse casting from its slash. Foot anchor[.5,.99], no scale correction. Cast160ms then idle60ms, finite return to idle. No rules or queue delays changed.

The production scene event test uses the real manifest with controlled clock/GPU doubles: APPLY_STATUS on the Wraith selects cast,159ms retains cast,160ms begins recovery,220ms removes the cast entry. Existing source/recipient checks ensure the caster animates, not the recipient. The complete renderer-streaming suite passes.

Browser review at390×844 and320×568 with three enemies and ten cards, cast sampled80ms: preserved height, compact gesture, no control/HUD obstruction or console warnings/errors. Evidence:`tests/.e2e-out/wraith-cast-390.jpg` and `wraith-cast-320.jpg`. The 320px pose is small; physical-device comprehension remains unproven.

Validation:758,700 transformed-alpha samples, zero confirmed clipping/HUD conflicts.550 encounter/hero/location inventories remain below5MB transfer and64MiB estimated decoded RGBA (maxima4,772,610 and46,493,696bytes).93 assets package158,245,318→25,069,292bytes. Clip lifecycle, texture metadata and TypeScript pass. This is still a prototype; Wraith idle-loop artwork and final motion approval remain open. No live deployment in this change.

## Prompt

Edit target: exact reference Neon Wraith game sprite. Create a CASTING pose for its curse ability, different from a physical slash. Preserve portrait canvas dimensions, same full body scale, mask size, camera, lowest ribbon baseline. Preserve turquoise angular neon mask with two coral eyes, bracketed tubes, two purple skeletal arms, striped purple cloth and ribbon-tail, no legs. Keep upright, face screen-left, draw both elbows inward, raise forward hand to chest height with palm facing screen-left and fingers spread in a deliberate hex gesture; far claw cups below it close to torso. Tilt mask slightly toward that hand. Keep claws and cloth within the idle silhouette envelope, with tail hanging downward; no broad reach, no extra arms. Same painterly inked Neo Miami style and lighting. Transparent background. No spell ball, particles, lightning, symbols, detached effects, haze, floor, shadow, text or additional objects. Make gesture legible through silhouette alone; preserve character identity.

# Neon attack: anticipation, contact, recovery

Added original wind-up and recovery art around the existing punch contact. Both generated with the built-in image tool using `art-source/battle/actors/street-runner-attack-v1.png` as the identity/style reference. Archived originals are `street-runner-windup-v1.png` and `street-runner-recovery-v1.png` in the same directory. Standard packaging produces their runtime WebP derivatives.

Wind-up prompt: same heroine, face, coral jacket, purple cargo pants, teal bag/gloves/sneakers, haircut and painterly outlines; pull punching fist back toward shoulder, twist torso back left, bend knees and shift weight to rear leg, opposite fist guards chest, head faces right. Full body, soles at 97%, preserve reference scale and 1106×1422 canvas, transparent background, no effects, floor, UI or extra objects.

Recovery prompt: same identity and costume; retract the rightward punching arm halfway, fist in front of face and elbow bent roughly 90 degrees, other fist guards chest; torso slightly forward, front knee bent, rear heel lowering, almost ready for idle. Full body, soles at 97%, reference scale and canvas, transparent background, no effects, floor, text or UI.

Actual outputs are 1064×1478. Each uses scale 1422/1478 to match the reference canvas height and foot anchor [.5,.974] for the measured shoe baseline. Scaling is uniform. Named key-pose frames are separate from gameplay action types. Optional per-pose scale is validated as finite and positive; it applies only when that loose frame has loaded. Atlas frames retain their source-size framing, and missing frames/reduced motion retain the idle scale.

Timeline is wind-up 0–79ms, contact 80–239ms, recovery 240–319ms, idle at 320ms. The damage beat remains 140ms. No game timing or authoritative effect changes. Personalized cutouts still clear stock frames and timelines.

Verification: TypeScript, exact clip-boundary tests, invalid scale validation, renderer tests for loaded/unloaded named frames and reduced motion, existing atlas/streaming/disposal checks. In-browser 390×844 study with three enemies and ten cards: inspected 0, 140, 260 and 320ms. Body scale and shoe baseline remain consistent through the new frames; no warnings/errors. Evidence: `tests/.e2e-out/neon-windup-mobile.png` and `neon-recovery-mobile.png`.

This is a three-pose attack sequence under review, not a finished animation or full battle signoff. Additional inbetweens, idle motion, reaction/defeat sequences, other actors, physical-device and real battle playback remain release work.

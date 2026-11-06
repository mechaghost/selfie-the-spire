# Neon Hunger swipe contact

Generated with the built-in image tool using `art-source/battle/actors/neon-junkie-idle-v1.png` as identity reference. Original saved at `art-source/battle/actors/neon-junkie-attack-v1.png`; runtime derivative at `public/assets/battle/actors/neon-junkie-attack-v1.webp`.

Prompt: same Neo Miami Neon Hunger monster, purple chipped metal armor, corroded teal angular head, glowing coral tooth grille, orange neon tube ribs, dark bundled cable muscles, long hooked claws and digitigrade legs. Same painterly outlines and materials. Face left, lean forward with one long claw slashing left at chest height, other arm pulled back, head low and legs braced, both feet visible. Full body, transparent background, no floor/text/UI/extra characters, preserve approximate reference body scale and 1230×1278 canvas, baseline near 99%, entire claws and feet inside margins, no detached effects.

Actual generated canvas is 1123×1401, with opaque bounds (14,327)–(1103,1371). Foot anchor .979 aligns the shoe/claw baseline. The renderer retains the idle-derived source scale; the lower head is a deliberate crouch. Registered idle/attack/idle timing is 80/160/80ms, covering the 140ms damage beat and expiring by 320ms. This is contact artwork under review, not authored wind-up/recovery or animation approval.

Verification: exact clip/contact/reduced-motion tests pass. Browser Pixi study at 390×844 with three enemies and ten cards: contact at 140ms and recovered idle at 320ms inspected; no overlap with another actor or enemy HUD, feet retain their ground line, no warning/error logs. Screenshot `tests/.e2e-out/neon-hunger-attack-mobile.png`. Native-device, complete battle and remaining animation checks are outstanding.

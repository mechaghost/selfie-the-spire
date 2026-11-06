# Sewer Slime hit and defeat poses

Added `art-source/battle/actors/sewer-slime-hit-v1.png` and `sewer-slime-defeat-v1.png`, generated from the idle reference with the built-in image tool. The hit pose clenches its mouth, retracts its hands and compresses the gel. Defeat collapses into a low puddle with closed eyes, retaining its bolts and tile. Runtime WebP preserves lossless RGBA after resizing. Hit160ms/idle60ms; defeat280ms then held. Foot anchors[.5,.94] and[.5,.955]. No gameplay timing or rules changed.

The first hit output received a background-cleanup edit before selection. The image preview appeared to show haze; alpha sampling found transparent pixels in the apparent haze regions, and the actual street composite showed no rectangular backdrop. The rejected intermediate remains only in the image tool output folder.

Initial browser review:390×844 and320×568, three enemies and ten cards. Hit sampled80ms (390) and40ms (320), defeat40ms. Both poses fit the arena and clear HUD/control text. Defeated target is disabled and shows0/40/Defeated. No browser warnings/errors. Evidence in `tests/.e2e-out/slime-{hit,defeat}-{390,320}.jpg`. These are frozen-frame reviews, not physical-device or full-speed comprehension approval.

Initial packaging exceeded the5MB encounter art target in five inventories. Slime runtime poses now use a640px maximum dimension, preserving source PNGs unchanged. Final budget and rendered-detail checks recorded below. Cast, guard and authored idle-loop work remain; no actor approval or live rollout is claimed.

## Hit prompt

Create a HIT reaction frame of this exact Sewer Slime monster for original Neo Miami combat. Preserve landscape 1536x1024 framing, moss-green glossy gelatin body, exactly three amber slit eyes, purple mouth and irregular coral/ivory teeth, three rusted bolts embedded in same general areas and broken cream tile on right flank. Facing screen-left, same scale and planted puddle baseline at94percent canvas height. A blow from left dents the left cheek inward; upper mass recoils slightly right and squashes downward, eyes squeeze in pain, mouth clenches unevenly, arms retract close. No legs, no extra limbs. Keep entire silhouette within original occupied width with transparent margin; no detached droplets. Match inked painterly texture and warm/cool lighting. IMPORTANT remove all atmospheric halo from reference: actual completely transparent background, no haze, shadows, ground, glow, scene or text. One complete full-body pose.

## Cleanup prompt

Remove the entire background AND the entire yellow/teal atmospheric glow/halo surrounding this monster. Every pixel outside the monster's black inked outline must be fully transparent, including the broad colored haze around its head, sides and base. Preserve the monster itself exactly: green gel, clenched mouth, three eyes, curled hands, bolts, tile and dark outline. No floor shadow. Clean hard-edged game sprite cutout with only antialiasing at its immediate silhouette, no soft outside glow anywhere. Same canvas and subject scale/position. The result must composite cleanly onto arbitrary game backgrounds.

## Defeat prompt

Create a DEFEAT final pose of this exact Sewer Slime monster for original Neo Miami combat. Same landscape1536x1024 canvas, same scale and puddle baseline at94percent height. Preserve green glossy gel, exactly three amber eyes now shut, purple mouth now slack and almost closed with few coral teeth, three rusted bolts and broken cream tile. Slime has collapsed into a low sagging puddle, upper mass flattened to roughly half idle height, arms melted into the base, no legs. Occupy lower half of canvas, transparent space above. Keep original overall width and all gel inside canvas. Bolts and tile remain embedded in sagging body, not detached debris. Recognizable same monster, not a new pile of objects. Inked painterly style. Truly transparent background outside black silhouette; no glow haze, floor, shadow, particles, text or other characters. No blood/gore. One complete full-body collapsed pose.

## Final verification

The640px tier passes all550 inventory combinations: maximum4,969,588transfer bytes and47,720,448estimated decoded RGBA bytes, zero over5MB/64MiB.96 packaged assets total25,550,970runtime bytes. Repeated transformed-alpha audit815,940samples found zero confirmed clipping/HUD conflicts. Final browser review of hit at390×844 and defeat at320×568 preserved recognizable mouth/eyes and the low puddle silhouette without a rectangular background. No warnings/errors. Final evidence:`tests/.e2e-out/slime-hit-final-390.jpg` and `slime-defeat-final-320.jpg`. Clip recovery/held-defeat tests, texture metadata and TypeScript passed. Runtime size changes do not constitute full-device image-quality certification.

## Guard pose

The Slime raises both gel arms in front of its face for Block. The new clip holds the brace for 160 ms and returns to idle for 60 ms. The first generated candidate had stray alpha along three canvas edges. The replacement, generated from the attack reference, has alpha ≥128 bounds (236,143)–(1299,896) on a 1536 × 1024 canvas. The foot anchor follows the lower silhouette at .875. Slime runtime textures now use a 544 px cap to accommodate the additional pose within the encounter transfer limit. In-arena visual review of this texture tier remains open.

Prompt: Transparent isolated sprite, no background pixels or outer glow, completely empty alpha on all four edges, generous empty margin. This exact Sewer Slime but in a compact defensive pose with two blunt gel forearms drawn together up in front of the mouth, three visible amber eyes, planted puddle, three rusty bolts and broken cream tile, no legs. Same painted inked style and green/teal color, facing screen left. One complete monster centered on 1536x1024 canvas with clear empty margins. No atmosphere, light spill, shadow, surrounding haze or scenery. Only the monster inside its inked outline.

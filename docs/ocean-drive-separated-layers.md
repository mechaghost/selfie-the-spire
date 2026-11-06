# Ocean Drive separated background and ground

Status: review. Generated with the built-in image tool from `art-source/battle/locations/ocean-drive-v1.png`. The original flat plate is preserved. New sources are `art-source/battle/locations/ocean-drive-background-v2.png` and `art-source/battle/locations/ocean-drive-ground-v2.png`; corresponding WebP derivatives live under `public/assets/battle/locations/`.

## Background prompt

Use case: precise-object-edit. Edit reference into an independent BACKGROUND layer for a 2D Neo Miami combat scene. Keep original 1536x1024 canvas, architecture, palms, skyline, ocean, twilight sky and exact colors/composition in the upper half. Preserve the sidewalk and curb and a narrow dark strip of road down to y=540. Remove ALL of the nearer asphalt below y=560, leaving genuine alpha transparency there. Transition between y=540 and y=560 with a short soft alpha edge. Do not move, scale, crop or redesign buildings. No new objects, people, words, UI, checkerboard or colored replacement background. Deliver original-sized transparent PNG. This layer will sit behind a separate road layer.

## Ground prompt

Use case: precise-object-edit. Edit reference into an independent GROUND layer for a 2D Neo Miami combat scene. Keep original 1536x1024 canvas and the wet dark purple asphalt with subdued coral and mint reflected light in exactly its original position and perspective, from y=470 to the bottom edge. Remove ALL buildings, sky, palms, ocean and sidewalk above y=450 leaving genuine alpha transparency. Transition from transparent at y=450 to opaque road at y=480 with a short soft alpha edge. Maintain original road texture and lighting; continue only asphalt across the entire lower width with no objects, curb, poles, people, words or UI. Do not move, crop or rescale the road. Deliver original-sized transparent PNG. This will overlap the background road strip without an exposed seam.

## Integration and evidence

Both assets retain 1536×1024 source coordinates and the same aspect-preserving crop/horizon. Six CSS pixels of shared horizontal overscan prevent edge exposure during bounded background drift (1.5 pixels for Ocean Drive); the ground has zero drift even if a ground layer accidentally specifies sway. Existing palm foreground remains independent. Hidden/reduced-motion scenes stop movement. This is ambient horizontal parallax, not pointer-controlled camera movement.

The generated fade differs from the prompt's exact row boundaries, so actual alpha was checked: ground is transparent through row 440 and nearly opaque by row 500; background remains nearly opaque through row 500 and becomes transparent below row 600. Combined alpha at every pixel is at least 98.04%, with no empty seam. Generation introduces minor painted detail changes; these are reviewed derivatives, not pixel-identical extractions.

Browser study: 390×844 and 1280×800, three enemies and ten cards. No visible matte rectangle, curb gap or actor-foot displacement; browser warning/error log empty. Evidence: `tests/.e2e-out/ocean-separated-mobile.png` and `ocean-separated-desktop.png`. Automated checks: 84 sampled drift frames across six viewport sizes/two horizon presets, edge coverage, aspect ratio, stationary ground, reduced motion, alpha coverage, renderer streaming/lifecycle and TypeScript.

Other four districts still need separated background/ground assets. Physical devices, long-run performance and full location/enemy/boss matrices remain open. These assets and the arena are not deployed.

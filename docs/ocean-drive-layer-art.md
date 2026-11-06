# Ocean Drive foreground review

Generated with the built-in image generation tool, using `art-source/battle/locations/ocean-drive-v1.png` as a style reference. Source: `art-source/battle/locations/ocean-drive-foreground-v1.png`; runtime: `public/assets/battle/locations/ocean-drive-foreground-v1.webp`. Status: review, not final location approval.

## Prompt

Use case: stylized-concept. Asset type: independent transparent foreground layer for a professional Neo Miami 2D combat game. Reference image is STYLE AND PALETTE reference only, not a background to reproduce. Create a wide 1536x1024 transparent canvas containing only two sparse dark navy palm frond clusters entering from the extreme upper-left and upper-right corners. Fronds occupy at most the outermost 18 percent of width and top 22 percent of height. Entire center and lower 75 percent remain genuinely transparent, no ground, trunks, buildings, sky, haze, gradient, frame, text or characters. Angular painterly cel-shaded shapes with subtle dusty violet and mint rim-light, restrained highlights and crisp organic edges matching reference. These leaves form a near-camera layer, do not obscure combatants or HUD. Actual alpha transparency, not a checkerboard.

## Verification and remaining work

1536×1024 RGBA source, center alpha zero, lower region alpha at most 1/255. Runtime lossless derivative is 432,756 bytes. Renderer loads it independently above actors, with at most two CSS pixels of horizontal sway; reduced motion uses a stationary position. No gameplay RNG or target geometry changes. Wide screens compress the decorative canvas vertically to keep foliage near the upper edge; actor art remains aspect preserving.

Browser study checked at 390×844 and 844×390: palm corners leave actors and central combat space visible, no rectangular matte, no browser warnings/errors. Screenshots: tests/.e2e-out/ocean-layer-mobile.png and ocean-layer-landscape.png. Controlled renderer tests cover layer ordering, reduced-motion position, optional loading and lease disposal. This is the first independent foreground layer, not completion of five-location background/ground separation or the parallax and device matrix gates.

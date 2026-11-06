# Boombox Brute attack artwork

Generated with the built-in image generation tool from the existing idle reference. Original saved at `art-source/battle/actors/boombox-brute-attack-v1.png`; runtime lossless derivative at `public/assets/battle/actors/boombox-brute-attack-v1.webp`.

Full prompt:

Use case: precise-object-edit. Asset type: transparent 2D combat monster attack keypose for Neo Miami street card game. Edit the referenced Boombox Brute into a decisive LEFT-facing heavy straight punch contact pose: leftmost coral metal fist extends toward screen-left, torso twists left, rear arm bends back, knees brace, both sneakers visible. Preserve exact character identity: battered silver boombox torso, two large dark speaker cones, cassette-slot amber angry eyes, rectangular carry handle, turquoise shoulder/forearm armor with pink diagonal paint and white crown graffiti, coral segmented fists, chunky white/pink sneakers. Preserve illustrated ink outlines, painterly metal wear, amber left light and cyan right rim. Full body single character on genuine transparent background; no ground, scenery, card frame, text, motion blur, extra limbs or giant effects. Keep the torso readable rather than hiding it with the arm. Landscape framing with generous transparent padding around fists, handle, and feet. Feet share a baseline close to bottom, entire silhouette uncut. Match the reference's professional hand-painted 2D game art.

Source: 1536×1024 RGBA; alpha range 0–254; alpha >=128 bounds (8,14)–(1509,1006). Foot anchor [.5,.982]; per-pose scale 1378/1536 normalizes the wider attack canvas to the idle width. Character remains left-facing with visible sneakers, two speaker cones, cassette eyes, and matching turquoise/coral armor. Transparent padding preserved in packaged WebP.

Integrated the existing finite idle/contact/idle attack sequence (80/160/80ms). Browser review at 390×844 in the actual Pixi scene with three enemies and ten cards: contact at 140ms reads as a leftward punch, feet remain aligned, HUD clear, no warnings/errors. Evidence: `tests/.e2e-out/boombox-attack-mobile.png`. The additional 320×568 screenshot was captured during a viewport transition and is not accepted as verification.

Packaging verified all 74 derivatives; alpha-aware artwork bounds audit passed 522,880 samples; clip playback tests passed. Status stays review. This is a contact keypose, not finished animation or approval; authored wind-up/recovery, hit, defeat, and any mechanics-specific poses remain pending. Local only, not deployed.

## Narrow-screen follow-up

A fresh 320×568 load was verified separately. The stage and canvas measure 320×244 CSS pixels, document scroll width is 320, all three actors and HUDs are visible, and the Brute punch remains within its lower lane. Evidence: `tests/.e2e-out/boombox-attack-320.png`. Ten cards remain in the horizontal hand; two are initially visible.

The Billboard boss variant also fits above the hand with visible player, boss HP/intent, and End Turn. Evidence: `tests/.e2e-out/boss-billboard-320.png`. Resizing to 390×844 and back settles to matching 320×244 stage/canvas bounds without page overflow. No browser warnings/errors were captured. The earlier incomplete screenshot was not reproduced after settling, so no renderer fix was made on that evidence.

Added the measured 320×244 stage to the automated artwork audit: 588,240 samples, zero confirmed HUD/canvas findings. This is browser viewport verification of the art-study fixture, not physical-device testing or a replacement for actual CombatView gameplay checks. Short-screen actor art remains visibly smaller; this is not art-scale approval.


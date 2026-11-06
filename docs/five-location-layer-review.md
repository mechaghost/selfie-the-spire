# Five-location layered composition review

All five runtime location definitions now reference independent painted background and ground layers. Ocean Drive also has corner foliage. Status remains **review**, pending the full device, encounter/boss and performance gates. No production deployment.

## Composition guides and observed views

Every pair shares a 1536×1024 canvas, fixed source horizon .43, aspect-preserving crop and six CSS pixels of overscan. Three-enemy portrait layouts place the horizon at .32; other layouts use .5. The street remains stationary while distant scenery moves horizontally by at most 1 pixel (Ocean Drive 1.5). Reduced motion is stationary. No visual movement changes actor targets or gameplay RNG.

| Location | Desktop composition | Portrait crop and ground distinction | Encoded current layers | Decoded RGBA estimate |
|---|---|---|---:|---:|
| Ocean Drive | Hotels and palms left, ocean right; foreground corners | Central hotel frontage, open wet street; distant sidewalk above actors | 2,763,754 B | 18,874,368 B |
| Wynwood | Mural facade and shutters frame open pavement | Central shutters/plants; cracked pavement below curb, no pale join | 2,280,936 B | 12,582,912 B |
| Floodline Underpass | Pillars and lamps bracket water and quay | Canal remains behind a clearly visible curb; actors stand on dry concrete | 2,260,528 B | 12,582,912 B |
| Club Backlot | Speakers left, loading dock and stairs right | Railings and dock face stay above the dark open asphalt | 2,213,412 B | 12,582,912 B |
| Skyline Rooftop | Service structures at edges, city/ocean beyond parapet | Parapet and distant skyline retained; actors stand on marked roof concrete | 2,529,270 B | 12,582,912 B |

Memory figures are decoded texture estimates, not measured VRAM or browser memory. Only the current location's layers are leased; cold/warm transfer and long-session measurements remain required. Original flat plates remain archived and packaged for now; they are not referenced by the new scene definitions.

## Artwork provenance and corrections

Built-in image generation used each original location as its edit reference. Exact prompts and paths: district-layer-prompts.json, district-layer-corrections.json, district-layer-alpha-corrections.json, plus ocean-drive-separated-layers.md. Sources are under art-source/battle/locations; runtime derivatives under public/assets/battle/locations. Lossless derivative decoding is verified by the packaging script.

Wynwood and Backlot v2 ground art produced visible pale bands in browser composites. v3 removed those bands but introduced dark alpha contamination above the street. Both versions were rejected and moved to art-source/rejected-layers, outside runtime packaging. v4 passes transparency checks and visual review. Edits introduce minor painted-detail changes; these are not pixel-identical extractions.

## Verification

- Reviewed each new district in the browser study at 390×844 and 1280×800, three enemies and a ten-card hand. Ocean Drive has the same evidence in the preceding pass. No visible gaps, opaque rectangles, pale bands or displaced actors in accepted versions. Browser warning/error log empty after district cycling.
- Screenshots: tests/.e2e-out/{wynwood,underpass,club-backlot,rooftop}-separated-{mobile,desktop}.png; corresponding Ocean Drive screenshots recorded previously.
- location-layers.mjs reads the actual location manifest, requires independent ground/background and correct ordering, checks actual texture alpha, and tests 84 motion frames across six viewport sizes/two horizon presets. Minimum per-pixel combined alpha is 97.25–98.04%; join rows 480–529 exceed 99% for every location. Generated painted regions have slight alpha variation; no transparent gaps were found.
- Resource lifecycle/streaming, asset coverage, texture dimensions and TypeScript are checked separately. These do not establish physical-device performance, all boss silhouettes or complete encounter-matrix approval.

Remaining: all enemy counts/bosses across narrow portrait/short landscape, district-specific effects/art approval, actual device testing, ten-minute performance and 20-cycle resource measurements, then production rollout and live verification.

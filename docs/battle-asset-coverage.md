# Battle asset coverage ledger

## Current approval

The five stock heroes and 21 enemies in legal encounters passed local visual review at 320 × 568 and 1440 × 900. The approved baseline uses authored idle variations, attack contact, hit and defeat, plus hero celebration and guard or cast where mechanics require them. Street Runner, Alley Rat and Fire Escape Spider also have distinct anticipation and recovery poses. Other approved attacks combine contact art with the renderer's lunge. Payphone Phantom and Vending Golem are legacy fixtures outside the live encounter pool.

The [runtime motion inventory](battle-motion-inventory.md) tracks roster coverage and the [visual review record](upgrade-execution-log.md#stock-hero-art-review) names the Pixi capture sheets. This approval covers the authored key-pose baseline. Physical-device and live release verification are separate gates.

## Production art rules

- Keep the neutral warm upper-left key light, subtle teal rim and violet shadows across the lineup. Keep district color in the [location layers](five-location-layer-review.md) so outfits and enemy silhouettes read consistently across stages.
- Author heroes facing right and enemies facing left. The renderer uses the authored facing. Review any future mirrored use for asymmetric gear, marks and lighting.
- Preserve the full silhouette and transparent padding in every frame, including the furthest reach of attacks. Use per-pose anchors and scale to keep feet or the hover point stable. The renderer places a shared contact shadow at the slot's foot anchor. Keep floor shadows out of the source artwork.
- Check scale and reach in solo, two- and three-enemy layouts, plus solo boss slots. The [actor bounds audit](actor-bounds-review.md) checks the projected visible attack footprint and HUD clearance across stage sizes. The reviewed lineup sheets show stock heroes, regular enemies and bosses in their intended slots.
- Preserve source canvas, trim offsets and anchors when packing an atlas. The legacy Golem atlas provides the verified example at 2488 × 2546 source pixels and 1244 × 1273 runtime pixels, with two source pixels of edge extrusion per side. The approved roster uses loose WebP poses. Check the [encounter budget](encounter-art-budget.md) whenever adding artwork.

## Historical source inventory

The table and notes below record the original source inventory and early review milestones. Use the runtime motion inventory for current coverage and approval.

| Visual ID | Reachability | Fallback / dimensions | Provenance | Status |
|---|---|---|---|---|
| hero-neon | Starter/generated archetype | /assets/battle/actors/street-runner-idle-v1.webp / 1106×1422 | Built-in image generation; prompts recorded | Idle and attack key poses in review; motion pending |
| hero-chrome | Starter/generated archetype | /assets/battle/actors/chrome-idle-v1.webp / 1199×1312 | Built-in image generation; prompts recorded | Idle and attack key poses in review; reactions and full clips pending |
| hero-volt | Starter/generated archetype | /assets/battle/actors/volt-idle-v1.webp / 1186×1327 | Built-in image generation; prompts recorded | Idle and attack key poses in review; reactions and full clips pending |
| hero-concrete | Starter/generated archetype | /assets/battle/actors/concrete-idle-v1.webp / 1194×1317 | Built-in image generation; prompts recorded | Idle and attack key poses in review; reactions and full clips pending |
| hero-smoke | Starter/generated archetype | /assets/battle/actors/smoke-idle-v1.webp / 1199×1312 | Built-in image generation; prompts recorded | Idle and attack key poses in review; reactions and full clips pending |
| alley_rat | Production encounter pool | /assets/battle/actors/alley-rat-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle, attack, hit and defeat key poses in review; full clips and pivot review pending |
| neon_junkie | Production encounter pool | /assets/battle/actors/neon-junkie-idle-v1.webp / 1230×1278 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| graffiti_imp | Production encounter pool | /assets/battle/actors/graffiti-imp-idle-v1.webp / 1230×1278 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| stray_voltage | Production encounter pool | /assets/battle/actors/stray-voltage-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| dumpster_crawler | Production encounter pool | /assets/battle/actors/dumpster-crawler-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| smoke_specter | Production encounter pool | /assets/battle/actors/smoke-specter-idle-v1.webp / 1145×1374 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| taxi_ghost | Production encounter pool | /assets/battle/actors/taxi-ghost-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| manhole_mimic | Production encounter pool | /assets/battle/actors/manhole-mimic-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| boombox_brute | Production encounter pool | /assets/battle/actors/boombox-brute-idle-v1.webp / 1378×1142 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| neon_wraith | Production encounter pool | /assets/battle/actors/neon-wraith-idle-v1.webp / 1199×1312 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| payphone_phantom | Developer/legacy retained | /assets/battle/actors/payphone-phantom-idle-v1.webp / 1122×1402 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| sewer_slime | Production encounter pool | /assets/battle/actors/sewer-slime-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| fire_escape_spider | Production encounter pool | /assets/battle/actors/fire-escape-spider-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle, attack, hit and defeat key poses in review; full clips and pivot review pending |
| vending_golem | Developer/legacy retained | /assets/battle/actors/vending-golem-idle-v1.webp / 1239×1269 | Built-in image generation; prompts recorded | Idle, attack, hit and defeat key poses in review; full clips and pivot review pending |
| neon_sentinel | Production encounter pool | /assets/battle/actors/neon-sentinel-idle-v1.webp / 1199×1312 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| chrome_phantom | Production encounter pool | /assets/battle/actors/chrome-phantom-idle-v1.webp / 1024×1536 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| voltage_king | Production encounter pool | /assets/battle/actors/voltage-king-idle-v1.webp / 1330×1182 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| circuit_breaker | Production encounter pool | /assets/battle/actors/circuit-breaker-idle-v1.webp / 1222×1287 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| neon_yakuza | Production encounter pool | /assets/battle/actors/neon-yakuza-idle-v1.webp / 1217×1292 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| chrome_bouncer | Production encounter pool | /assets/battle/actors/chrome-bouncer-idle-v1.webp / 1222×1287 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| the_billboard | Production encounter pool | /assets/battle/actors/the-billboard-idle-v1.webp / 1312×1199 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| subway_wyrm | Production encounter pool | /assets/battle/actors/subway-wyrm-idle-v1.webp / 1536×1024 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |
| dj_phantom | Production encounter pool | /assets/battle/actors/dj-phantom-idle-v1.webp / 1210×1300 | Built-in image generation; prompts recorded | Idle cutout in review; motion pending |

Regenerate coverage checks with `node tests/renderer-assets.mjs`. Image dimensions describe fallback source pixels, not estimated GPU allocation or final production resolution. No existing opaque portrait has been mislabeled as approved combat artwork.

Runtime assets are size-limited derivatives encoded as lossless WebP; source dimensions in the table describe archived originals. Original generated PNGs are preserved under `art-source/battle/` with matching names. Historical generation prompt records name their original public destinations; those PNGs have since moved to the source archive. Rebuild with `python3 scripts/package_battle_art.py` (Pillow with WebP support). `battle-art-package.json` records encoded transfer bytes and decoded RGBA estimates separately.

Smoke Specter now has an identity-preserving attack contact cutout and the 80/160/80 ms idle/attack/idle timeline. It remains review status: no authored inbetweens, hit, defeat or cast poses approved. Original and attack canvases both 1145×1374; the runtime attack derivative is 573×687 at resolution 0.5 (288,000 encoded bytes).

Taxi Ghost now has an identity-preserving attack contact cutout and 80/160/80 ms idle/attack/idle timeline. The 1536×1024 original matches its idle canvas; runtime derivative is 768×512, 376,004 bytes. Review status remains: matching hit/defeat/buff artwork and authored inbetweens are unfinished. Taxi and Specter contact silhouettes were checked at 390×844, and Taxi recovery at 320 ms returns to idle.

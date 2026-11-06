# Battle asset coverage ledger

All five hero archetypes and all 23 monsters have generated idle cutouts in review. No registry entries use technical placeholders as their primary artwork; none has full animation approval. Original fallback vectors are authored in this repository. Implementation owner: Codex; art/design reviewer: pending. Required portfolio clips: idle, attack, hit, defeat; hero also celebrate; cast/guard when mechanics require them. Current clip coverage is zero; no final animation tier is approved.

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

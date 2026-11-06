# Runtime motion inventory

Generated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. This separates existing art from missing portfolio work; it does not grant art approval. Idle cutouts exist for all actors, but authored idle animation is still required. Attack timelines currently reuse idle/contact/idle rather than authored inbetweens.

| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |
|---|---|---|---|---|---|
| hero-neon | hero | attack, hit, guard, defeat, celebrate, cast | attack | none | review |
| hero-chrome | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-volt | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-concrete | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-smoke | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| alley_rat | production | attack, hit, defeat | attack | none | review |
| neon_junkie | production | none | none | attack, hit, defeat, cast | review |
| graffiti_imp | production | attack | attack | hit, defeat, cast | review |
| stray_voltage | production | none | none | attack, hit, defeat | review |
| dumpster_crawler | production | none | none | attack, hit, defeat, guard | review |
| smoke_specter | production | attack | attack | hit, defeat, guard, cast | review |
| taxi_ghost | production | attack | attack | hit, defeat, cast | review |
| manhole_mimic | production | none | none | attack, hit, defeat, guard, cast | review |
| boombox_brute | production | none | none | attack, hit, defeat, cast | review |
| neon_wraith | production | none | none | attack, hit, defeat, cast | review |
| payphone_phantom | legacy/dev | none | none | attack, hit, defeat, guard, cast | review |
| sewer_slime | production | none | none | attack, hit, defeat, guard, cast | review |
| fire_escape_spider | production | attack, hit, defeat, cast | attack | guard | review |
| vending_golem | legacy/dev | attack, hit, defeat, guard | attack | cast | review |
| neon_sentinel | production | none | none | attack, hit, defeat, guard, cast | review |
| chrome_phantom | production | none | none | attack, hit, defeat, guard, cast | review |
| voltage_king | production | none | none | attack, hit, defeat, guard, cast | review |
| circuit_breaker | production | none | none | attack, hit, defeat, guard, cast | review |
| neon_yakuza | production | none | none | attack, hit, defeat, cast | review |
| chrome_bouncer | production | none | none | attack, hit, defeat, guard, cast | review |
| the_billboard | production | none | none | attack, hit, defeat, guard, cast | review |
| subway_wyrm | production | none | none | attack, hit, defeat, guard, cast | review |
| dj_phantom | production | none | none | attack, hit, defeat, cast | review |

Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.

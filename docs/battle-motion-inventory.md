# Runtime motion inventory

Generated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. This separates existing art from missing portfolio work; it does not grant art approval. Idle cutouts exist for all actors. Golem and Spider have prototype authored blink loops; other actors still need authored idle sequences, and all idle animation needs final review. The Neon hero, Rat, Golem and Spider attacks have authored wind-up/contact/recovery poses. Other current attack timelines reuse idle/contact/idle; neither is a complete animation approval.

| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |
|---|---|---|---|---|---|
| hero-neon | hero | attack, hit, guard, defeat, celebrate, cast, windup, recovery | attack | none | review |
| hero-chrome | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-volt | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-concrete | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-smoke | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| alley_rat | production | attack, hit, defeat, windup, recovery | attack | none | review |
| neon_junkie | production | attack | attack | hit, defeat, cast | review |
| graffiti_imp | production | attack | attack | hit, defeat, cast | review |
| stray_voltage | production | attack | attack | hit, defeat | review |
| dumpster_crawler | production | attack | attack | hit, defeat, guard | review |
| smoke_specter | production | attack | attack | hit, defeat, guard, cast | review |
| taxi_ghost | production | attack | attack | hit, defeat, cast | review |
| manhole_mimic | production | attack | attack | hit, defeat, guard, cast | review |
| boombox_brute | production | attack | attack | hit, defeat, cast | review |
| neon_wraith | production | none | none | attack, hit, defeat, cast | review |
| payphone_phantom | legacy/dev | none | none | attack, hit, defeat, guard, cast | review |
| sewer_slime | production | none | none | attack, hit, defeat, guard, cast | review |
| fire_escape_spider | production | attack, hit, defeat, cast, guard, blink, windup, recovery | idle, attack | none | review |
| vending_golem | legacy/dev | attack, hit, defeat, guard, cast, blink, windup, recovery | idle, attack | none | review |
| neon_sentinel | production | none | none | attack, hit, defeat, guard, cast | review |
| chrome_phantom | production | none | none | attack, hit, defeat, guard, cast | review |
| voltage_king | production | none | none | attack, hit, defeat, guard, cast | review |
| circuit_breaker | production | none | none | attack, hit, defeat, guard, cast | review |
| neon_yakuza | production | none | none | attack, hit, defeat, cast | review |
| chrome_bouncer | production | none | none | attack, hit, defeat, guard, cast | review |
| the_billboard | production | attack | attack | hit, defeat, guard, cast | review |
| subway_wyrm | production | none | none | attack, hit, defeat, guard, cast | review |
| dj_phantom | production | none | none | attack, hit, defeat, cast | review |

Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.

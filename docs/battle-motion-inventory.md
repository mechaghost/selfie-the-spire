# Runtime motion inventory

Generated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. This separates existing art from missing portfolio work; it does not grant art approval. Idle cutouts exist for all actors. Rows with an idle timeline have an authored blink or light-dip loop. The remaining rows need an authored idle sequence. All idle animation needs final review. The Neon hero, Rat, Golem and Spider attacks have authored wind-up/contact/recovery poses. Other current attack timelines reuse idle/contact/idle; neither is a complete animation approval.

| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |
|---|---|---|---|---|---|
| hero-neon | hero | attack, hit, guard, defeat, celebrate, cast, blink, windup, recovery | idle, hit, guard, cast, defeat, celebrate, attack | none | review |
| hero-chrome | hero | attack, hit, guard, cast, defeat, celebrate | hit, guard, cast, defeat, celebrate, attack | none | review |
| hero-volt | hero | attack, hit, guard, cast, defeat, celebrate | hit, guard, cast, defeat, celebrate, attack | none | review |
| hero-concrete | hero | attack, hit, guard, cast, defeat, celebrate | hit, guard, cast, defeat, celebrate, attack | none | review |
| hero-smoke | hero | attack, hit, guard | hit, guard, attack | defeat, cast, celebrate | review |
| alley_rat | production | attack, hit, defeat, blink, windup, recovery | idle, hit, defeat, attack | none | review |
| neon_junkie | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | review |
| graffiti_imp | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | review |
| stray_voltage | production | attack, hit, defeat, blink | hit, defeat, idle, attack | none | review |
| dumpster_crawler | production | attack, hit, guard, defeat, blink | hit, guard, defeat, idle, attack | none | review |
| smoke_specter | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| taxi_ghost | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | review |
| manhole_mimic | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| boombox_brute | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | review |
| neon_wraith | production | attack, hit, defeat, cast, blink | hit, defeat, cast, idle, attack | none | review |
| payphone_phantom | legacy/dev | none | none | attack, hit, defeat, guard, cast | review |
| sewer_slime | production | attack, hit, defeat, guard, cast, blink | hit, defeat, guard, cast, idle, attack | none | review |
| fire_escape_spider | production | attack, hit, defeat, cast, guard, blink, windup, recovery | idle, hit, guard, cast, defeat, attack | none | review |
| vending_golem | legacy/dev | attack, hit, defeat, guard, cast, blink, windup, recovery | idle, hit, guard, cast, defeat, attack | none | review |
| neon_sentinel | production | attack, hit, guard, cast, defeat | hit, guard, cast, defeat, attack | none | review |
| chrome_phantom | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| voltage_king | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| circuit_breaker | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| neon_yakuza | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | review |
| chrome_bouncer | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| the_billboard | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| subway_wyrm | production | attack, hit, defeat, guard, cast, blink | attack, hit, defeat, guard, cast, idle | none | review |
| dj_phantom | production | attack, hit, defeat, cast, blink | attack, hit, defeat, cast, idle | none | review |

Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.

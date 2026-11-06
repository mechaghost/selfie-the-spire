# Runtime motion inventory

Generated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. This separates existing art from missing portfolio work; it does not grant art approval. Idle cutouts exist for all actors. Street Runner, Rat, Golem, Spider, Wraith, Slime, Billboard, Subway Wyrm and DJ Phantom have prototype authored blink loops; other actors still need authored idle sequences, and all idle animation needs final review. The Neon hero, Rat, Golem and Spider attacks have authored wind-up/contact/recovery poses. Other current attack timelines reuse idle/contact/idle; neither is a complete animation approval.

| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |
|---|---|---|---|---|---|
| hero-neon | hero | attack, hit, guard, defeat, celebrate, cast, blink, windup, recovery | idle, attack | none | review |
| hero-chrome | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-volt | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-concrete | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| hero-smoke | hero | attack | attack | hit, defeat, guard, cast, celebrate | review |
| alley_rat | production | attack, hit, defeat, blink, windup, recovery | idle, attack | none | review |
| neon_junkie | production | attack, hit, defeat | hit, defeat, attack | cast | review |
| graffiti_imp | production | attack, hit, defeat | hit, defeat, attack | cast | review |
| stray_voltage | production | attack, hit, defeat | hit, defeat, attack | none | review |
| dumpster_crawler | production | attack, hit, defeat | hit, defeat, attack | guard | review |
| smoke_specter | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| taxi_ghost | production | attack, hit, defeat | hit, defeat, attack | cast | review |
| manhole_mimic | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| boombox_brute | production | attack, hit, defeat | hit, defeat, attack | cast | review |
| neon_wraith | production | attack, hit, defeat, cast, blink | hit, defeat, cast, idle, attack | none | review |
| payphone_phantom | legacy/dev | none | none | attack, hit, defeat, guard, cast | review |
| sewer_slime | production | attack, hit, defeat, guard, cast, blink | hit, defeat, guard, cast, idle, attack | none | review |
| fire_escape_spider | production | attack, hit, defeat, cast, guard, blink, windup, recovery | idle, attack | none | review |
| vending_golem | legacy/dev | attack, hit, defeat, guard, cast, blink, windup, recovery | idle, attack | none | review |
| neon_sentinel | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| chrome_phantom | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| voltage_king | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| circuit_breaker | production | attack, hit, defeat | hit, defeat, attack | guard, cast | review |
| neon_yakuza | production | attack, hit, defeat | hit, defeat, attack | cast | review |
| chrome_bouncer | production | attack | attack | hit, defeat, guard, cast | review |
| the_billboard | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | review |
| subway_wyrm | production | attack, hit, defeat, guard, cast, blink | attack, hit, defeat, guard, cast, idle | none | review |
| dj_phantom | production | attack, hit, defeat, cast, blink | attack, hit, defeat, cast, idle | none | review |

Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.

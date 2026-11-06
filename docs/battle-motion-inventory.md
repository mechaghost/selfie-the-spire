# Runtime motion inventory

Generated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. The status column reflects the manifest review state. Idle timelines use an authored blink or light dip. Street Runner, Rat, Spider and the legacy Golem have separate attack wind-up, contact and recovery poses. Other attack timelines reuse idle around the contact pose. See the [art coverage ledger](battle-asset-coverage.md) for the visual review scope.

| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |
|---|---|---|---|---|---|
| hero-neon | hero | attack, hit, guard, defeat, celebrate, cast, blink, windup, recovery | idle, hit, guard, cast, defeat, celebrate, attack | none | approved |
| hero-chrome | hero | attack, hit, guard, cast, defeat, celebrate, blink | hit, guard, cast, defeat, celebrate, idle, attack | none | approved |
| hero-volt | hero | attack, hit, guard, cast, defeat, celebrate, blink | hit, guard, cast, defeat, celebrate, idle, attack | none | approved |
| hero-concrete | hero | attack, hit, guard, cast, defeat, celebrate, blink | hit, guard, cast, defeat, celebrate, idle, attack | none | approved |
| hero-smoke | hero | attack, hit, guard, cast, defeat, celebrate, blink | hit, guard, cast, defeat, celebrate, idle, attack | none | approved |
| alley_rat | production | attack, hit, defeat, blink, windup, recovery | idle, hit, defeat, attack | none | approved |
| neon_junkie | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | approved |
| graffiti_imp | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | approved |
| stray_voltage | production | attack, hit, defeat, blink | hit, defeat, idle, attack | none | approved |
| dumpster_crawler | production | attack, hit, guard, defeat, blink | hit, guard, defeat, idle, attack | none | approved |
| smoke_specter | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| taxi_ghost | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | approved |
| manhole_mimic | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| boombox_brute | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | approved |
| neon_wraith | production | attack, hit, defeat, cast, blink | hit, defeat, cast, idle, attack | none | approved |
| payphone_phantom | legacy/dev | none | none | attack, hit, defeat, guard, cast | review |
| sewer_slime | production | attack, hit, defeat, guard, cast, blink | hit, defeat, guard, cast, idle, attack | none | approved |
| fire_escape_spider | production | attack, hit, defeat, cast, guard, blink, windup, recovery | idle, hit, guard, cast, defeat, attack | none | approved |
| vending_golem | legacy/dev | attack, hit, defeat, guard, cast, blink, windup, recovery | idle, hit, guard, cast, defeat, attack | none | review |
| neon_sentinel | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, attack, idle | none | approved |
| chrome_phantom | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| voltage_king | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| circuit_breaker | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| neon_yakuza | production | attack, hit, cast, defeat, blink | hit, cast, defeat, idle, attack | none | approved |
| chrome_bouncer | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| the_billboard | production | attack, hit, guard, cast, defeat, blink | hit, guard, cast, defeat, idle, attack | none | approved |
| subway_wyrm | production | attack, hit, defeat, guard, cast, blink | attack, hit, defeat, guard, cast, idle | none | approved |
| dj_phantom | production | attack, hit, defeat, cast, blink | attack, hit, defeat, cast, idle | none | approved |

Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.

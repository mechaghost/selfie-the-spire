# Core encounter flow verification

Extended `tests/encounter-motion-parity.mjs` to include the W4 reference encounter: Alley Rat, Vending Golem, Fire Escape Spider. Production encounter pools are unchanged; this explicitly covers the legacy/development Golem used by the core art gate.

The real game store and action queue run complete battles using the initialized starter deck and normal card/End Turn commands. Controlled timers drain queue continuations; this is not wall-clock timing or browser rendering evidence. The test compares command-boundary player/enemy state, all card zones, deck, combat state, RNG, terminal flags and rewards across normal, reduced and off motion modes. Presentation subscriptions also count actual source/target status notices and effect impacts, and those counts must match across modes.

Core checks explicitly require the surviving Golem's first turn to grant10Block and2Spikes, exercise a victory reward path, and cover Spider casts, Spider Block, Burn ticks and Spikes retaliation across the three seeds. Victory claims add exactly one card and the offered gold, leave combat, and ignore a repeated claim. Card zones remain unique, queue resolution terminates, and no card is stranded in the resolving zone.

| Seed | Result in all3modes | Enemy turns | Commands | Spider casts | Spider Block | Burn ticks | Spikes hits |
|---|---|---:|---:|---:|---:|---:|---:|
| audit-a | victory |6|25|2|2|4|5|
| audit-b | victory |6|29|3|0|5|8|
| audit-c | victory |5|24|2|0|4|7|

The expanded suite passes207complete battles: all production encounters plus this core reference, each with3seeds and3motion modes. Generated results: `tests/.e2e-out/encounter-motion-parity.json`.

Scope limits: successful event delivery does not prove that a pose was drawn, that players understand it, or that motion is smooth on phones. Full battle/reward video, authored idle/polish, physical-device testing and final art approval remain open. This work improves the correctness evidence behind W4 and does not close its visual acceptance gate. Local only.

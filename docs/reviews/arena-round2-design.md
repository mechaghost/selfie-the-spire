# Arena review — round 2: game design and deckbuilder combat

Reviewed draft 2 and its binding Round 1 contracts on November 5, 2026. AI role-based review; no runtime implementation or human-expert certification is implied.

## Perspective 1: game designer

### Round 1 closure

- **D1 resolved in specification:** W1 now stresses 1/2/3-monster/boss geometry, maximum silhouettes, real HUD, long names, status overflow and ten cards at both limiting viewports. The compact arena/ordered strip fallback is explicit.
- **D2 resolved in specification:** W0 covers the reachable roster; beta versus portfolio coverage and error fallback are distinguished in the binding art-coverage section.
- **D3 resolved in specification:** Five-player formative tasks, repeated-error revision and limited interpretation of results are explicit.

### D7 — P2: Consolidate the contradictory production-quality sentence

The earlier W7 paragraph still permits static fallback art for less prominent production enemies, while the binding section says static fallback is error recovery and portfolio release requires an animation baseline. The binding section establishes precedence, so this is not a new architectural blocker, but the contradiction is easy for an implementer reading the work table to miss.

**Remedy:** Replace the old W7 paragraph with the release-tier policy and define the minimum intentional production tier explicitly (for example, every reachable actor has authored idle/attack/hit/defeat, with guard/cast only where effects require them). Record approved deviations rather than relying on the word “reviewed.”

**Acceptance:** Coverage validator has a clip requirement per actor/tier and no production actor is reported finished solely because a static fallback exists. One concise release table names controlled preview, full-run beta and portfolio release.

## Perspective 2: Slay the Spire-style deckbuilder specialist

### Round 1 closure

- **D4 resolved in specification:** Intent components derive from effects; current-preview limitations are explicit; executing intent persists until its existing queue boundary; expiry/modifier fixtures are named.
- **D5 resolved in specification:** The coordinator replaces old waits, owns timings, and has encounter-level pacing measurements plus no-animation parity.
- **D6 resolved in specification:** Rat/Golem/Spider is explicitly developer-only; an unchanged legal production encounter is separately required; screen position has no gameplay meaning.

### D8 — P2: Make preview uncertainty visible at the point of tactical decision

The binding contract accurately describes current-preview values, but only inspection explains that expiry can change them. A player familiar with intent-based deckbuilders may use an unqualified number to decide whether Block is sufficient. This can be confusing even while the renderer is mechanically faithful.

**Remedy:** The intent view model should provide a `previewKind`/accessible qualification, with a compact non-color-only indicator when the visible number is not an exact projected end-turn value. Put “Current damage preview” in its accessible label and the explanation in inspection. Do not add a new speculative prediction engine during this presentation migration.

**Acceptance:** In a fixture where Weak expires before the attack, a tester can discover that the displayed current value may change before committing End Turn; the resolving attack shows actual results, and the next intent appears only after calculation. Include this scenario in the formative threat-identification task.

## Verdict

**Conditionally suitable to start W0/W1.** All six Round 1 concerns are addressed at the planning level. D7 and D8 are wording/UI-contract refinements to close before the final implementation specification is frozen. No new P0/P1 design blocker was found in this pass. The proposed scene has not yet demonstrated mobile feasibility, animation quality, gameplay comprehension or full-run balance; those remain mandatory gates rather than approvals implied by this review.

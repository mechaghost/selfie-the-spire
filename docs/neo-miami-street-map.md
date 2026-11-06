# Neo Miami street-map redesign

User direction: the meta/world map should look like a Miami-inspired street map and have its own identity, rather than Slay the Spire's branching tower presentation. This supersedes older visual guidance in the map-generation skill; deterministic routing and encounter rules remain intact.

Replaced floating circular nodes and dashed diagonal connections with original vector cartography: coastal shoreline and Biscayne Bay, a causeway/island, city blocks, building footprints, pocket parks, named avenues and neighborhood signs. Routes follow right-angle street segments. Mint stop pins identify reachable destinations; amber identifies the current location. Rest uses a coffee-stop symbol. Mystery encounters are labeled Event, with explicit accessible Mystery event wording. The map uses stops and neighborhood names in its local copy.

The pure city projection maps the original four columns onto Palm, Collins, Neon and Bayfront avenues; no graph, encounter, save, RNG or progression data is changed. The map's geography is fictional/inspired, not an accurate Miami navigation map. Every stop has a unique accessible avenue/stop/district label. Targets are 54×58 CSS pixels; stop labels are 14px. Decorative map art is excluded from the accessibility tree. No continuous map animation is needed.

## Verification

- 100 seeds: 2,752 visible stops across six map widths and 3,425 orthogonal connections. Targets remain in bounds and nonoverlapping. Projection leaves original graph/encounters untouched and seeded regeneration identical.
- Browser at 320×568, 390×844, 844×390 and 1280×900. Corrected narrow header wrapping and automatic scrolling so current/next stops fit together when viewport height permits. Very short views prioritize reachable choices.
- Actual route selection: Palm Avenue fight → Rat encounter → two-card victory → skip card/collect 18 gold → street map. Reload preserved 72 HP, 117 gold, current Palm Avenue stop and two reachable events (Palm/Collins), with no recovery notice or browser warnings/errors.
- TypeScript, copy contracts and production build pass. No new raster transfer; production CSS shrank while vector/map markup adds a small JS increase.
- Evidence: tests/.e2e-out/city-map-320.png, city-map-desktop.png, city-map-current-mobile.png, city-map-current-320.png, city-map-landscape.png.

Implemented locally, not deployed. Physical touch/screen-reader testing and broader release gates remain separate work.

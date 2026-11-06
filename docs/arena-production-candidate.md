# Production arena candidate

`VITE_COMBAT_ARENA=1` is an explicit build-time flag for the new combat arena. With the flag unset or set to `0`, production retains the existing combat presentation. Development still supports `?arena`. Query parameters do not enable review fixtures or the arena in a flag-off production build. This is a public frontend build setting, not a secret or runtime server setting.

Local candidate commands:

```sh
npx tsc --noEmit
VITE_COMBAT_ARENA=1 npx vite build --outDir tests/.e2e-out/arena-production
npx vite preview --outDir tests/.e2e-out/arena-production --host 127.0.0.1 --port 5174 --strictPort
```

The separate output directory keeps the ordinary `dist` artifact untouched. For eventual release, the same flag must be supplied during the authorized hosting build. That release remains gated by art, device, accessibility, and other outstanding verification; adding this switch does not approve or deploy it.

## Actual optimized-build verification

At a 390×844 browser viewport on the local production preview, started a normal Street Runner run with no fixture/query parameter. Chose the reachable Palm Avenue fight, entering the legal solo Rat encounter. The Pixi renderer and full-body art loaded. Cheap Shot spent one energy, dealt seven damage (Rat 13→6 HP), and applied Weak 1; current intent changed from 3×2 to 2×2. Jab spent one energy and dealt six damage, ending the battle. Victory dialog received heading focus. Skipped card and collected 18 gold.

Map and reload preserved 80 HP, 117 gold, 12 cards, Palm Avenue current stop and reachable Collins Avenue event. No browser warning/error captured. Evidence: `tests/.e2e-out/production-arena-mobile.png` and `tests/.e2e-out/production-arena-map-reload.png`.

`node tests/arena-production-build.mjs` builds both flag states, verifies renderer/HUD inclusion only when enabled, and checks development fixture labels are absent from both optimized outputs. This checks the real bundler output rather than mirroring the flag condition in a unit test.

Scope: local browser production artifact, one legal battle, 390px viewport. Not the live deployment, physical device, complete nine-floor run, or full release certification. The test also exposed two target-control sets in targeting mode (arena overlay plus text list); the subsequent fix and keyboard verification are recorded in `target-control-modes.md`.

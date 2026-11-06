# Combat regression snapshot

Source revision: `ef71959`. All 32 executable `tests/*.mjs` scripts passed sequentially. `server-sharp.mjs` is an import helper, not a test, and was excluded. Per-script exit codes, elapsed times, log paths and SHA-256 hashes are recorded in `combat-regression-snapshot.json`. Logs remain in `tests/.e2e-out/regression/`.

The full `npm run build` passed, including TypeScript, the default production bundle, server dependency installation and deployment preparation. The separate arena-production-build test built both flag states and checked that development fixtures stay out of production. The default build keeps personalized combat disabled and skips model preparation; this does not prove Linux deployment with that feature enabled.

After the build reinstalled server dependencies, native deployment/startup, matting and HTTP tests were run again and passed. Installation reported blocked postinstall scripts for esbuild, fsevents and onnxruntime-node; the actual post-install local native/startup checks still passed. This observation applies to this host, not a clean Linux host.

## Evidence covered

- 207 complete battles across all production encounters plus the core composite, three seeds and normal/reduced/off motion: command state, card ownership, RNG and rewards agree.
- 60 continuous legal-route runs: 10 of 20 seeds finish the boss in every motion mode. This tests deterministic parity, not guaranteed wins or new balance.
- Ten runs with 175 real module reloads at stable transitions match uninterrupted play.
- Command guards, checkpoint recovery, target-controller behavior, intent/Block previews and copy contracts pass.
- Renderer mounting, asset ownership, streaming, late completions, missing textures and deadline handling pass their controlled tests.
- Actor/atlas/clip validation, location mapping/layer framing, street-map layout and runtime texture metadata pass.
- Personalized appearance persistence, generated-route fixtures, generation deadlines, native matting and server HTTP behavior pass. Five controlled matting fixtures retain over 99.9% of foreground, with IoU 0.980–0.993; these are authored art on controlled backgrounds, not real selfies.

## Gates still open

This snapshot establishes automated regression health, not release completion. The full roster still lacks required authored poses and final art approval. Core idle/attack sequences are prototypes; finished encounter/reward video and full-speed comprehension review remain open. Real selfie-provider identity/cost/failure verification and native Linux deployment validation are incomplete. The named static five-district composition capture set exists, but production UI states, physical iOS/Android/lower-power phones, screen-reader testing and the five-player formative study remain separate outstanding evidence. Final release deployment and live combat → rewards → street map → reload verification have not been performed for these local changes.

# Arena release and rollback

Do not use GitHub Actions for this project: do not create, enable, dispatch, or wait for Actions workflows, and do not make them a release gate. Run builds and regression tests locally, deploy through Railway, and verify the live domain. This is an explicit user requirement; only a later explicit user instruction can change it.

Production Railway watches the `release` branch. Record the current successful deployment and its commit immediately before each promotion.

## Prepare the candidate

- Run the art release check with `node scripts/report_battle_motion.mjs --check-release`. Confirm the exact candidate commit passes local regression (`npm run test:regression`), including the legal five-district route and both production build variants.
- Record first-turn findings using the [playtest protocol](first-turn-playtest.md). Track physical-device, performance, and spoken screen-reader evidence separately from synthetic sessions and browser emulation. Record which checks were performed and any gaps when a release is explicitly authorized with checks outstanding.
- Build the candidate with `VITE_COMBAT_ARENA=1 npm run build`. This setting is read when Vite builds the client. Confirm the serving process uses the resulting `dist`, the HTTP health endpoint returns 200, and development fixtures are absent.
- Prepare an artifact from the same commit with `VITE_COMBAT_ARENA=0 npm run build` as a renderer rollback. Store it separately from the arena artifact and record its build identity. Both artifacts use the same save schema.

## Promote and verify

If the Railway service needs `VITE_COMBAT_ARENA=1`, set it with deploys skipped so the flag and candidate go live in the same build. Fast-forward the watched branch to the commit that passed the local checks. Wait for Railway to report success for that commit, verify `/health`, and compare the live entry script's SHA-256 with the verified artifact.

Run `E2E_BASE=https://selfiethespire.com node tests/drag-live.cjs` to verify mouse/touch dragging, hand scrolling, invalid drops, cancellation and the phone rotation prompt. Then run `E2E_BASE=https://selfiethespire.com node tests/arena-smoke.cjs` against the live domain. The test covers browser-local selfie creation, a legal fight, reward selection and return to the map. It compares the complete saved checkpoint before and after reload, including HP, gold, deck and map position. Set `E2E_BROWSER=webkit` to repeat in WebKit.

## Roll back

For an arena rendering or interaction failure, serve the candidate's flag-off build on the same origin. It retains schema 2 and the saved RNG state. Use the recorded previous Railway deployment for a broader outage if the flag-off build is affected too. The older build reconstructs RNG from the seed, so it can change future outcomes when it resumes an upgraded save. Verify health and a browser save/reload after either rollback.

## Rehearsal evidence

At `ef0f320`, both flag variants ran through Hono on one local origin. A 320 × 568 Chromium touch session played a turn with the arena enabled, reloaded in the fallback build, played another turn, and reloaded back into the arena. The full checkpoint matched across both switches, the fallback turn advanced the saved RNG, and the browser reported no page errors.

The first live arena release was `4c58097475f4725a2aa9815a31000bc2e3913044`, Railway deployment `b1a1c1b4-8510-4078-ba1b-b58075ead5e2`. The live entry script matched the verified artifact. Chromium mobile smoke and a 390 × 844 WebKit touch run passed, including reward persistence. Five synthetic sessions informed the first-turn fixes. Physical-phone performance and spoken screen-reader behavior remained unverified. The prior larger-card and victory-layout deployment was `81c7871a-1362-4d71-80ae-7ad804dc18dc` at `f1bf503`.

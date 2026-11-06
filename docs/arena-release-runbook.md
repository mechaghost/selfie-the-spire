# Arena release and rollback

Production Railway watches the `release` branch. The larger-card and victory-layout release is `f1bf50350c6c313b5d747de647908ed4cba4ec02`, deployment `81c7871a-1362-4d71-80ae-7ad804dc18dc`. Record the actual active deployment immediately before promoting the arena.

## Prepare the candidate

- Run the art release check with `node scripts/report_battle_motion.mjs --check-release`. Confirm the exact candidate commit passes Combat regression, including the legal five-district route and both production build variants.
- Collect the physical-device, performance and first-time player evidence required by the [reviewed implementation plan](2d-combat-implementation.md). Attach device/browser versions and any follow-up fixes to the execution log.
- Build the candidate with `VITE_COMBAT_ARENA=1 npm run build`. This setting is read when Vite builds the client. Confirm the serving process uses the resulting `dist`, the HTTP health endpoint returns 200, and development fixtures are absent.
- Prepare an artifact from the same commit with `VITE_COMBAT_ARENA=0 npm run build` as a renderer rollback. Store it separately from the arena artifact and record its build identity. Both artifacts use the same save schema.

## Promote and verify

Set the arena flag for the Railway build and promote the exact verified candidate to the watched branch with a fast-forward push. Confirm Railway built the expected commit and the live asset matches its artifact. On the live domain, start a run on mobile, enter a legal fight, finish it, collect a reward, return to the map and refresh. Compare HP, gold, deck and current stop before and after refresh. Confirm browser-local selfie creation still works.

## Roll back

For an arena rendering or interaction failure, serve the candidate's flag-off build on the same origin. It retains schema 2 and the saved RNG state. Use the recorded previous Railway deployment for a broader outage if the flag-off build is affected too. The older build reconstructs RNG from the seed, so it can change future outcomes when it resumes an upgraded save. Verify health and a browser save/reload after either rollback.

## Rehearsal evidence

At `ef0f320`, built both flag variants and served them using the real Hono server on one local origin. A 320 × 568 Chromium touch session played a turn with the arena enabled, reloaded in the fallback build, played another turn, and reloaded back into the arena. The full saved checkpoint matched across both switches, the fallback turn advanced the saved RNG, and the browser reported no page errors. This rehearsed the same-revision renderer rollback locally. Railway promotion, physical-device verification and the participant study remain open.

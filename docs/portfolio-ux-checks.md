# Portfolio UX pass — November 5, 2026

## Scope and method

Source review plus a second UX reviewer, followed by local browser interaction and screenshots. All 13 screen fixtures were opened at 390×844. Targeted overflow and dialog checks followed at 320×568, with desktop presentation checks at 1440×900. These are browser viewport checks, not physical-device certification. Changes are local and have not been deployed.

The development-only `?review=1` harness exposes Landing, Capture, Waiting, Error, Reveal, Map, Combat, Rewards, Shop, Rest, Mystery, Victory and Defeat. It uses a separate `stt_review_run` save and local generated-hero fixtures; it does not send a photo to a provider. The harness is excluded from production builds. Collapse its toolbar before assessing bottom controls.

## Findings fixed and verified

| Screen | Change / evidence |
| --- | --- |
| Landing | Starter path and accurate artwork wording. Desktop visual check. |
| Capture | Named Back button; inactive-camera guidance; permission pending state; type/size/read/decode errors; same-file retry; service disclosure. Small viewport rendered with scrollable content. Real camera permission and upload failures remain manual checks. |
| Waiting / Error | Fixture rendering inspected. Generation cancellation and stale response covered by store regression tests; real provider timeout remains unverified. |
| Reveal | Removed delayed blank staging and legacy lightbox. Enter opens the shared inspector at 320px; Escape restores focus. |
| Map | Keyboard node controls and route presentation inspected. Fixtures do not simulate a complete run. |
| Combat | Desktop three-enemy scene and hand inspected; mobile turn label moved away from location label. Existing input/duplicate-action tests pass. |
| Rewards | Keyboard inspection then Add to deck returned to map: deck 12→13 and gold 99→124. Duplicate claim regression passes. |
| Shop | Enter opens card inspection. Purchase changed gold 99→43. Unaffordable card remained inspectable with disabled “Need 47 more gold”; Escape restored focus. Removal picker now uses native dialog and keyboard choices; final removal flow not exercised this pass. |
| Rest | Heal advertises actual missing HP (8), result remains visible and survives reload. Upgrade dialog showed Jab 6→9 damage before confirmation, then “Jab upgraded” with Continue. |
| Mystery | Unresolved event and completed outcome both survived reload. Full-health heal resolves with text; repeated choice and unaffordable choice rejected by regression tests. Old missing-event saves have a recovery action. |
| Victory | At 320×568, stats and both actions visible. Scroll enabled for shorter content area; replay labels accurately identify starter hero. |
| Defeat | Corrected viewport box sizing, scrolling, starter labels, added Back to home. Short-viewport presentation inspected before final Home addition. |

## Reproduction

```sh
npm run dev
# Open http://localhost:5173/?review=1
node tests/action-guards.mjs
npx tsc --noEmit
npx vite build
git diff --check
```

Automated checks cover combat action boundaries, missing/dead targets, duplicate actions, stale generation responses, reward idempotency, capped healing, one rest action, upgrade idempotency, full-health event resolution, and event affordability. No live model calls are needed.

Evidence: `tests/.e2e-out/portfolio-combat-desktop.png` plus the earlier mobile card and inspection screenshots. Generated screenshots are intentionally gitignored.

## Before sharing the live link with an employer

- Deploy the reviewed build, then smoke-test the actual custom domain.
- Run one real generation with a deliberately chosen test image; verify permission denial, retry, and server failure paths.
- Complete a starter run on physical iOS Safari and Android Chrome, including touch scrolling, targeting, background/return, and reload.
- Check keyboard-only traversal and 200% zoom end to end; this pass verifies key dialogs but is not a complete accessibility audit.
- Verify reduced-motion behavior and frame pacing on a lower-powered device. Viewport screenshots cannot establish motion performance.

These remaining checks are release validation, not claims that already passed.

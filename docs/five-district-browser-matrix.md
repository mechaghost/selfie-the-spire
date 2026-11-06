# Five-district browser composition matrix

Captured local revision `12f5a39` using the CUA in-app browser at `http://localhost:5173/?arena-study`. All 120 combinations have individual screenshots: five districts × one/two/three enemies/boss × 320×568, 390×844, 430×932, 844×390, 768×1024 and 1440×900. Capture directory: `tests/.e2e-out/district-matrix/`. Raw DOM measurements are in `measurements.json`; committed screenshot names and SHA-256 hashes are in `docs/district-capture-matrix.json`.

Ordinary layouts use Spider, then Golem, then Rat as count increases. Boss uses Billboard. Every view includes Street Runner and a ten-card hand. These are the development composition fixture and idle poses, not legal encounter interactions or a production HUD certification. Actual gameplay, long generated text, animation extremes, other heroes/monsters and device input need their separate evidence.

## Results

All captures had one canvas and a ready renderer. All target rectangles meet 44×44px, stay in the arena and do not overlap one another or the controls/hand. Hero/enemy HUD rectangles stay in the arena and do not overlap one another or the controls/hand. The hand stays within the viewport. Browser logs contain no warnings/errors. The verifier also decodes each screenshot to confirm its dimensions and records its hash. The browser returns JPEG bytes; filenames use `.jpg` accordingly.

Five contact sheets, one per district, were visually inspected. All five district identities render correctly across the matrix; no empty background, misplaced district, actor cropped by the viewport or hand obscuring the arena was observed. This review does not establish text contrast ratios or fine-detail readability from thumbnail sheets. Portrait scenes preserve depth placement; short landscape scenes retain the hand and action controls.

Open concerns: three-enemy 320px and short landscape actors remain small. Their silhouettes are distinguishable in these captures, but physical-phone comprehension remains unproven. The study's hero HUD lacks the production HUD backing and its status/name sizing differs from production; do not use this fixture as production contrast or typography evidence. Final production screenshots, active target/focus states, brightest/darkest motion frames, physical devices and the formative player study remain open. This matrix completes the named static composition capture set, not W5/W7 release acceptance in full.

## Recheck stored evidence

`node scripts/verify_district_captures.mjs tests/.e2e-out/district-matrix 12f5a39`

This validates stored captures; it does not launch a browser or claim to recapture the current build. A new build needs new CUA captures and its own recorded revision. Overview files are `ocean-drive-overview.jpg`, `wynwood-overview.jpg`, `underpass-overview.jpg`, `club-backlot-overview.jpg`, and `rooftop-overview.jpg` in the capture directory.

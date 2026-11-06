# Encounter artwork transfer budget

`node scripts/report_encounter_art_budget.mjs --check` inventories unique URLs requested by successful BattleScene mounting for all five heroes × 22 legal encounters × five districts (550 combinations). It reads actual runtime file sizes and texture dimensions. It fails above 5,000,000 bytes total art transfer or 64 MiB estimated decoded RGBA for a combination. Required idle textures are reported separately from concurrently streamed poses and locations.

Before optimization, maximum art transfer was 7,285,844 bytes, with 78 combinations above 5 MB. Maximum required idle transfer was 1,154,150 bytes. Texture estimate peaked at 47,579,720 bytes (45.4 MiB).

The packaging pipeline now uses WebP quality 95 for location layers. Their alpha must match exactly, and composited PSNR must be at least 35dB against both dark and white backing. Actors remain lossless, verified byte-for-byte against resized RGBA; higher encoder effort also slightly changes their compressed file sizes. Original PNG sources remain unchanged. Neither runtime dimensions, anchors, crop, nor motion changed.

After optimization, maximum art transfer is 4,978,056 bytes (31.7% lower); no combination exceeds 5 MB. Required idle transfer peaks at 1,151,620 bytes. Decoded RGBA estimate is unchanged. All packaged art, including legacy files not requested together, fell from 37,439,766 to 21,098,960 bytes.

Verification: 76 packaged files passed exact actor RGBA or location alpha/quality checks (lowest location PSNR 37.67dB). Texture dimension/cap tests pass. Location tests verify 84 drift samples without edge gaps. All five districts were visually checked in the 390×844 Pixi study with three enemies and ten cards; no browser warnings/errors. Representative screenshot: `tests/.e2e-out/compressed-ocean-mobile.png`. Full production build passes; review fixture labels are absent from production JS. The build still excludes the DEV-gated arena and has personalized combat disabled; this does not verify a production arena deployment.

These are file-transfer and decoded-size estimates, not measured network latency, VRAM, or device performance. They exclude application code, fonts, card images, transport overhead, failed-atlas recovery, personalized cutouts, framebuffers, mipmaps, and driver allocation. Worst-case headroom is small (~22 KB); additional poses may require further optimization. Browser/device cold-load profiling and the remaining release gates remain open. Local only.

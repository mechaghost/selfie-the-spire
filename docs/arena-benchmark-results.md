# Renderer benchmark — 2026-11-06 UTC

The corrected ten-minute harness completed 20 scene mount/disposal cycles over 600,331 ms, with 35,996 aggregate RAF samples including scene loading transitions. Browser: Chrome/156 on macOS as reported by user agent; viewport 390×844, DPR 1, arena 390×379.8 CSS pixels. This is desktop-browser evidence at a phone-sized viewport, not a physical-phone measurement.

| Measurement | Result |
|---|---:|
| p50 frame interval | 16.7 ms |
| p95 frame interval | 17.5 ms |
| p99 frame interval | 18.1 ms |
| Intervals above 50 ms | 2 |
| Maximum interval | 50.8 ms |
| Peak decoded texture estimate | 49,197,192 bytes / 46.9 MiB |
| Initial/final texture cache | 0 entries, 0 references, 0 pending |
| Disposals leaving retained entries | 0 of 20 |
| Visibility changes / resize / renderer failures | none |

Full report: arena-benchmark-2026-11-06.json. Procedure and scope: arena-benchmark-protocol.md. No GPU execution-time or browser-process-memory measurement was taken. Cache was not explicitly cleared; resource timings are repeated loads, not certified cold-cache results. Light documentation and source inspection occurred during the run; no application source edits occurred after start. These results meet the desktop sample's p95 ≤20 ms target but do not satisfy the real-device or complete authoritative-gameplay profiling gates.

The preceding one-minute verification sampled only loaded-scene frames (p95 17.4 ms) and proved cleanup; it is not directly comparable to the corrected aggregate. The final harness samples continuously across mounts to avoid concealing loading stalls.

# Arena benchmark protocol

Open the local development app with `?arena-benchmark=1`. Set the intended viewport before starting. The screen is excluded from production builds. Keep the page visible and do not resize or edit its source during measurement. The report marks visibility/resize changes invalid rather than hiding those intervals.

The one-minute verification and ten-minute benchmark each mount/dispose 20 real Pixi scenes, cycling all five locations four times. Every fifth scene uses the Billboard boss; others use Spider, Golem and Rat. Hero archetypes rotate. Attack/guard/hit presentations replay every 1.5 seconds; a fixed ten-card hand remains visible. This exercises the renderer and loading lifecycle, not complete authoritative gameplay, input latency, or all roster clips.

Aggregate RAF intervals include scene loading transitions. Per-cycle intervals begin after mandatory actor readiness. Report p50/p95/p99, intervals over 50ms and maximum; RAF intervals are not GPU execution time. `readyMs` is mandatory readiness, not all optional artwork completion. Resource timing records first and repeated traversal but does not clear browser cache, so first traversal must not be labeled a cold-cache result.

Texture diagnostics count each cached source once, regardless of lease count. `estimatedBytes` is pixel width × pixel height × four channels, not measured VRAM or browser-process memory. Every disposal must return entries/references to the initial zero baseline; pending loads remain visible in diagnostics and invalidate a zero-cleanup claim. Browser memory/GPU profiling and physical devices remain separate gates.

The JSON report is rendered directly in the page for export. Preserve it with browser version, viewport, DPR, run duration and visibility/resize validity. Record the device model independently when using real hardware. A mobile-size desktop viewport cannot establish iOS/Android performance.

An initial 60-second harness check recorded steady-scene intervals only; its aggregate excludes mounts and must not be compared directly with the corrected ten-minute aggregate. It verified 20 disposals with no retained leases and is saved as tests/.e2e-out/arena-benchmark-short.json. Long-run results are recorded separately after completion.

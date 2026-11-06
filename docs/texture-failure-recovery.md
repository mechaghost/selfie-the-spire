# Texture failure and independent pose streaming

The texture loader previously cleared its deadline when the image network load finished, before texture construction or asynchronous bitmap decoding. A constructor exception in the async handler could leave the outer asset promise unsettled; a stalled bitmap decoder had no remaining timeout. The deadline now covers the entire operation. Construction errors reject through the same settled path as network errors. A bitmap arriving after timeout is closed and never attached.

Mixed atlas/loose-pose actors also waited for the atlas before requesting frames absent from it. Those independent frames now begin immediately. Per-actor request tracking prevents atlas failure recovery from requesting them again; atlas-covered poses still use loose files only after atlas failure.

`tests/renderer-streaming.mjs` now injects texture construction failures on both packaged-source and generic-image paths; both reject and leave zero cache references/entries after release. A controlled stalled bitmap decode hits its deadline, releases its cache entry, then closes a deliberately late bitmap. Mixed-pose testing verifies wind-up loading while the atlas is pending and no duplicate wind-up request on atlas failure. Existing readiness, stable depth, missing-pose fallback, disposal and bitmap ownership checks continue to pass. TypeScript passes.

Tests use a controlled Pixi/Image implementation, not real GPU allocation or a physical device. They establish promise, request and resource-ownership behavior. Existing browser fallback/context-loss evidence remains separate. No gameplay timing, rules, layout or release flag changes. Local only.

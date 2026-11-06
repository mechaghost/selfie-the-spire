# Texture failure and independent pose streaming

The texture loader previously cleared its deadline when the image network load finished, before texture construction or asynchronous bitmap decoding. A constructor exception in the async handler could leave the outer asset promise unsettled; a stalled bitmap decoder had no remaining timeout. The deadline now covers the entire operation. Construction errors reject through the same settled path as network errors. A bitmap arriving after timeout is closed and never attached.

Mixed atlas/loose-pose actors also waited for the atlas before requesting frames absent from it. Those independent frames now begin immediately. Per-actor request tracking prevents atlas failure recovery from requesting them again; atlas-covered poses still use loose files only after atlas failure.

`tests/renderer-streaming.mjs` now injects texture construction failures on both packaged-source and generic-image paths; both reject and leave zero cache references/entries after release. A controlled stalled bitmap decode hits its deadline, releases its cache entry, then closes a deliberately late bitmap. Mixed-pose testing verifies wind-up loading while the atlas is pending and no duplicate wind-up request on atlas failure. Existing readiness, stable depth, missing-pose fallback, disposal and bitmap ownership checks continue to pass. TypeScript passes.

Tests use a controlled Pixi/Image implementation, not real GPU allocation or a physical device. They establish promise, request and resource-ownership behavior. Existing browser fallback/context-loss evidence remains separate. No gameplay timing, rules, layout or release flag changes. Local only.

## Stage startup deadline

`startStageMount` now owns the complete import/construction/mount attempt with a 15-second deadline. Expiration clears the active scene and exposes the existing simplified-graphics notice and retry button. Cancellation and expiration suppress late success or rejection; a module arriving after expiration never constructs a scene. A fresh retry receives its own lifecycle. Gameplay state remains outside this helper.

`tests/stage-mount-lifecycle.mjs` covers stalled imports, stalled mounts, cancellation before and during mount, import/constructor/mount failures, false mount results, successful retry, and exactly-once ownership disposal. `tests/renderer-streaming.mjs` additionally holds the actual BattleScene's controlled Pixi initialization past the stage deadline: late initialization destroys the application without attaching its canvas, subscribing listeners, or acquiring assets. Both tests and TypeScript pass. This verifies lifecycle behavior with controlled dependencies; it does not replace real-device GPU and browser recovery testing.

## Production smoke with a missing hero sprite

The arena smoke suite aborts the starter hero's idle texture request on a 320 × 568 touch viewport. It waits for the local silhouette, completes a turn in simplified graphics, then restores the image and uses **Retry graphics**. The test checks that the saved checkpoint is identical before and after the graphics retry. This covers a failed required image request on startup in addition to the separate WebGL loss cases.

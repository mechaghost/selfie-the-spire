# Browser selfie character

The current upgrade builds the player's 2D combat sprite locally. Canvas clips the center of the selfie into the visor of an illustrated Street Runner and renders the result as a 256 × 384 PNG with a transparent background around the sprite. The player previews the character before starting with the standard Street Runner deck.

The selfie flow has no model, paid API call or server upload. The game saves the cropped portrait and combat sprite in the local run. Existing saves with version 2 combat art still load. The former character generation endpoint returns HTTP 410 in the upgrade.

The visor is a fixed crop. Photo framing determines how the face appears, and the player can retake the selfie before starting.

## Verification

The 320 × 568 production-build browser regression uses a local photo fixture. It checks transparency in the preview, verifies the saved sprite survives reload, then forces WebGL context loss and confirms the combat fallback decodes the exact preview image. It records fetch, XHR and non-GET requests throughout the flow. The store integration test covers cancellation, duplicate submits and persistence. The HTTP test verifies that the retired endpoint returns 410. Physical camera testing on iPhone Safari and Android remains open.

## iPhone Simulator Safari photo picker

On iPhone 18 Pro Simulator with iOS 27.0, XCUITest selected the repository JPEG fixture using Safari's native Photo Library picker, confirmed with **Done**, and tapped **Use this photo**. The browser rendered the personalized preview and the same visor art in a legal first fight with End Turn enabled. Evidence: `tests/.e2e-out/ios-safari-selfie-{reveal,combat}.png` and `tests/.e2e-out/ios-safari-runner/photo-confirm.xcresult`.

The fixture places the subject off-center. The visor showed mostly scenery and part of the face, consistent with the fixed center crop. This run verifies native photo selection and rendering. Physical camera capture remains open.

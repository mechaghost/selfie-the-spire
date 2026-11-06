# Browser selfie character

The current upgrade builds the player's 2D combat sprite locally. Canvas clips the center of the selfie into the visor of an illustrated Street Runner and renders the result as a 256 × 384 PNG with a transparent background around the sprite. The player previews the character before starting with the standard Street Runner deck.

The selfie flow has no model, paid API call or server upload. The game saves the cropped portrait and combat sprite in the local run. Existing saves with version 2 combat art still load. The former character generation endpoint returns HTTP 410 in the upgrade.

The visor is a fixed crop. Photo framing determines how the face appears, and the player can retake the selfie before starting.

## Verification

The browser regression uses a local image fixture to exercise the selfie-to-reveal flow. The store integration test covers cancellation, duplicate submits and persistence. The HTTP test verifies that the retired endpoint returns 410. Physical camera testing on iPhone Safari and Android remains open.

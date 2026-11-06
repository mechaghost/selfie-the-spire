# Actual browser WebGL context loss

The development review menu now offers Lose graphics now and Lose graphics on next attack. Both use the browser's WEBGL_lose_context extension on the existing battle canvas; this is not a synthetic DOM event or forced-fallback flag. The latter subscribes once to a DAMAGE_ENTITY begin notice, then unsubscribes before triggering the loss. Unmount/new fixture also removes any armed subscription. The controls never dispatch game actions or change game state. The observed webglcontextlost event is reported separately from the request, so an unsupported context cannot be mistaken for a successful test.

Local desktop browser, 390×844 viewport, three-enemy actual CombatView:

- Resolution: armed loss, played Haymaker on Golem at 34 HP with 2 energy. The browser reported an actual loss and the scene entered simplified graphics. Golem ended at 26 HP with one status effect; energy became 0, Haymaker left the hand, and End Turn became enabled. Retry produced stage status ready with the same HP, energy and remaining cards; no encounter restart or repeated effect.
- Selection: fresh three-enemy fixture, Torch It selected with 3 energy. Immediate actual loss preserved the target UI and all enemy HP. Retry restored ready while preserving selection. Cancel reopened Torch It inspection with Play card focused, and closing inspection left 3 energy, all original HP and the card in hand.
- Both retries placed focus on the persistent Combat arena group. No browser warning/error logs were captured. Screenshot: `tests/.e2e-out/context-loss-target-recovery.png`.

TypeScript and production Vite build pass. The controls reside behind the existing DEV-only lazy review route and are absent from production output. This is a browser-context failure/recreation check, not physical GPU-driver failure, native phone memory-pressure testing, repeated long-duration loss/recovery stress, or victory/reward context-loss verification. Those remaining scopes are not marked complete.

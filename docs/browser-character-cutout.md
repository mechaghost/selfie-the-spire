# Browser character background removal

The user's November 5 decision supersedes server ONNX matting: use free browser processing with no background-removal AI model.

Gemini still generates the personalized full-body character (existing provider charges apply), now against a uniform bright green backdrop. The server preserves the complete image with lossless WebP and returns `combatArtwork`, not a falsely transparent combat appearance. The browser uses Canvas pixel color dominance to remove green, soften and decontaminate mixed edges, and remove enclosed green gaps. It normalizes the silhouette to a transparent 512 × 768 WebP with a stable foot baseline, then persists the existing version 2 combat appearance for preview and gameplay.

No model weights, ONNX dependency, removal API, server matting process or deployment model-download step remains. Ordinary generation, hosting and transfer costs still exist. The feature remains behind the existing disabled-by-default personalized-combat rollout flag.

Controlled artwork is required: no green clothing, green light, ground shadow or cropped limbs. The algorithm cannot reliably cut arbitrary photographs out of complex backgrounds. Invalid backgrounds, missing foreground, clipped silhouettes, encoding failures and cancellation do not silently substitute another character. Existing generation errors allow retry or use of the starter path.

Validation: deterministic pixel fixtures cover retained skin/teal, enclosed holes, partial alpha, framing and invalid output; mocked provider route tests cover response contracts, disabled rollout, errors, concurrency and cancellation. Type checking and the production build passed, including a clean server dependency install without ONNX. Real Gemini outputs, mobile-browser Canvas/WebP behavior, appearance quality and processing latency still require verification before rollout. Prior ONNX benchmarks and Linux gates are superseded, not evidence for this implementation.

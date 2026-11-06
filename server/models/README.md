# Superseded experiment — not used

The user rejected server-side ONNX removal on cost grounds. Runtime, preparation scripts and dependency have been removed. Current implementation uses browser Canvas green-screen removal; see `docs/browser-character-cutout.md`. The notes below are historical experiment evidence, not deployment instructions.

# Combat background removal

The user selected Gemini generation plus server-side background removal. U²-Net runs locally through pinned `onnxruntime-node` 1.31.1; this adds no image-processing provider or per-extraction API call.

Prepare model: `npm --prefix server run prepare:combat-model`. This downloads the 176 MB U²-Net ONNX model from the rembg release and checks SHA-256 `8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491` (upstream MD5 `60024c5c889badc19c04ad937298a77b` also verified during initial research). Model bytes are ignored by Git and must be downloaded during deployment build or supplied at `COMBAT_MATTING_MODEL_PATH`; never download them in a player request.

Sources: [U²-Net authors](https://github.com/xuebinqin/U-2-Net), [ONNX export and preprocessing reference](https://github.com/danielgatis/rembg/blob/main/rembg/sessions/u2net.py), [normalization reference](https://github.com/danielgatis/rembg/blob/main/rembg/sessions/base.py), [ONNX Node binding](https://onnxruntime.ai/docs/get-started/with-javascript/node.html). U²-Net's Apache-2.0 license is included as U2NET-LICENSE.txt. ONNX Runtime is MIT licensed (distributed in the dependency).

`ENABLE_PERSONALIZED_COMBAT=1` enables the generation route. Keep unset until extraction quality, real selfie generation, resource limits and production-host native runtime are verified. Model readiness is checked before any Gemini calls. Extraction is limited to one in-flight CPU inference per process; excess work fails instead of building an unbounded image queue. Model session stays warm. Pixels are processed in memory; no player photos or extracted artwork are written to server disk by this module.

## Deployment preparation and startup

The root `npm run build` installs locked server dependencies with `npm ci`, then runs `prepare:deployment`. With `ENABLE_PERSONALIZED_COMBAT=1` present **during the build**, preparation downloads and verifies the default model (or verifies an existing cached copy). Leave the flag unset for releases without personalized combat; their build skips the weights. Set the same flag at runtime only after the remaining quality and hosting checks pass.

If `COMBAT_MATTING_MODEL_PATH` is configured, preparation verifies that exact file and fails if it is missing or corrupt; it never silently downloads to a different path. Prefer an absolute path. A runtime-only mounted model must be provisioned separately with the pinned checksum; do not configure that mount's unavailable path during the build. Startup independently streams the file through SHA-256 verification and opens the CPU inference session before binding a listening socket or exposing `/health`. This also detects unsupported native runtime installations before deployment health can pass. No startup or request downloads occur.

Local verification: `node tests/combat-deployment.mjs` exercises build preparation with the feature disabled, a valid model, corrupt weights and a missing file. It launches actual server processes with disabled, corrupt, missing and valid model configurations and checks readiness precedes listening. Tests use an ephemeral port and no Gemini credentials. This proves local packaging/startup behavior, not Linux hosting support, actual Gemini generation, production memory limits or release approval.

The full root production build passed, including a clean server install and disabled-feature preparation. After that install, deployment process tests and all five real ONNX controlled matting fixtures passed again (first extraction 1.25s including checksum/session load; warm 275–338ms). The local package policy reported blocked dependency install scripts, but the installed platform binaries passed these native runtime tests. This does not prove a different host's installation behavior. The install reports five dependency vulnerabilities (one low, two moderate, two high); dependency assessment remains a release concern.

Current evidence: a known transparent hero flattened onto light gray was extracted with mask IoU 0.984, ~0.9 s locally, and normalized to an 86 KB data URL. This is one controlled fixture, not a hosting benchmark or general quality guarantee. Visual inspection shows a pale fringe around some edges. Edge refinement, varied hairstyles/outfits, real Gemini studio output, resource telemetry and failure/retry UX remain required before enabling the flag. Matching pose generation is separate and remains unfinished.

## Studio-edge refinement

Dependency follow-up: the five vulnerabilities noted in the earlier build above were resolved in the subsequent [server dependency review](../../docs/server-dependency-review.md). Current server full and production-only audits report zero known vulnerabilities; native hosting validation remains outstanding.

After segmentation, a conservative flood from the image border reduces background-colored fringe only when all four corner colors agree within six channel levels. It preserves pixels the segmentation considers confident foreground and skips nonuniform backgrounds. It does not key all gray/white pixels globally. Five controlled hero fixtures now show IoU 0.9799–0.9928 and foreground retention 0.99917–0.99998; local extraction was 1.02 s cold and 0.27–0.35 s warm. These numbers measure only the fixtures on this machine.

Visual review still finds residual light edges and retained gray in enclosed negative spaces (notably Volt's arm/body gap). Confident but incorrect model foreground can survive this conservative refinement. Do not treat the improved scores as an alpha-matting quality signoff. Real generated studio images, antialiased color decontamination and enclosed-space extraction still need review and refinement.

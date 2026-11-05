# Battle artwork sources

Original generated PNGs are retained here outside Vite's public output. Their prompts and generation provenance are recorded in docs/battle-art-prompts.md, docs/battle-hero-prompts.md and docs/battle-location-prompts.md. Historical prompt records refer to the original public PNG destination; sources now live here.

Run `python3 scripts/package_battle_art.py` from the repository root with Pillow/WebP support to create lossless runtime WebP assets. The script verifies exact decoded RGBA equality and writes docs/battle-art-package.json. This packaging step does not resize or change artwork. Runtime manifests reference public/assets/battle/*.webp. Future artwork changes should start from these originals, then regenerate their runtime encodings.

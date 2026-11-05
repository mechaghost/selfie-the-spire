"""Lossless runtime encoding; does not resize, repaint, trim or alter source pixels.

Requires Pillow with WebP support. Originals live outside Vite's public directory.
Run from repository root: python3 scripts/package_battle_art.py
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
from PIL import Image, features

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path('art-source/battle'))
parser.add_argument('--output', type=Path, default=Path('public/assets/battle'))
args = parser.parse_args()
if not features.check('webp'):
    raise RuntimeError('Pillow requires WebP support')
files = sorted(args.source.rglob('*.png'))
if not files:
    raise RuntimeError(f'No PNG source artwork in {args.source}')

def encode(source):
    relative = source.relative_to(args.source).with_suffix('.webp')
    output = args.output / relative
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        rgba = original.convert('RGBA')
        rgba.save(output, 'WEBP', lossless=True, exact=True, method=6)
        with Image.open(output) as decoded:
            if decoded.convert('RGBA').tobytes() != rgba.tobytes():
                raise RuntimeError(f'Lossless pixel verification failed: {source}')
        return dict(asset=str(relative), width=rgba.width, height=rgba.height,
                    sourceBytes=source.stat().st_size, runtimeBytes=output.stat().st_size,
                    decodedRGBABytes=rgba.width*rgba.height*4)

with ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(encode, files))
report = dict(encoding='WebP lossless, exact RGBA pixel verification',
              memoryNote='Decoded RGBA byte estimates; not measured GPU allocation or VRAM. No resizing.',
              sourceBytes=sum(row['sourceBytes'] for row in records),
              runtimeBytes=sum(row['runtimeBytes'] for row in records), assets=records)
Path('docs/battle-art-package.json').write_text(json.dumps(report, indent=2)+'\n')
print(f"Verified {len(records)} assets: {report['sourceBytes']:,} → {report['runtimeBytes']:,} bytes")

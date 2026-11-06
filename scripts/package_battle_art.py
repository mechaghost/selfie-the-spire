"""Build runtime texture tiers; archive originals and losslessly encode resized derivatives.

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
        limit = 1536 if relative.parts[0] == 'locations' else 768
        resolution = 1
        while max(rgba.size) * resolution > limit:
            resolution /= 2
        runtime_size = (int(-(-rgba.width * resolution // 1)), int(-(-rgba.height * resolution // 1)))
        runtime = rgba if resolution == 1 else rgba.resize(runtime_size, Image.Resampling.LANCZOS)
        runtime.save(output, 'WEBP', lossless=True, exact=True, method=6)
        with Image.open(output) as decoded:
            if decoded.convert('RGBA').tobytes() != runtime.tobytes():
                raise RuntimeError(f'Lossless pixel verification failed: {source}')
        return dict(asset=str(relative), width=rgba.width, height=rgba.height, runtimeWidth=runtime.width, runtimeHeight=runtime.height, resolution=resolution,
                    sourceBytes=source.stat().st_size, runtimeBytes=output.stat().st_size,
                    decodedRGBABytes=runtime.width*runtime.height*4)

with ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(encode, files))
report = dict(encoding='Lanczos power-of-two runtime tiers, then lossless WebP with exact derivative RGBA verification',
              memoryNote='Decoded runtime RGBA estimates, not measured GPU allocation. Full-resolution originals remain in art-source.',
              sourceBytes=sum(row['sourceBytes'] for row in records),
              runtimeBytes=sum(row['runtimeBytes'] for row in records), assets=records)
Path('docs/battle-art-package.json').write_text(json.dumps(report, indent=2)+'\n')
print(f"Verified {len(records)} assets: {report['sourceBytes']:,} → {report['runtimeBytes']:,} bytes")

metadata = {'/assets/battle/'+row['asset']: {key: row[key] for key in ['width','height','runtimeWidth','runtimeHeight','resolution']} for row in records}
Path('src/data/battleTextureSources.json').write_text(json.dumps(metadata,indent=2)+'\n')

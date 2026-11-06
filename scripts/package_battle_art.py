"""Build runtime texture tiers; preserve originals, lossless actors and quality-95 locations.

Requires Pillow with WebP support. Originals live outside Vite's public directory.
Run from repository root: python3 scripts/package_battle_art.py
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, features

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
        # Spider poses share a 1536px canvas but render in ordinary-enemy slots.
        # A 704px tier retains high-DPR detail without paying for 768px per pose.
        if relative.parts[0]=='actors' and relative.name.startswith('fire-escape-spider-'):
            resolution=min(1,704/max(rgba.size))
        # Rat's seven poses render in the same ordinary-enemy slots. Never
        # increase an existing smaller tier (the wider attack is already 444px).
        if relative.parts[0]=='actors' and relative.name.startswith('alley-rat-'):
            resolution=min(resolution,672/max(rgba.size))
        if relative.parts[0]=='actors' and relative.name.startswith('street-runner-'):
            resolution=min(resolution,640/max(rgba.size))
        runtime_size = (int(-(-rgba.width * resolution // 1)), int(-(-rgba.height * resolution // 1)))
        runtime = rgba if resolution == 1 else rgba.resize(runtime_size, Image.Resampling.LANCZOS)
        location = relative.parts[0] == 'locations'
        runtime.save(output, 'WEBP', lossless=not location, quality=95, exact=True, method=6)
        psnr = None
        with Image.open(output) as decoded:
            decoded = decoded.convert('RGBA')
            if location:
                if decoded.getchannel('A').tobytes() != runtime.getchannel('A').tobytes():
                    raise RuntimeError(f'Location alpha changed: {source}')
                scores = []
                for color in [(9,21,37,255),(255,255,255,255)]:
                    backing = Image.new('RGBA',runtime.size,color)
                    reference = Image.alpha_composite(backing,runtime).convert('RGB')
                    candidate = Image.alpha_composite(backing,decoded).convert('RGB')
                    rms = ImageStat.Stat(ImageChops.difference(reference,candidate)).rms
                    mse = sum(value*value for value in rms)/3
                    scores.append(10*math.log10(255**2/mse) if mse else 100)
                psnr = round(min(scores),2)
                if psnr < 35:
                    raise RuntimeError(f'Location compression quality below 35dB: {source}: {psnr}')
            elif decoded.tobytes() != runtime.tobytes():
                raise RuntimeError(f'Lossless pixel verification failed: {source}')
        return dict(asset=str(relative), width=rgba.width, height=rgba.height, runtimeWidth=runtime.width, runtimeHeight=runtime.height, resolution=resolution,
                    encoding='WebP quality 95, exact alpha' if location else 'lossless WebP', compositedPSNR=psnr,
                    sourceBytes=source.stat().st_size, runtimeBytes=output.stat().st_size,
                    decodedRGBABytes=runtime.width*runtime.height*4)

with ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(encode, files))
report = dict(encoding='Lanczos runtime tiers (power-of-two default, 704px Spider, 672px Rat cap, 640px Street Runner cap); actors lossless RGBA, locations WebP quality 95 with exact alpha and >=35dB composited PSNR on dark/white backing',
              memoryNote='Decoded runtime RGBA estimates, not measured GPU allocation. Full-resolution originals remain in art-source.',
              sourceBytes=sum(row['sourceBytes'] for row in records),
              runtimeBytes=sum(row['runtimeBytes'] for row in records), assets=records)
Path('docs/battle-art-package.json').write_text(json.dumps(report, indent=2)+'\n')
print(f"Verified {len(records)} assets: {report['sourceBytes']:,} → {report['runtimeBytes']:,} bytes")

metadata = {'/assets/battle/'+row['asset']: {key: row[key] for key in ['width','height','runtimeWidth','runtimeHeight','resolution']} for row in records}
Path('src/data/battleTextureSources.json').write_text(json.dumps(metadata,indent=2)+'\n')

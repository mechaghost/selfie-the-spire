import sharp from 'sharp';

const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_CHARACTERS = 512_000;
const WIDTH = 512;
const HEIGHT = 768;

/** Validate actual decoded alpha and normalize a generated idle actor to its foot anchor.
 * This does not remove backgrounds or establish likeness/full-body correctness.
 */
export async function prepareCombatCutout(input: Buffer): Promise<string> {
    if (!input.length || input.length > MAX_INPUT_BYTES) throw new Error('Combat artwork input size is invalid');
    const image = sharp(input, { limitInputPixels: 16_777_216, failOn: 'warning' });
    const metadata = await image.metadata();
    if (!['png', 'webp'].includes(metadata.format ?? '') || !metadata.hasAlpha ||
        (metadata.pages ?? 1) !== 1 || !metadata.width || !metadata.height ||
        metadata.width < 128 || metadata.height < 128 || metadata.width > 4096 || metadata.height > 4096) {
        throw new Error('Combat artwork must be a single transparent PNG or WebP');
    }
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparent = 0, solid = 0;
    let left = info.width, top = info.height, right = -1, bottom = -1;
    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            const alpha = data[(y * info.width + x) * info.channels + info.channels - 1];
            if (alpha <= 8) transparent++;
            if (alpha >= 240) solid++;
            if (alpha > 8) {
                left = Math.min(left, x); right = Math.max(right, x);
                top = Math.min(top, y); bottom = Math.max(bottom, y);
            }
        }
    }
    const pixels = info.width * info.height;
    if (transparent / pixels < .1 || solid / pixels < .03 || right < left || bottom < top) {
        throw new Error('Combat artwork needs a visible character and real transparent background');
    }
    // Preserve the whole visible silhouette, center it, and align its base to y=.99.
    const { data: actor, info: actorSize } = await sharp(input)
        .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
        .resize(480, 736, { fit: 'inside' }).png().toBuffer({ resolveWithObject: true });
    const canvas = sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: '#00000000' } })
        .composite([{ input: actor, left: Math.floor((WIDTH - actorSize.width) / 2), top: 760 - actorSize.height }]);
    for (const quality of [85, 70]) {
        const output = await canvas.clone().webp({ quality, alphaQuality: 100 }).toBuffer();
        const url = `data:image/webp;base64,${output.toString('base64')}`;
        if (url.length <= MAX_OUTPUT_CHARACTERS) return url;
    }
    throw new Error('Combat artwork exceeds the saved-character size limit');
}

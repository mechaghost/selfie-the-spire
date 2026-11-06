import { isPersonalizedCutout } from './battleVisualModels';

/** Fit the center of the player's square photo into a transparent street-runner sprite. */
export async function composeSelfieHero(source: string, signal: AbortSignal): Promise<string> {
    const photo = new Image();
    photo.src = source;
    await photo.decode();
    signal.throwIfAborted();

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable');
    ctx.lineJoin = 'round';

    const paint = (path: string, fill: string, outline = '#101024') => {
        const shape = new Path2D(path);
        ctx.fillStyle = fill;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 4;
        ctx.fill(shape);
        ctx.stroke(shape);
    };

    // Rear arm and leg, then the near leg and jacket in front.
    paint('M107 120 L78 127 55 173 37 178 31 196 49 209 77 195 104 164Z', '#50347a');
    paint('M132 216 L169 228 157 284 179 334 158 350 124 296 117 265Z', '#32274f');
    paint('M103 217 L141 229 113 288 91 337 64 333 73 272Z', '#51406f');
    paint('M153 338 L175 325 197 343 212 350 214 362 169 368 151 352Z', '#362747', '#936ac9');
    paint('M66 323 L92 328 104 349 127 355 128 367 65 376 55 362Z', '#251e3f', '#ed83df');
    paint('M95 117 L150 112 175 139 163 177 170 230 143 245 99 229 89 187 79 149Z', '#803d9c', '#39264f');
    paint('M124 123 L151 127 161 146 148 217 124 232 110 167Z', '#211c3e');
    paint('M83 140 L108 125 103 161 114 218 99 218 90 184Z', '#dc51ae');
    paint('M148 128 L172 130 186 153 210 142 224 148 229 165 216 178 183 190 163 175 145 151Z', '#ad4dbe');
    paint('M200 149 L215 140 230 144 236 155 231 168 213 174 205 166Z', '#292349', '#63ebf3');
    paint('M99 103 L122 120 151 111 172 121 147 142 105 142 91 124Z', '#de65c7');
    paint('M92 87 L92 57 Q96 19 130 16 Q164 13 178 40 L186 76 177 103 153 123 111 117Z', '#262248', '#7beef4');

    const crop = Math.min(photo.naturalWidth, photo.naturalHeight) * .72;
    ctx.save();
    ctx.beginPath();
    ctx.arc(138, 69, 39, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(photo, (photo.naturalWidth - crop) / 2, (photo.naturalHeight - crop) / 2,
        crop, crop, 99, 30, 78, 78);
    ctx.restore();

    paint('M91 60 L100 63 104 92 118 105 109 113 92 99 87 78Z', '#37254e', '#d273e3');
    paint('M160 103 L177 85 186 81 179 104 154 117 145 112Z', '#3a2959', '#65eaf5');
    const sprite = canvas.toDataURL('image/png');
    if (!isPersonalizedCutout(sprite)) throw new Error('Could not encode sprite');
    return sprite;
}

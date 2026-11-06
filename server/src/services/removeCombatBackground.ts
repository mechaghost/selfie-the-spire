import sharp from 'sharp';
import {refineStudioMatte} from './refineStudioMatte.js';
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';

async function loadVerifiedModel(path: string) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    if (hash.digest('hex') !== '8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491') {
        throw new Error('Combat matting model checksum mismatch');
    }
    return InferenceSession.create(path, { executionProviders: ['cpu'], intraOpNumThreads: 2, interOpNumThreads: 1 });
}

let session: Promise<InferenceSession> | undefined;
let busy = false;
export function ensureCombatMattingReady() {
    if (!session) {
        const path = process.env.COMBAT_MATTING_MODEL_PATH || fileURLToPath(new URL('../../models/u2net.onnx', import.meta.url));
        session = loadVerifiedModel(path)
            .catch(error => { session = undefined; throw error; });
    }
    return session;
}

/** CPU segmentation stays on the game server; no image goes to another provider. */
export async function removeCombatBackground(input: Buffer): Promise<Buffer> {
    if (busy) throw new Error('Combat artwork processing is busy. Please try again.');
    if (!input.length || input.length > 10 * 1024 * 1024) throw new Error('Invalid combat image size');
    busy = true;
    try {
        const source = sharp(input, { limitInputPixels: 16_777_216, failOn: 'warning' });
        const metadata = await source.metadata();
        if (!['png','jpeg','webp'].includes(metadata.format ?? '') || !metadata.width || !metadata.height ||
            metadata.width > 4096 || metadata.height > 4096 || (metadata.pages ?? 1) !== 1) throw new Error('Invalid combat image');
        const rgb = await source.clone().flatten({ background: '#fff' }).removeAlpha().toColourspace('srgb')
            .resize(320,320,{fit:'fill'}).raw().toBuffer();
        let max = 1;
        for (const value of rgb) max = Math.max(max,value);
        const values = new Float32Array(3*320*320);
        const mean = [.485,.456,.406], deviation = [.229,.224,.225];
        for(let i=0;i<320*320;i++)for(let c=0;c<3;c++)values[c*320*320+i]=(rgb[i*3+c]/max-mean[c])/deviation[c];
        const model = await ensureCombatMattingReady();
        const outputs = await model.run({[model.inputNames[0]]:new Tensor('float32',values,[1,3,320,320])});
        const prediction = outputs[model.outputNames[0]].data as Float32Array;
        if(prediction.length!==320*320)throw new Error('Invalid segmentation output');
        let low=Infinity, high=-Infinity;
        for(const value of prediction){if(!Number.isFinite(value))throw new Error('Invalid segmentation mask');low=Math.min(low,value);high=Math.max(high,value);}
        if(high-low<1e-6)throw new Error('No foreground found');
        const mask=Buffer.from(Uint8Array.from(prediction, value=>Math.round(255*Math.max(0,Math.min(1,(value-low)/(high-low))))));
        const alpha=await sharp(mask,{raw:{width:320,height:320,channels:1}}).resize(metadata.width,metadata.height,{fit:'fill'}).toColourspace('b-w').raw().toBuffer();
        const color=await source.removeAlpha().toColourspace('srgb').raw().toBuffer();
        refineStudioMatte(color,alpha,metadata.width,metadata.height);
        return sharp(color,{raw:{width:metadata.width,height:metadata.height,channels:3}})
            .joinChannel(alpha,{raw:{width:metadata.width,height:metadata.height,channels:1}}).png().toBuffer();
    } finally {busy=false;}
}

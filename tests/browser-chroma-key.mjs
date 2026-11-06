import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
await mkdir('node_modules/.cache',{recursive:true});
await build({stdin:{contents:"export * from './src/core/chromaKey'; export * from './src/core/browserCombatCutout';",resolveDir:process.cwd()},outfile:'node_modules/.cache/chroma.mjs',bundle:true,platform:'node',format:'esm'});
const {removeGreenScreen,prepareBrowserCombatCutout}=await import('../node_modules/.cache/chroma.mjs');
const make=()=>{const a=new Uint8ClampedArray(64*64*4);for(let i=0;i<a.length;i+=4)a.set([0,255,0,255],i);for(let y=10;y<54;y++)for(let x=20;x<44;x++)a.set([180,90,65,255],(y*64+x)*4);return a;};
let a=make();a.set([0,180,180,255],(30*64+25)*4);a.set([0,255,0,255],(31*64+25)*4);
assert.deepEqual(removeGreenScreen(a,64,64),{left:20,top:10,width:24,height:44});
assert.equal(a[3],0);assert.equal(a[(30*64+25)*4+3],255,'teal stays opaque');assert.equal(a[(31*64+25)*4+3],0,'enclosed green holes are removed');
assert.deepEqual([...a.slice((20*64+25)*4,(20*64+25)*4+4)],[180,90,65,255],'skin stays unchanged');
a=make();a.set([90,172,32,255],(20*64+20)*4);removeGreenScreen(a,64,64);assert.ok(a[(20*64+20)*4+3]>0 && a[(20*64+20)*4+3]<255,'blended edges get partial alpha');
a=make();a.set([180,90,65,255],(32*64)*4);assert.throws(()=>removeGreenScreen(a,64,64),/cut off/);
a=new Uint8ClampedArray(64*64*4).fill(255);assert.throws(()=>removeGreenScreen(a,64,64),/clean green/);
a=make();for(let i=0;i<a.length;i+=4)a.set([0,255,0,255],i);assert.throws(()=>removeGreenScreen(a,64,64),/separated/);
assert.throws(()=>removeGreenScreen(new Uint8ClampedArray(4),1,1),/dimensions/);
console.log('PASS browser color-key fixtures: bounds, skin, teal, enclosed holes, soft edges, clipping and invalid output');

// Simulate a browser whose Canvas returns PNG for an unsupported WebP request.
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh1sAAAAASUVORK5CYII=';
const pixels = new Uint8ClampedArray(128 * 128 * 4);
for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
        const inside = x >= 40 && x < 88 && y >= 20 && y < 108;
        pixels.set(inside ? [180,90,65,255] : [0,255,0,255], (y * 128 + x) * 4);
    }
}
let closed = false;
globalThis.createImageBitmap = async () => ({width:128,height:128,close(){closed=true;}});
const encodes = [];
globalThis.document = {createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({drawImage(){},getImageData:()=>({data:pixels}),putImageData(){}}),
    toDataURL(type) {
        encodes.push([type,this.width,this.height]);
        return this.width > 256 ? png + 'A'.repeat(512_000) : png;
    }
})};
assert.equal(await prepareBrowserCombatCutout(png),png);
assert.deepEqual(encodes,[['image/webp',512,768],['image/png',384,576],['image/png',256,384]]);
assert.equal(closed,true);
console.log('PASS: unsupported WebP encoding falls back to progressively smaller bounded PNG');

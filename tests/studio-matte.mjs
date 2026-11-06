import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['server/src/services/refineStudioMatte.ts'],outfile:'tests/.e2e-out/studio-matte.mjs',bundle:true,platform:'node',format:'esm'});
const {refineStudioMatte}=await import('./.e2e-out/studio-matte.mjs');
const width=12,height=12,rgb=Buffer.alloc(width*height*3,230),alpha=Buffer.alloc(width*height,120);
// Pale clothing matches the studio gray, but confident foreground must survive.
for(let y=3;y<9;y++)for(let x=3;x<9;x++)alpha[y*width+x]=255;
refineStudioMatte(rgb,alpha,width,height);
assert.equal(alpha[0],0);assert.equal(alpha[5*width+5],255);
assert.equal(alpha[3*width+3],255,'no erosion of confident pale clothing edge');
const irregular=Buffer.alloc(width*height*3,230);irregular[0]=0;
const unchanged=Buffer.alloc(width*height,120);
refineStudioMatte(irregular,unchanged,width,height);
assert.ok(unchanged.every(value=>value===120),'nonuniform background bypasses studio refinement');
const dark=Buffer.alloc(width*height*3,230),fine=Buffer.alloc(width*height,120);
for(let y=2;y<10;y++){const pixel=y*width+5;dark.fill(20,pixel*3,pixel*3+3);}
refineStudioMatte(dark,fine,width,height);
assert.equal(fine[5*width+5],120,'fine dark hair keeps its original alpha');
console.log('PASS: connected studio fringe cleared; confident pale clothing and dark fine detail retained; nonuniform corners bypass refinement');

import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('server/node_modules/.cache/combat-cutout',{recursive:true});
await build({entryPoints:['server/src/services/combatCutout.ts'],outfile:'server/node_modules/.cache/combat-cutout/processor.mjs',bundle:true,packages:'external',platform:'node',format:'esm'});
const {prepareCombatCutout}=await import('../server/node_modules/.cache/combat-cutout/processor.mjs');
const {default:sharp}=await import('../server/node_modules/sharp/lib/index.js');
const fixture=await sharp({create:{width:256,height:384,channels:4,background:'#00000000'}})
 .composite([{input:await sharp({create:{width:100,height:280,channels:4,background:'#00aacc'}}).png().toBuffer(),left:78,top:50}]).png().toBuffer();
const result=await prepareCombatCutout(fixture);
assert.match(result,/^data:image\/webp;base64,/);assert.ok(result.length<=512_000);
const bytes=Buffer.from(result.split(',')[1],'base64');
const metadata=await sharp(bytes).metadata();
assert.equal(metadata.width,512);assert.equal(metadata.height,768);assert.equal(metadata.hasAlpha,true);
const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let minX=512,maxX=-1,maxY=-1;
for(let y=0;y<768;y++)for(let x=0;x<512;x++)if(data[(y*512+x)*info.channels+3]>8){minX=Math.min(minX,x);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
assert.equal(maxY,759,'visible base ends at the .99 foot anchor');
assert.ok(Math.abs((minX+maxX)/2-255.5)<=1,'silhouette centered');
for(const background of ['#ffffff','#ffffff00']) {
 const invalid=await sharp({create:{width:256,height:384,channels:4,background}}).png().toBuffer();
 await assert.rejects(prepareCombatCutout(invalid),/visible character/);
}
await assert.rejects(prepareCombatCutout(Buffer.from('not an image')));
await assert.rejects(prepareCombatCutout(Buffer.alloc(10*1024*1024+1)),/size/);
const jpeg=await sharp(fixture).flatten({background:'#fff'}).jpeg().toBuffer();
await assert.rejects(prepareCombatCutout(jpeg),/transparent PNG or WebP/);
const tiny=await sharp(fixture).resize(64,64).png().toBuffer();
await assert.rejects(prepareCombatCutout(tiny),/transparent PNG or WebP/);
// Real generated art tests compatibility, not a selfie-generation or likeness claim.
const actual=await prepareCombatCutout(await readFile('art-source/battle/actors/street-runner-idle-v1.png'));
assert.ok(actual.length<=512_000);
console.log('PASS: actual alpha validation, transparent/opaque/corrupt/oversize rejection, centered silhouette, foot alignment and real-art bounded WebP packaging');

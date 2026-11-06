import assert from 'node:assert/strict';
import {build} from 'esbuild';
import sharp from '../server/node_modules/sharp/lib/index.js';
await build({entryPoints:['src/rendering/locationFraming.ts'],outfile:'tests/.e2e-out/location-layers.mjs',bundle:true,platform:'node',format:'esm'});
const {frameLocationLayer}=await import('./.e2e-out/location-layers.mjs');
for(const [width,height] of [[320,140],[320,300],[390,480],[844,160],[1280,400],[1440,500]]) {
 for(const horizon of [.32,.5]) {
  const stationary=frameLocationLayer(width,height,1536,1024,horizon,0,false,0);
  for(const time of [0,3000,6000,9000,18000,28000,38000]) {
   const moving=frameLocationLayer(width,height,1536,1024,horizon,time,false,3);
   assert.ok(moving.x<=0 && moving.x+moving.width>=width,'overscan covers both sides through drift');
   assert.ok(Math.abs(moving.width/moving.height-1.5)<1e-9,'preserves painted perspective');
   assert.equal(moving.y,stationary.y,'horizontal drift cannot move ground boundary');
   assert.deepEqual(frameLocationLayer(width,height,1536,1024,horizon,time,false,0),stationary,'ground stays still');
   assert.deepEqual(frameLocationLayer(width,height,1536,1024,horizon,time,true,3),stationary,'reduced motion stays still');
  }
 }
}
assert.throws(()=>frameLocationLayer(-1,100,1536,1024,.5,0,false));
const layers=await Promise.all(['background','ground'].map(name=>sharp(`public/assets/battle/locations/ocean-drive-${name}-v2.webp`).ensureAlpha().raw().toBuffer({resolveWithObject:true})));
for(const layer of layers)assert.deepEqual([layer.info.width,layer.info.height,layer.info.channels],[1536,1024,4]);
let minCoverage=1;
for(let i=3;i<layers[0].data.length;i+=4) {
 const background=layers[0].data[i]/255,ground=layers[1].data[i]/255;
 minCoverage=Math.min(minCoverage,1-(1-background)*(1-ground));
}
assert.ok(minCoverage>.97,`separated layers must cover the entire scene, including the overlap: ${minCoverage}`);
assert.equal(layers[0].data[(900*1536+768)*4+3],0,'background omits near road');
assert.equal(layers[1].data[(100*1536+768)*4+3],0,'ground omits scenery');
console.log(`PASS: 84 drifting frames cover edges with fixed ground/reduced motion; actual separated textures cover ${(minCoverage*100).toFixed(2)}% alpha or more at every pixel`);

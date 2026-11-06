import assert from 'node:assert/strict';
import {build} from 'esbuild';
import sharp from './server-sharp.mjs';
await build({stdin:{contents:"export * from './src/rendering/locationFraming';export {LOCATIONS} from './src/data/locations';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/location-layers.mjs',bundle:true,platform:'node',format:'esm'});
const {frameLocationLayer,LOCATIONS}=await import('./.e2e-out/location-layers.mjs');
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
assert.equal(LOCATIONS.length,5);
for(const location of LOCATIONS) {
const district=location.id;
const definitions=['background','ground'].map(plane=>{
 const matches=location.layers.filter(layer=>layer.plane===plane);
 assert.equal(matches.length,1,`${district} has one independent ${plane}`);
 return matches[0];
});
assert.notEqual(definitions[0].url,definitions[1].url,'independent artwork');
assert.ok(definitions[0].depth<definitions[1].depth,'ground composites over distant scenery');
assert.equal(definitions[1].sway??0,0,'stationary ground configuration');
const layers=await Promise.all(definitions.map(layer=>sharp(`public${layer.url}`).ensureAlpha().raw().toBuffer({resolveWithObject:true})));
for(const layer of layers)assert.deepEqual([layer.info.width,layer.info.height,layer.info.channels],[1536,1024,4]);
let minCoverage=1,minOverlap=1;
for(let i=3;i<layers[0].data.length;i+=4) {
 const background=layers[0].data[i]/255,ground=layers[1].data[i]/255;
 const coverage=1-(1-background)*(1-ground);
 minCoverage=Math.min(minCoverage,coverage);
 const row=Math.floor((i-3)/4/1536);
 if(row>=480 && row<530)minOverlap=Math.min(minOverlap,coverage);
}
// Generated painted regions have slight alpha variation. Test the join more
// strictly than isolated texture pixels rather than confusing either with a hole.
assert.ok(minCoverage>.97,`no transparent holes in the painted scene: ${minCoverage}`);
assert.ok(minOverlap>.99,`overlap must cover the join: ${minOverlap}`);
assert.equal(layers[0].data[(900*1536+768)*4+3],0,'background omits near road');
assert.equal(layers[1].data[(100*1536+768)*4+3],0,'ground omits scenery');
console.log(`PASS: ${district} minimum alpha ${(minCoverage*100).toFixed(2)}%, overlap ${(minOverlap*100).toFixed(2)}%`);
}
console.log('PASS: 84 drifting frames cover edges with fixed ground/reduced motion');

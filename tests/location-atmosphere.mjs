import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/rendering/locationAtmosphere.ts'],outfile:'tests/.e2e-out/location-atmosphere.mjs',bundle:true,platform:'node',format:'esm'});
const {locationAtmosphere}=await import('./.e2e-out/location-atmosphere.mjs');
const ids=['ocean-drive','wynwood','underpass','club-backlot','rooftop'];
const originalRandom=Math.random;
Math.random=()=>{throw Error('Atmosphere must not consume random state');};
try {
 for(const id of ids) for(const [width,height] of [[320,140],[390,480],[844,160],[1440,500]]) {
  assert.deepEqual(locationAtmosphere(id,width,height,0,true),[]);
  const first=locationAtmosphere(id,width,height,0,false);
  assert.deepEqual(first,locationAtmosphere(id,width,height,0,false),'repeatable sampling');
  assert.notDeepEqual(first,locationAtmosphere(id,width,height,5000,false),'district motion advances');
  for(const time of [0,1000,600000,86400000]) {
   const marks=locationAtmosphere(id,width,height,time,false);
   assert.ok(marks.length<=16,'bounded draw calls');
   for(const mark of marks) {
    assert.ok(Object.values(mark).every(Number.isFinite));
    assert.ok(mark.alpha>=0 && mark.alpha<=.2,'subtle enough to preserve actor contrast');
    assert.ok(mark.x>=-5 && mark.x<=width+5 && mark.y>=-3 && mark.y<=height+3,'bounded after long sessions');
   }
  }
 }
 assert.equal(new Set(ids.map(id=>JSON.stringify(locationAtmosphere(id,390,480,1000,false)))).size,5,'distinct district presets');
} finally {Math.random=originalRandom;}
console.log('PASS: five distinct bounded atmosphere presets, deterministic sampling, reduced motion and long-session bounds');

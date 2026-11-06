import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { access } from 'node:fs/promises';
await build({stdin:{contents:`export * from './src/rendering/AssetLeaseCache'; export * from './src/rendering/locationFraming'; export * from './src/core/battleVisualModels'; export * from './src/data/actorVisuals'; export * from './src/data/locations'; export { enemies } from './src/data/enemies'; export { ENCOUNTER_POOLS } from './src/data/encounters';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/renderer-assets.mjs',bundle:true,platform:'node',format:'esm'});
const {frameLocation,LOCATIONS,AssetLeaseCache,ACTOR_VISUALS,validateActorVisual,locationForFloor,enemies,ENCOUNTER_POOLS,resolveAppearance} = await import('./.e2e-out/renderer-assets.mjs');
let loads=0;const disposed=[];let resolveLoad;
const cache=new AssetLeaseCache(()=>{loads++;return new Promise(resolve=>resolveLoad=resolve);},value=>disposed.push(value));
const a=cache.acquire('shared'),b=cache.acquire('shared');await Promise.resolve();assert.equal(loads,1);
assert.deepEqual(cache.diagnostics(()=>64),{entries:1,references:2,pending:1,estimatedBytes:0},'pending shared resources have no decoded allocation estimate');
a.release();a.release();assert.equal(cache.stats().references,1);resolveLoad('texture');await b.ready;assert.deepEqual(disposed,[]);
assert.deepEqual(cache.diagnostics(()=>64),{entries:1,references:1,pending:0,estimatedBytes:64},'count one source, not one allocation per lease');
b.release();assert.deepEqual(disposed,['texture']);assert.deepEqual(cache.stats(),{entries:0,references:0});
assert.deepEqual(cache.diagnostics(()=>64),{entries:0,references:0,pending:0,estimatedBytes:0},'disposed resources leave no estimate behind');
const late=cache.acquire('late');late.release();await Promise.resolve();resolveLoad('late-texture');await late.ready;assert.equal(disposed.at(-1),'late-texture');assert.equal(cache.stats().entries,0);
let tries=0;const failures=new AssetLeaseCache(async()=>{if(++tries===1)throw Error('missing');return 'retry';},()=>{});
const bad=failures.acquire('missing');await assert.rejects(bad.ready);bad.release();const good=failures.acquire('missing');assert.equal(await good.ready,'retry');good.release();assert.equal(failures.stats().entries,0);
// StrictMode-style setup-cleanup-setup while the first load is still pending.
const first=cache.acquire('strict');first.release();const second=cache.acquire('strict');await Promise.resolve();resolveLoad('strict-texture');await second.ready;assert.notEqual(disposed.at(-1),'strict-texture');second.release();assert.equal(disposed.at(-1),'strict-texture');
for(let i=0;i<20;i++){const lease=cache.acquire('cycle');await Promise.resolve();resolveLoad(`cycle-${i}`);await lease.ready;lease.release();assert.equal(cache.stats().entries,0);}
for(const visual of Object.values(ACTOR_VISUALS)){validateActorVisual(visual);await access(`public${visual.fallbackImageUrl}`);for(const pose of Object.values(visual.keyPoses ?? {}))await access(`public${pose.imageUrl}`);}
for(const id of Object.keys(enemies)) assert.ok(ACTOR_VISUALS[id],`legacy/developer actor ${id} represented`);
for(const pool of Object.values(ENCOUNTER_POOLS))for(const encounter of pool)for(const id of encounter.enemyIds)assert.ok(ACTOR_VISUALS[id],`reachable actor ${id}`);
assert.equal(Object.keys(ACTOR_VISUALS).length,28);
assert.deepEqual(Array.from({length:9},(_,i)=>locationForFloor(i+1).id),['ocean-drive','ocean-drive','wynwood','wynwood','underpass','underpass','club-backlot','club-backlot','rooftop']);
assert.equal(resolveAppearance({version:1,actorVisualId:'../../bad'}).id,'hero-neon');
assert.throws(()=>validateActorVisual({...ACTOR_VISUALS['hero-neon'],fallbackImageUrl:'https://example.com/image.svg'}));
assert.throws(()=>validateActorVisual({...ACTOR_VISUALS['hero-neon'],clips:{idle:{frames:['a'],durationsMs:[],loop:true,completion:'idle'}}}));
console.log('PASS: shared/late/retry/StrictMode texture leases, 20 disposal cycles, 28 actor coverage entries, manifest validation and five floor mappings');

for(const location of LOCATIONS) for(const layer of location.layers) await access(`public${layer.url}`);
for(const [width,height] of [[320,140],[320,300],[390,480],[844,160],[1440,500]])for(const horizon of [.32,.5]){
 const frame=frameLocation(width,height,1536,1024,.43,horizon);
 assert.ok(frame.x<=.00001 && frame.y<=.00001 && frame.x+frame.width>=width-.00001 && frame.y+frame.height>=height-.00001);
 assert.ok(Math.abs(frame.width/frame.height-1.5)<.00001,'no aspect distortion');
 assert.ok(Math.abs(frame.y+frame.height*.43-height*horizon)<.00001,'authored ground alignment');
}
assert.throws(()=>frameLocation(320,400,1536,1024,NaN));
console.log('PASS: five district assets and 10 aspect-preserving, edge-covering ground-aligned frames');

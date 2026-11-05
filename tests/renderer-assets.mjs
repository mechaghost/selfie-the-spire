import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { access } from 'node:fs/promises';
await build({stdin:{contents:`export * from './src/rendering/AssetLeaseCache'; export * from './src/core/battleVisualModels'; export * from './src/data/actorVisuals'; export * from './src/data/locations'; export { enemies } from './src/data/enemies'; export { ENCOUNTER_POOLS } from './src/data/encounters';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/renderer-assets.mjs',bundle:true,platform:'node',format:'esm'});
const {AssetLeaseCache,ACTOR_VISUALS,validateActorVisual,locationForFloor,enemies,ENCOUNTER_POOLS,resolveAppearance} = await import('./.e2e-out/renderer-assets.mjs');
let loads=0;const disposed=[];let resolveLoad;
const cache=new AssetLeaseCache(()=>{loads++;return new Promise(resolve=>resolveLoad=resolve);},value=>disposed.push(value));
const a=cache.acquire('shared'),b=cache.acquire('shared');await Promise.resolve();assert.equal(loads,1);
a.release();a.release();assert.equal(cache.stats().references,1);resolveLoad('texture');await b.ready;assert.deepEqual(disposed,[]);
b.release();assert.deepEqual(disposed,['texture']);assert.deepEqual(cache.stats(),{entries:0,references:0});
const late=cache.acquire('late');late.release();await Promise.resolve();resolveLoad('late-texture');await late.ready;assert.equal(disposed.at(-1),'late-texture');assert.equal(cache.stats().entries,0);
let tries=0;const failures=new AssetLeaseCache(async()=>{if(++tries===1)throw Error('missing');return 'retry';},()=>{});
const bad=failures.acquire('missing');await assert.rejects(bad.ready);bad.release();const good=failures.acquire('missing');assert.equal(await good.ready,'retry');good.release();assert.equal(failures.stats().entries,0);
// StrictMode-style setup-cleanup-setup while the first load is still pending.
const first=cache.acquire('strict');first.release();const second=cache.acquire('strict');await Promise.resolve();resolveLoad('strict-texture');await second.ready;assert.notEqual(disposed.at(-1),'strict-texture');second.release();assert.equal(disposed.at(-1),'strict-texture');
for(let i=0;i<20;i++){const lease=cache.acquire('cycle');await Promise.resolve();resolveLoad(`cycle-${i}`);await lease.ready;lease.release();assert.equal(cache.stats().entries,0);}
for(const visual of Object.values(ACTOR_VISUALS)){validateActorVisual(visual);await access(`public${visual.fallbackImageUrl}`);}
for(const id of Object.keys(enemies)) assert.ok(ACTOR_VISUALS[id],`legacy/developer actor ${id} represented`);
for(const pool of Object.values(ENCOUNTER_POOLS))for(const encounter of pool)for(const id of encounter.enemyIds)assert.ok(ACTOR_VISUALS[id],`reachable actor ${id}`);
assert.equal(Object.keys(ACTOR_VISUALS).length,28);
assert.deepEqual(Array.from({length:9},(_,i)=>locationForFloor(i+1).id),['ocean-drive','ocean-drive','wynwood','wynwood','underpass','underpass','club-backlot','club-backlot','rooftop']);
assert.equal(resolveAppearance({version:1,actorVisualId:'../../bad'}).id,'hero-neon');
assert.throws(()=>validateActorVisual({...ACTOR_VISUALS['hero-neon'],fallbackImageUrl:'https://example.com/image.svg'}));
assert.throws(()=>validateActorVisual({...ACTOR_VISUALS['hero-neon'],clips:{idle:{frames:['a'],durationsMs:[],loop:true,completion:'idle'}}}));
console.log('PASS: shared/late/retry/StrictMode texture leases, 20 disposal cycles, 28 actor coverage entries, manifest validation and five floor mappings');

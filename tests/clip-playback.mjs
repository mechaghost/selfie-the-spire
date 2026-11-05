import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export * from './src/rendering/clipPlayback'; export * from './src/data/actorVisuals'; export * from './src/core/battleVisualModels';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/clip-playback.mjs',bundle:true,platform:'node',format:'esm'});
const {clipFrameAt,ACTOR_VISUALS,validateActorVisual}=await import('./.e2e-out/clip-playback.mjs');
const clip={frames:['a','b','c'],durationsMs:[80,160,80],loop:false,completion:'idle'};
for(const [ms,expected] of [[-1,'a'],[0,'a'],[79,'a'],[80,'b'],[239,'b'],[240,'c'],[319,'c'],[320,null],[10000,null]])assert.equal(clipFrameAt(clip,ms),expected);
assert.equal(clipFrameAt({...clip,loop:true},400),'b');
assert.equal(clipFrameAt({...clip,completion:'hold'},10000),'c');
assert.equal(clipFrameAt(clip,140,true),null);
assert.equal(clipFrameAt({...clip,completion:'hold'},0,true),'c');
for(const id of ['hero-neon','alley_rat','vending_golem','fire_escape_spider']) {
 const visual=ACTOR_VISUALS[id]; validateActorVisual(visual);
 assert.equal(clipFrameAt(visual.clips.attack,140),'attack','contact matches combat impact beat');
 assert.equal(clipFrameAt(visual.clips.attack,320),null,'never hold stale attack');
 assert.throws(()=>validateActorVisual({...visual,clips:{attack:{...clip,frames:['idle','missing','idle']}}}));
}
console.log('PASS: exact clip boundaries, loop/hold/idle completion, skipped frames, reduced motion, contact beat and missing-frame validation');

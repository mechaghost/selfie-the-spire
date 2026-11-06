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
for(const id of Object.keys(ACTOR_VISUALS).filter(id=>ACTOR_VISUALS[id].clips.attack)) {
 const visual=ACTOR_VISUALS[id]; validateActorVisual(visual);
 assert.equal(clipFrameAt(visual.clips.attack,140),'attack','contact matches combat impact beat');
 assert.equal(clipFrameAt(visual.clips.attack,320),null,'never hold stale attack');
 assert.throws(()=>validateActorVisual({...visual,clips:{attack:{...clip,frames:['idle','missing','idle']}}}));
}
console.log('PASS: exact clip boundaries, loop/hold/idle completion, skipped frames, reduced motion, contact beat and missing-frame validation');
const neon=ACTOR_VISUALS['hero-neon'];
for(const [ms,frame] of [[0,'windup'],[79,'windup'],[80,'attack'],[140,'attack'],[239,'attack'],[240,'recovery'],[319,'recovery'],[320,null]])assert.equal(clipFrameAt(neon.clips.attack,ms),frame);
for(const scale of [0,-1,NaN,Infinity,5])assert.throws(()=>validateActorVisual({...neon,keyPoses:{...neon.keyPoses,windup:{...neon.keyPoses.windup,scale}}}));
assert.equal(clipFrameAt(neon.clips.attack,0,true),null);
console.log('PASS: Neon authored anticipation/contact/recovery boundaries and invalid per-frame scale rejection');

const rat=ACTOR_VISUALS.alley_rat;
for(const [ms,frame] of [[0,'windup'],[79,'windup'],[80,'attack'],[140,'attack'],[239,'attack'],[240,'recovery'],[319,'recovery'],[320,null]])assert.equal(clipFrameAt(rat.clips.attack,ms),frame);
assert.equal(clipFrameAt(rat.clips.attack,0,true),null);
console.log('PASS: Rat authored anticipation/contact/recovery boundaries and reduced-motion skip');

const golem=ACTOR_VISUALS.vending_golem;
for(const [ms,frame] of [[0,'windup'],[79,'windup'],[80,'attack'],[140,'attack'],[239,'attack'],[240,'recovery'],[319,'recovery'],[320,null]])assert.equal(clipFrameAt(golem.clips.attack,ms),frame);
assert.equal(clipFrameAt(golem.clips.attack,0,true),null);
console.log('PASS: Golem authored anticipation/contact/recovery boundaries and reduced-motion skip');

const spider=ACTOR_VISUALS.fire_escape_spider;
for(const [ms,frame] of [[0,'windup'],[79,'windup'],[80,'attack'],[140,'attack'],[239,'attack'],[240,'recovery'],[319,'recovery'],[320,null]])assert.equal(clipFrameAt(spider.clips.attack,ms),frame);
assert.equal(clipFrameAt(spider.clips.attack,0,true),null);
console.log('PASS: Spider authored anticipation/contact/recovery boundaries and reduced-motion skip');

// Authored idle repeats; action/reaction clips finish; defeat holds without looping.
// Use existing frames to exercise lifecycle validation independently of new art.
const loopingIdle={frames:['idle','windup'],durationsMs:[800,800],loop:true,completion:'idle'};
validateActorVisual({...neon,clips:{idle:loopingIdle}});
assert.equal(clipFrameAt(loopingIdle,799),'idle');
assert.equal(clipFrameAt(loopingIdle,800),'windup');
assert.equal(clipFrameAt(loopingIdle,1600),'idle');
assert.equal(clipFrameAt(loopingIdle,100000,true),null,'reduced motion uses the static idle fallback');
for(const name of ['attack','cast','hit','guard','celebrate']) {
 const finite={frames:['idle','windup'],durationsMs:[80,140],loop:false,completion:'idle'};
 validateActorVisual({...neon,clips:{[name]:finite}});
 assert.equal(clipFrameAt(finite,220),null);
 for(const invalid of [{...finite,loop:true},{...finite,completion:'hold'}])assert.throws(()=>validateActorVisual({...neon,clips:{[name]:invalid}}),/lifecycle/);
}
const defeat={frames:['hit','defeat'],durationsMs:[80,200],loop:false,completion:'hold'};
validateActorVisual({...neon,clips:{defeat}});
assert.equal(clipFrameAt(defeat,100000),'defeat');
assert.equal(clipFrameAt(defeat,0,true),'defeat');
for(const invalid of [{...defeat,loop:true},{...defeat,completion:'idle'}])assert.throws(()=>validateActorVisual({...neon,clips:{defeat:invalid}}),/lifecycle/);
for(const invalid of [{...loopingIdle,loop:false},{...loopingIdle,completion:'hold'}])assert.throws(()=>validateActorVisual({...neon,clips:{idle:invalid}}),/lifecycle/);
assert.throws(()=>validateActorVisual({...neon,clips:{unknown:loopingIdle}}),/lifecycle/);
console.log('PASS: authored idle loops, finite action/reaction completion, held defeat, reduced motion and invalid lifecycle rejection');
for(const [ms,frame] of [[0,'idle'],[3899,'idle'],[3900,'blink'],[4009,'blink'],[4010,'idle'],[7910,'blink']])assert.equal(clipFrameAt(golem.clips.idle,ms),frame);
assert.equal(clipFrameAt(golem.clips.idle,3950,true),null);
console.log('PASS: Golem authored blink duration, cycle boundary and reduced-motion static fallback');
for(const [ms,frame] of [[0,'idle'],[4699,'idle'],[4700,'blink'],[4799,'blink'],[4800,'idle'],[9500,'blink']])assert.equal(clipFrameAt(spider.clips.idle,ms),frame);
assert.equal(clipFrameAt(spider.clips.idle,4750,true),null);
console.log('PASS: Spider authored blink duration, cycle boundary and reduced-motion static fallback');

import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/rendering/actorMotion.ts'],outfile:'tests/.e2e-out/actor-motion.mjs',bundle:true,platform:'node',format:'esm'});
const {sampleActorMotion:sample,ActorMotionClock,motionProfile,actorPoseAt}=await import('./.e2e-out/actor-motion.mjs');
for(const ms of [0,79,240,320,60000])assert.equal(actorPoseAt('attack',ms,false),'idle');
for(const ms of [80,140,239])assert.equal(actorPoseAt('attack',ms,false),'attack');
assert.equal(actorPoseAt('attack',140,true),'idle');
for(const profile of ['agile','heavy','float','slime']){
 for(const direction of [-1,1]){
  const contact=sample(profile,'attack',140,0,direction,false);
  assert.ok(contact.x*direction>=10,'contact travels toward opponent');
  assert.ok(sample(profile,'attack',40,0,direction,false).x*direction<0,'anticipation travels away');
  assert.equal(sample(profile,'attack',320,0,direction,false).x,0,'settles within queue recovery budget');
  assert.equal(sample(profile,'attack',60000,0,direction,false).x,0,'hidden-tab return cannot replay old attack');
 }
 for(const clip of ['idle','attack','hit','guard','cast','celebrate']){
  assert.deepEqual(sample(profile,clip,100,1200,1,true),{x:0,y:0,scaleX:1,scaleY:1,rotation:0,alpha:1});
 }
 assert.equal(sample(profile,'defeat',0,0,1,false).alpha,1);
 assert.equal(sample(profile,'defeat',280,0,1,false).alpha,.15000000000000002);
 assert.deepEqual(sample(profile,'defeat',0,0,1,true),sample(profile,'defeat',280,0,1,false));
}
const clock=new ActorMotionClock();
assert.equal(clock.elapsed('enemy','attack','a',100),0);
assert.equal(clock.elapsed('enemy','attack','a',180),80,'snapshot refresh preserves progress');
assert.equal(clock.elapsed('enemy','attack','b',180),0,'repeated attack token restarts');
assert.equal(clock.elapsed('enemy','defeat',undefined,200),0);
assert.equal(clock.elapsed('enemy','defeat',undefined,60000),59800);
clock.clear();assert.equal(clock.elapsed('enemy','defeat',undefined,60001),0);
assert.equal(motionProfile('dj_phantom'),'float');assert.equal(motionProfile('the_billboard'),'heavy');
console.log('PASS: attack contact/recovery/direction, repeated-action identity, hidden-tab expiry, defeat and reduced-motion behavior');

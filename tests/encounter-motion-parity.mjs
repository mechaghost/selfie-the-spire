import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({stdin:{contents:`export {useGameStore} from './src/store/gameStore'; export {ENCOUNTER_POOLS} from './src/data/encounters'; export {createEnemyInstance} from './src/data/enemies'; export {setCombatMotionMode} from './src/core/combatTiming'; export {subscribePresentation,subscribeImpacts} from './src/rendering/CombatPresentation';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/encounter-motion-parity.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
let now=0,serial=0;const timers=new Map();
globalThis.setTimeout=(fn,ms=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;};
globalThis.clearTimeout=id=>timers.delete(id);
const {useGameStore:store,ENCOUNTER_POOLS,createEnemyInstance,setCombatMotionMode,subscribePresentation,subscribeImpacts}=await import('./.e2e-out/encounter-motion-parity.mjs');
function settle(){let count=0;while(store.getState().isResolving||store.getState().actionQueue.length){assert.ok(count++<2000,'queue terminates');const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];assert.ok(next,'resolving queue has a scheduled continuation');const [id,timer]=next;timers.delete(id);now=timer.at;timer.fn();}}
function snapshot(){const s=store.getState();return JSON.parse(JSON.stringify({player:s.player,enemies:s.enemies,hand:s.hand,draw:s.drawPile,discard:s.discardPile,exhaust:s.exhaustPile,resolving:s.resolvingCards,deck:s.masterDeck,inCombat:s.inCombat,rng:s.rng.snapshot(),result:s.combatResult,gold:s.goldReward,rewards:s.cardRewards,complete:s.isRunComplete,gameOver:s.isGameOver}));}
function battle(pool,encounter,seed,mode){
 const coverage={spiderCast:0,spiderBlock:0,burnTick:0,spikes:0};
 const stopActions=subscribePresentation(notice=>{if(notice.phase==='begin' && notice.type==='APPLY_STATUS' && notice.sourceId==='enemy-2' && notice.targetId==='player')coverage.spiderCast++;});
 const stopImpacts=subscribeImpacts(notice=>{if(notice.effect==='block' && notice.targetId==='enemy-2')coverage.spiderBlock++;if(notice.effect==='burn' && notice.targetId==='player')coverage.burnTick++;if(notice.effect==='thorns' && notice.targetId==='player')coverage.spikes++;});
 setCombatMotionMode(mode);store.getState().initializeRun(seed);
 store.setState({floor:pool.includes('boss')?9:pool.includes('elite')?5:1,isBossFloor:pool.includes('boss')});
 store.getState().startCombat(encounter.enemyIds.map((id,i)=>createEnemyInstance(id,`enemy-${i}`,store.getState().rng)));settle();
 const trace=[snapshot()];let turns=0,commands=0,coreBuffVerified=false;
 while(!store.getState().combatResult){
  assert.ok(commands++<600,`${encounter.id}: bounded battle`);
  const s=store.getState();assert.equal(s.isPlayerTurn,true,'input returns to player');
  const card=s.hand.find(card=>card.cost<=s.player.energy);
  if(card) {
   const target=card.target==='Enemy'?s.enemies.find(enemy=>enemy.hp>0)?.id:undefined;
   store.getState().playCard(card.instanceId,target);
  } else {turns++;store.getState().endTurn();}
  settle();assert.equal(store.getState().resolvingCards.length,0,'no authoritative card stranded at command boundary');trace.push(snapshot());
  if(encounter.id==='w4_core' && turns===1 && !coreBuffVerified) {
   const golem=store.getState().enemies.find(enemy=>enemy.templateId==='vending_golem');
   assert.ok(golem && golem.hp>0,'core fixture retains Golem through its first buff');
   assert.equal(golem.statuses.find(status=>status.id==='thorns')?.amount,2,'first Golem turn applies Spikes');
   assert.equal(golem.block,10,'first Golem turn grants Block');
   coreBuffVerified=true;
  }
 }
 const final=store.getState();assert.equal(final.actionQueue.length,0);assert.equal(final.isResolving,false);
 const zones=[...final.hand,...final.drawPile,...final.discardPile,...final.exhaustPile,...final.resolvingCards].map(card=>card.instanceId);
 assert.equal(new Set(zones).size,zones.length,'each card belongs to exactly one combat zone');
 const result=final.combatResult;
 if(encounter.id==='w4_core') {
  assert.ok(coreBuffVerified,'core encounter exercises its first enemy turn');
  if(result==='victory') {
   const reward=final.cardRewards[0];assert.ok(reward,'core victory offers a card');
   const gold=final.player.gold,deckSize=final.masterDeck.length,goldReward=final.goldReward;
   final.claimCardReward(reward.instanceId);
   assert.equal(store.getState().player.gold,gold+goldReward);
   assert.equal(store.getState().masterDeck.length,deckSize+1);
   assert.equal(store.getState().inCombat,false,'reward returns from combat');
   const claimed=snapshot();store.getState().claimCardReward(reward.instanceId);
   assert.deepEqual(snapshot(),claimed,'core reward cannot be claimed twice');trace.push(claimed);
  }
 }
 stopActions();stopImpacts();
 return {trace,turns,commands,result,coverage};
}
const report=[];
const pools={...ENCOUNTER_POOLS,w4_reference:[{id:'w4_core',enemyIds:['alley_rat','vending_golem','fire_escape_spider']}]};
for(const [pool,encounters] of Object.entries(pools))for(const encounter of encounters)for(const seed of ['audit-a','audit-b','audit-c']) {
 const normal=battle(pool,encounter,seed,'normal');
 for(const mode of ['reduced','off'])assert.deepEqual(battle(pool,encounter,seed,mode),normal,`${encounter.id}/${seed}: ${mode} has identical command-by-command state`);
 report.push({pool,encounter:encounter.id,seed,result:normal.result,turns:normal.turns,commands:normal.commands,...(encounter.id==='w4_core'?{coverage:normal.coverage}:{})});
}
const core=report.filter(row=>row.encounter==='w4_core');
assert.ok(core.some(row=>row.result==='victory'),'core reward claim path is exercised');
for(const key of ['spiderCast','spiderBlock','burnTick','spikes'])assert.ok(core.some(row=>row.coverage[key]>0),`core battle exercises ${key}`);
assert.ok(report.some(row=>row.result==='victory'));assert.ok(report.some(row=>row.result==='defeat'));
await writeFile('tests/.e2e-out/encounter-motion-parity.json',JSON.stringify(report,null,2));
console.log(`PASS: ${report.length*3} complete battles, all production encounters plus W4 core × 3 seeds × 3 motion modes; command state, piles, RNG and terminal reward parity`);

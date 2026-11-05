import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({stdin:{contents:`export {useGameStore} from './src/store/gameStore'; export {ENCOUNTER_POOLS} from './src/data/encounters'; export {createEnemyInstance} from './src/data/enemies'; export {setCombatMotionMode} from './src/core/combatTiming';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/encounter-motion-parity.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
let now=0,serial=0;const timers=new Map();
globalThis.setTimeout=(fn,ms=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;};
globalThis.clearTimeout=id=>timers.delete(id);
const {useGameStore:store,ENCOUNTER_POOLS,createEnemyInstance,setCombatMotionMode}=await import('./.e2e-out/encounter-motion-parity.mjs');
function settle(){let count=0;while(store.getState().isResolving||store.getState().actionQueue.length){assert.ok(count++<2000,'queue terminates');const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];assert.ok(next,'resolving queue has a scheduled continuation');const [id,timer]=next;timers.delete(id);now=timer.at;timer.fn();}}
function snapshot(){const s=store.getState();return JSON.parse(JSON.stringify({player:s.player,enemies:s.enemies,hand:s.hand,draw:s.drawPile,discard:s.discardPile,exhaust:s.exhaustPile,resolving:s.resolvingCards,rng:s.rng.snapshot(),result:s.combatResult,gold:s.goldReward,rewards:s.cardRewards,complete:s.isRunComplete,gameOver:s.isGameOver}));}
function battle(pool,encounter,seed,mode){
 setCombatMotionMode(mode);store.getState().initializeRun(seed);
 store.setState({floor:pool.includes('boss')?9:pool.includes('elite')?5:1,isBossFloor:pool.includes('boss')});
 store.getState().startCombat(encounter.enemyIds.map((id,i)=>createEnemyInstance(id,`enemy-${i}`,store.getState().rng)));settle();
 const trace=[snapshot()];let turns=0,commands=0;
 while(!store.getState().combatResult){
  assert.ok(commands++<600,`${encounter.id}: bounded battle`);
  const s=store.getState();assert.equal(s.isPlayerTurn,true,'input returns to player');
  const card=s.hand.find(card=>card.cost<=s.player.energy);
  if(card) {
   const target=card.target==='Enemy'?s.enemies.find(enemy=>enemy.hp>0)?.id:undefined;
   store.getState().playCard(card.instanceId,target);
  } else {turns++;store.getState().endTurn();}
  settle();assert.equal(store.getState().resolvingCards.length,0,'no authoritative card stranded at command boundary');trace.push(snapshot());
 }
 const final=store.getState();assert.equal(final.actionQueue.length,0);assert.equal(final.isResolving,false);
 const zones=[...final.hand,...final.drawPile,...final.discardPile,...final.exhaustPile,...final.resolvingCards].map(card=>card.instanceId);
 assert.equal(new Set(zones).size,zones.length,'each card belongs to exactly one combat zone');
 return {trace,turns,commands,result:final.combatResult};
}
const report=[];
for(const [pool,encounters] of Object.entries(ENCOUNTER_POOLS))for(const encounter of encounters)for(const seed of ['audit-a','audit-b','audit-c']) {
 const normal=battle(pool,encounter,seed,'normal');
 for(const mode of ['reduced','off'])assert.deepEqual(battle(pool,encounter,seed,mode),normal,`${encounter.id}/${seed}: ${mode} has identical command-by-command state`);
 report.push({pool,encounter:encounter.id,seed,result:normal.result,turns:normal.turns,commands:normal.commands});
}
assert.ok(report.some(row=>row.result==='victory'));assert.ok(report.some(row=>row.result==='defeat'));
await writeFile('tests/.e2e-out/encounter-motion-parity.json',JSON.stringify(report,null,2));
console.log(`PASS: ${report.length*3} complete battles, all production encounters × 3 seeds × 3 motion modes; command state, piles, RNG and terminal reward parity`);

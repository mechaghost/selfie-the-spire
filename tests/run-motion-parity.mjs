import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({stdin:{contents:`export {useGameStore} from './src/store/gameStore'; export {generateMap} from './src/core/mapGenerator'; export {setCombatMotionMode} from './src/core/combatTiming';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/run-motion-parity.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
let now=0,serial=0;const timers=new Map();
globalThis.setTimeout=(fn,ms=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;};
globalThis.clearTimeout=id=>timers.delete(id);
const {useGameStore:store,generateMap,setCombatMotionMode}=await import('./.e2e-out/run-motion-parity.mjs');
function settle(){let count=0;while(store.getState().isResolving||store.getState().actionQueue.length){assert.ok(count++<2000,'queue terminates');const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];assert.ok(next,'resolving queue has a scheduled continuation');const [id,timer]=next;timers.delete(id);now=timer.at;timer.fn();}}
function snapshot(){const s=store.getState();return JSON.parse(JSON.stringify({player:s.player,enemies:s.enemies,hand:s.hand,draw:s.drawPile,discard:s.discardPile,exhaust:s.exhaustPile,resolving:s.resolvingCards,rng:s.rng.snapshot(),result:s.combatResult,gold:s.goldReward,rewards:s.cardRewards,complete:s.isRunComplete,gameOver:s.isGameOver,floor:s.floor,node:s.currentNodeId,deck:s.masterDeck,event:s.nodeEvent,eventOutcome:s.eventOutcome,restOutcome:s.restOutcome,shop:s.shopCards,shopPrices:s.shopPrices}));}
function run(seed,mode){
 setCombatMotionMode(mode);store.getState().initializeRun(seed);
 const map=generateMap(seed),trace=[],visited=[];let commands=0;
 while(!store.getState().isGameOver && !store.getState().isRunComplete){
  const state=store.getState();assert.ok(state.floor<9,'boss must terminate run');
  const current=map.nodes.find(node=>node.id===state.currentNodeId);
  const available=map.nodes.filter(node=>current?current.connections.includes(node.id):node.y===1);
  const priority={Rest:0,Unknown:1,Shop:2,Combat:3,Elite:4,Boss:5};
  const node=available.sort((a,b)=>priority[a.type]-priority[b.type] || a.x-b.x)[0];assert.ok(node,'legal onward route exists');
  store.getState().advanceFloor(node);settle();visited.push(node.type);trace.push(snapshot());
  while(store.getState().inCombat && !store.getState().combatResult){
   assert.ok(commands++<1000,'run command bound');const s=store.getState();
   const card=s.hand.find(card=>card.cost<=s.player.energy);
   if(card)store.getState().playCard(card.instanceId,card.target==='Enemy'?s.enemies.find(enemy=>enemy.hp>0)?.id:undefined);
   else store.getState().endTurn();
   settle();trace.push(snapshot());assert.equal(store.getState().resolvingCards.length,0);
  }
  const s=store.getState();
  if(s.combatResult){
   if(s.combatResult==='victory' && s.cardRewards.length){
    const reward=s.cardRewards[0];s.claimCardReward(reward.instanceId);
    const once=snapshot();store.getState().claimCardReward(reward.instanceId);assert.deepEqual(snapshot(),once,'reward cannot be claimed twice');
   }else s.continueCombatResult();
  }else if(s.nodeEvent==='rest'){s.restHeal();store.getState().dismissNodeEvent();}
  else if(s.nodeEvent==='shop'){
   const card=s.shopCards.find(card=>s.shopPrices[card.instanceId]<=s.player.gold);
   if(card)s.buyCard(card.instanceId,s.shopPrices[card.instanceId]);store.getState().dismissNodeEvent();
  }else if(s.nodeEvent==='mystery'){
   const choice=s.currentEvent.choices.find(choice=>!choice.condition || choice.condition==='hasGold50'&&s.player.gold>=50 || choice.condition==='hasGold40'&&s.player.gold>=40);
   assert.ok(choice);s.chooseEventOption(choice.id);store.getState().dismissNodeEvent();
  }else assert.fail(`Unhandled node event ${s.nodeEvent}`);
  trace.push(snapshot());
 }
 return {trace,visited,commands,complete:store.getState().isRunComplete,floor:store.getState().floor};
}
const report=[];
for(let i=0;i<20;i++){
 const seed=`route-audit-${i}`,normal=run(seed,'normal');
 for(const mode of ['reduced','off'])assert.deepEqual(run(seed,mode),normal,`${seed}/${mode}: continuous run state parity`);
 report.push({seed,visited:normal.visited,commands:normal.commands,complete:normal.complete,floor:normal.floor});
}
assert.ok(report.some(row=>row.complete && row.floor===9),'at least one actual nine-floor boss victory');
await writeFile('tests/.e2e-out/run-motion-parity.json',JSON.stringify(report,null,2));
console.log(`PASS: 60 continuous legal-route runs; ${report.filter(row=>row.complete).length}/20 seeds complete the boss in every mode; command/reward/map/RNG parity`);

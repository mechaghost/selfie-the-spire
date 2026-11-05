import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export * from './src/core/combatTiming';export * from './src/rendering/CombatPresentation';export {useGameStore} from './src/store/gameStore';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/combat-presentation.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
let now=0,serial=0;const timers=new Map();
globalThis.setTimeout=(fn,ms=0)=>{const id=++serial;timers.set(id,{fn,at:now+ms});return id;};globalThis.clearTimeout=id=>timers.delete(id);
const api=await import('./.e2e-out/combat-presentation.mjs');
const clock=new api.CombatClock();let ran=0;const scheduled=clock.schedule(()=>ran++,10);const late=timers.get(scheduled).fn;clock.cancel();late();assert.equal(ran,0);assert.equal(clock.pendingCount,0);
const notices=[];const unsubscribe=api.subscribePresentation(notice=>notices.push(notice));const broken=api.subscribePresentation(()=>{throw Error('renderer failure');});
const store=api.useGameStore;
function settle(){let count=0;while(store.getState().isResolving||store.getState().actionQueue.length){assert.ok(count++<500);const [id,timer]=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];timers.delete(id);now=timer.at;timer.fn();}}
function snapshot(){const s=store.getState();return {player:s.player,enemies:s.enemies,hand:s.hand,discard:s.discardPile,exhaust:s.exhaustPile,resolving:s.resolvingCards,rng:s.rng.snapshot(),rewards:s.cardRewards};}
const results=[],durations=[];
for(const mode of ['normal','reduced','off']){
 api.setCombatMotionMode(mode);store.getState().initializeRun('presentation-parity');api.beginPresentationBattle();
 const card={id:'test',instanceId:'test',name:'Test',type:'Attack',cost:1,target:'Enemy',description:'Attack',effects:[{type:'Damage',amount:6,target:'Target'},{type:'ApplyStatus',amount:2,statusId:'weak',target:'Target'}]};
 const enemies=Array.from({length:3},(_,i)=>({id:`foe-${i}`,templateId:'alley_rat',name:'Rat',hp:40,maxHp:40,block:0,statuses:[],intent:{type:'Attack',effects:[{type:'Damage',amount:5,target:'Target'}]}}));
 store.setState({inCombat:true,isPlayerTurn:true,masterDeck:[card],hand:[card],drawPile:[],discardPile:[],exhaustPile:[],enemies});
 let start=now;store.getState().playCard('test','foe-0');settle();const cardMs=now-start;const afterCard=snapshot();
 start=now;store.getState().endTurn();settle();const turnMs=now-start;
 results.push([afterCard,snapshot()]);durations.push({mode,cardMs,turnMs});
}
assert.deepEqual(results[0],results[1]);assert.deepEqual(results[0],results[2]);assert.ok(durations[0].cardMs<=800);assert.ok(durations[0].turnMs<=4000);assert.equal(durations[2].cardMs,0);assert.equal(durations[2].turnMs,0);
const begins=notices.filter(n=>n.phase==='begin');const keys=begins.map(n=>`${n.battleId}:${n.actionId}`);assert.equal(new Set(keys).size,keys.length,'ordered action IDs unique within battle');
for(const n of begins)assert.equal(notices.filter(e=>e.battleId===n.battleId && e.actionId===n.actionId && e.phase==='complete').length,1,'exactly one completion notice');
const attackBegin=begins.find(n=>n.type==='PLAY_CARD');const damage=begins.find(n=>n.type==='DAMAGE_ENTITY');assert.equal(attackBegin.commandId,damage.commandId);
unsubscribe();broken();api.setCombatMotionMode('normal');
console.log('PASS: late callback cancellation, throwing renderer isolation, unique action identities and normal/reduced/off gameplay parity',durations);

import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export * from './src/core/combatTiming';export * from './src/rendering/CombatPresentation';export {useGameStore} from './src/store/gameStore';export {enemies,createEnemyInstance} from './src/data/enemies';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/combat-presentation.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
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
const impacts=[];const stopImpacts=api.subscribeImpacts(event=>impacts.push(event));
api.setCombatMotionMode('off');store.getState().initializeRun('impact-results');api.beginPresentationBattle();
store.setState({inCombat:true,isPlayerTurn:true,enemies:[{id:'target',templateId:'alley_rat',name:'Rat',hp:10,maxHp:40,block:3,statuses:[],intent:null}]});
function effect(type,payload){store.getState().queueAction({type,payload});store.getState().resolveQueue();settle();}
effect('DAMAGE_ENTITY',{sourceId:'player',targetId:'target',amount:8});assert.equal(impacts.at(-1).hpDelta,-5);assert.equal(impacts.at(-1).blockDelta,-3);
effect('HEAL_ENTITY',{targetId:'target',amount:50});assert.equal(impacts.at(-1).hpDelta,35,'healing capped at missing HP');
store.setState({enemies:store.getState().enemies.map(enemy=>({...enemy,block:20}))});
effect('DAMAGE_ENTITY',{sourceId:'player',targetId:'target',amount:4});assert.equal(impacts.at(-1).effect,'blocked');assert.equal(impacts.at(-1).hpDelta,0);assert.equal(impacts.at(-1).blockDelta,-4);
store.setState({enemies:store.getState().enemies.map(enemy=>({...enemy,block:0,statuses:[{id:'thorns',name:'Spikes',amount:3}]}))});
effect('DAMAGE_ENTITY',{sourceId:'player',targetId:'target',amount:1});assert.equal(impacts.at(-1).effect,'thorns');assert.equal(impacts.at(-1).hpDelta,-3);assert.equal(impacts.at(-1).targetId,'player');
store.setState({enemies:store.getState().enemies.map(enemy=>({...enemy,hp:20,statuses:[{id:'burn',name:'Burn',amount:3},{id:'regen',name:'Regen',amount:2}]}))});
effect('STATUS_TICK',{targetId:'target'});assert.deepEqual(impacts.slice(-2).map(e=>[e.effect,e.hpDelta]),[['burn',-3],['heal',2]]);assert.equal(store.getState().enemies[0].hp,19);
effect('APPLY_STATUS',{sourceId:'target',targetId:'target',status:{id:'strength',name:'strength',amount:3}});
assert.equal(impacts.at(-1).effect,'status');
assert.equal(impacts.at(-1).targetId,'target');
assert.equal(impacts.at(-1).label,'+3 Strength');
assert.equal(store.getState().enemies[0].statuses.find(status=>status.id==='strength').amount,3);
stopImpacts();api.setCombatMotionMode('normal');
console.log('PASS: actual HP/Block deltas, capped healing, fully blocked hits, retaliation and separate Burn/regen outcomes');

const djAttack = api.enemies.dj_phantom.aiPatterns.find(({intent}) => intent.hits === 4)?.intent;
assert.ok(djAttack, 'DJ Phantom four-hit move exists');
const djTurns = [];
const djTurnDurations = [];
for (const mode of ['normal', 'reduced', 'off']) {
    api.setCombatMotionMode(mode);
    store.getState().initializeRun('dj-four-hit');
    const enemy = api.createEnemyInstance('dj_phantom', 'dj', store.getState().rng);
    store.getState().startCombat([enemy]);
    settle();
    store.setState(state => ({
        player: {...state.player, block: 0, statuses: []},
        enemies: state.enemies.map(actor => ({...actor, intent: djAttack})),
    }));
    const startingHp = store.getState().player.hp;
    const lunges = [];
    const hits = [];
    const stopActions = api.subscribePresentation(notice => {
        if (notice.phase === 'begin' && notice.type === 'PLAY_ANIMATION' && notice.targetId === 'dj') {
            lunges.push(now);
        }
    });
    const stopHits = api.subscribeImpacts(notice => {
        if (notice.effect === 'damage' && notice.targetId === 'player') hits.push({...notice, at: now});
    });
    const turnStarted = now;
    try {
        store.getState().endTurn();
        settle();
    } finally {
        stopActions();
        stopHits();
    }
    assert.equal(lunges.length, 4);
    assert.equal(new Set(hits.map(hit => hit.actionId)).size, 4);
    assert.equal(new Set(hits.map(hit => hit.commandId)).size, 1);
    assert.deepEqual(hits.map(hit => hit.hpDelta), [-5, -5, -5, -5]);
    assert.deepEqual(hits.map((hit, i) => hit.at - lunges[i]), Array(4).fill(api.combatDelay('anticipation')));
    assert.equal(store.getState().player.hp, startingHp - 20);
    assert.ok(store.getState().isPlayerTurn);
    djTurnDurations.push(now - turnStarted);
    djTurns.push(snapshot());
}
assert.deepEqual(djTurns[0], djTurns[1]);
assert.deepEqual(djTurns[0], djTurns[2]);
assert.ok(djTurnDurations[0] <= 4000);
assert.equal(djTurnDurations[2], 0);

const retaliationDurations = [];
for (const mode of ['normal', 'reduced', 'off']) {
    api.setCombatMotionMode(mode);
    store.getState().initializeRun('crawler-guard');
    const enemy = api.createEnemyInstance('alley_rat', 'spiked-rat', store.getState().rng);
    store.getState().startCombat([enemy]);
    settle();
    const {hand, player} = store.getState();
    const jab = hand.find(card => card.id === 'neon_jab');
    assert.ok(jab);
    store.setState({enemies:[{...store.getState().enemies[0], statuses:[{id:'thorns',name:'Spikes',amount:3}]}]});
    const cardStarted = now;
    store.getState().playCard(jab.instanceId, enemy.id);
    settle();
    retaliationDurations.push(now - cardStarted);
    assert.equal(store.getState().player.hp, player.hp - 3);
}
assert.ok(retaliationDurations[0] <= 800);
assert.equal(retaliationDurations[2], 0);
api.setCombatMotionMode('normal');
console.log('PASS: four-hit DJ turn and Jab with Spikes, normal/reduced/off timings', {djTurnDurations, retaliationDurations});

import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/.e2e-out', { recursive: true });
await build({ stdin: { contents: `export { useGameStore, getRunCheckpoint } from './src/store/gameStore'; export { RNG, mulberry32, cyrb128 } from './src/core/rng';`, resolveDir: process.cwd() }, outfile: 'tests/.e2e-out/checkpoints.mjs', bundle: true, platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' } });
const memory = new Map();
let storageFails = false;
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => { if (storageFails) throw Error('quota'); memory.set(key, value); }, removeItem: key => memory.delete(key) };
let now = 0, timerId = 0;
const timers = new Map();
globalThis.setTimeout = (fn, delay = 0) => { const id = ++timerId; timers.set(id, { at: now + delay, fn }); return id; };
globalThis.clearTimeout = id => timers.delete(id);
const tick = () => { const [id, job] = [...timers].sort((a,b) => a[1].at - b[1].at)[0] ?? []; assert.ok(job, 'pending action has a timer'); timers.delete(id); now = job.at; job.fn(); };
const { useGameStore: store, getRunCheckpoint, RNG, mulberry32, cyrb128 } = await import('./.e2e-out/checkpoints.mjs');
const oldSequence = mulberry32(cyrb128('continuity')[0]);
const rng = new RNG('continuity');
for (let i=0; i<10000; i++) assert.equal(rng.next(), oldSequence(), 'preserve original random sequence');
const mixed = r => [r.next(), r.nextInt(2,99), r.randomElement(['a','b','c']), r.shuffle([1,2,3,4])];
mixed(rng);
const restored = RNG.restore(rng.snapshot());
for (let i=0; i<20; i++) assert.deepEqual(mixed(rng), mixed(restored));
for (const state of [-1, 2**32, 1.5, null, '5']) assert.throws(()=>RNG.restore({algorithm:'mulberry32-v1',seed:'x',state}));
assert.throws(()=>RNG.restore({algorithm:'unknown',seed:'x',state:0}));
let serial = 0;
const makeCard = (effects, extra={}) => ({ id: 'test', instanceId: `test-${++serial}`, name: 'Test', type: 'Skill', cost: 0, target: 'Self', description:'Test', effects, ...extra });
const foe = (extra={}) => ({ id:'foe', templateId:'alley_rat', name:'Foe', hp:100, maxHp:100, block:0, statuses:[], intent:{type:'Attack',damage:5,effects:[{type:'Damage',amount:5,target:'Target'}]}, ...extra });
function setup(cards, extra={}) {
    store.getState().initializeRun('checkpoints');
    store.setState({ masterDeck:cards, hand:cards, drawPile:[], discardPile:[], exhaustPile:[], resolvingCards:[], playingCards:[], enemies:[foe()], inCombat:true, isPlayerTurn:true, ...extra });
}
const saved = () => JSON.parse(memory.get('stt_run'));
function settle(previous) {
    let steps=0;
    while (store.getState().isResolving || store.getState().actionQueue.length) {
        assert.ok(++steps<300, 'bounded queue');
        if (previous) assert.equal(memory.get('stt_run'),previous,'intermediate action must not checkpoint');
        tick();
    }
    assert.equal(store.getState().resolvingCards.length,0);
    const state = store.getState();
    const owned=[...state.drawPile,...state.hand,...state.discardPile,...state.exhaustPile].map(c=>c.instanceId).sort();
    assert.deepEqual(owned,state.masterDeck.map(c=>c.instanceId).sort(),'every physical card retains exactly one owner');
}
// Drawing a card cannot redraw itself; immediate visual cleanup cannot move it early.
const draw = makeCard([{type:'Draw',amount:2,target:'Self'}]);
const spare = makeCard([]);
setup([draw,spare],{hand:[draw],discardPile:[spare]});
const beforeDraw=memory.get('stt_run');
store.getState().playCard(draw.instanceId);
const ghost=store.getState().playingCards[0];
store.getState().cleanupPlayingCard(ghost.id);
assert.equal(store.getState().resolvingCards[0].instanceId,draw.instanceId);
assert.equal(memory.get('stt_run'),beforeDraw);
settle(beforeDraw);
assert.deepEqual(store.getState().hand.map(c=>c.instanceId),[spare.instanceId]);
assert.deepEqual(store.getState().discardPile.map(c=>c.instanceId),[draw.instanceId]);
assert.equal(saved().schemaVersion,2);
assert.deepEqual(saved().rngSnapshot,store.getState().rng.snapshot());
// Slow multi-hit remains in its resolving zone beyond the former 800ms cleanup timer.
const multi=makeCard(Array.from({length:3},()=>({type:'Damage',amount:2,target:'Target'})),{target:'Enemy',type:'Attack'});
setup([multi]); const beforeMulti=memory.get('stt_run');
store.getState().playCard(multi.instanceId,'foe');
while (store.getState().playingCards.length) tick();
assert.ok(store.getState().actionQueue.length>0);
assert.equal(store.getState().resolvingCards.length,1);
assert.equal(store.getState().discardPile.length,0);
settle(beforeMulti); assert.equal(store.getState().enemies[0].hp,94);
// Both terminal paths finalize ownership before saving.
for (const terminal of ['victory','retaliation']) {
 const attack=makeCard([{type:'Damage',amount:2,target:'Target'}],{target:'Enemy',type:'Attack',exhausts:true});
 setup([attack],{enemies:[foe(terminal==='victory'?{hp:1}:{statuses:[{id:'thorns',name:'Spikes',amount:10}]})]});
 if(terminal==='retaliation') store.setState({player:{...store.getState().player,hp:1}});
 const before=memory.get('stt_run'); store.getState().playCard(attack.instanceId,'foe'); settle(before);
 assert.equal(store.getState().combatResult,terminal==='victory'?'victory':'defeat');
 assert.equal(saved().exhaustPile[0].instanceId,attack.instanceId);
}
const power=makeCard([{type:'Draw',amount:1,target:'Self'}],{type:'Power'});
setup([power]); const beforePower=memory.get('stt_run');store.getState().playCard(power.instanceId);settle(beforePower);
assert.equal(saved().exhaustPile[0].instanceId,power.instanceId);
// Enemy-turn phase changes are one command checkpoint, not partial saves.
setup([makeCard([])]);const beforeTurn=memory.get('stt_run');store.getState().endTurn();settle(beforeTurn);
assert.equal(saved().isPlayerTurn,true);assert.equal(saved().player.hp,75);
const valid=memory.get('stt_run'); const expected=mixed(RNG.restore(saved().rngSnapshot));
store.getState().initializeRun('stop-old-timers');memory.set('stt_run',valid);
const reloaded=await import('./.e2e-out/checkpoints.mjs?reload');
assert.deepEqual(mixed(reloaded.useGameStore.getState().rng),expected,'actual store reload preserves RNG');
assert.equal(reloaded.useGameStore.getState().recoveryNotice,null);
// Storage failure keeps an in-memory checkpoint, surfaces failure, and can recover.
storageFails=true; store.getState().initializeRun('quota');assert.match(store.getState().saveError,/could not be saved/);
assert.equal(JSON.parse(getRunCheckpoint()).seed,'quota');storageFails=false;store.setState({floor:1});assert.equal(store.getState().saveError,null);
// Legacy incomplete phases are quarantined without deleting the original.
const unsafe=JSON.stringify({...JSON.parse(valid),schemaVersion:undefined,rngSnapshot:undefined,isPlayerTurn:false});
memory.set('stt_run',unsafe);
const recovery=await import('./.e2e-out/checkpoints.mjs?unsafe');
assert.equal(recovery.useGameStore.getState().seed,'');assert.match(recovery.useGameStore.getState().recoveryNotice,/cannot safely resume/);
assert.equal(memory.get('stt_run'),unsafe);assert.equal(memory.get('stt_run_recovery'),unsafe);
// A save can never override public commands or smuggle renderer/transient state.
memory.set('stt_run',JSON.stringify({...JSON.parse(valid),initializeRun:'bad',actionQueue:[{type:'END_TURN'}],isResolving:true}));
const whitelist=await import('./.e2e-out/checkpoints.mjs?whitelist');
assert.equal(typeof whitelist.useGameStore.getState().initializeRun,'function');assert.equal(whitelist.useGameStore.getState().actionQueue.length,0);
console.log('PASS: original RNG parity, snapshot continuity, atomic saves, command-owned cards, slow multi-hit, Power, terminal finalization, storage failures and unsafe legacy recovery');

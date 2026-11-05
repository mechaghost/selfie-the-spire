import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/.e2e-out', { recursive: true });
await build({ entryPoints: ['src/store/gameStore.ts'], outfile: 'tests/.e2e-out/store.mjs', bundle: true, platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' } });
const { useGameStore: store } = await import('./.e2e-out/store.mjs');
const card = { id: 'test', instanceId: 'test-1', name: 'Test', type: 'Attack', cost: 1, target: 'Enemy', description: 'Test', effects: [] };
function setup(extra = {}) {
    store.getState().initializeRun('guards');
    store.setState({ inCombat: true, isPlayerTurn: true, hand: [card], enemies: [{ id: 'target', hp: 20 }], ...extra });
}
const snapshot = () => JSON.stringify({ hand: store.getState().hand, energy: store.getState().player.energy, queue: store.getState().actionQueue });
for (const phase of [{ inCombat: false }, { isPlayerTurn: false }, { isResolving: true }, { actionQueue: [{ type: 'END_TURN' }] }, { combatResult: 'victory' }]) {
    setup(phase);
    const before = snapshot();
    store.getState().playCard(card.instanceId, 'target');
    store.getState().endTurn();
    assert.equal(snapshot(), before);
}
setup({ isResolving: true });
store.getState().setDragState({ isActive: true, cardId: card.instanceId });
store.getState().playCard(card.instanceId, 'target');
assert.equal(store.getState().dragState.isActive, false);
for (const target of [undefined, 'missing']) {
    setup(); const before = snapshot();
    store.getState().playCard(card.instanceId, target);
    assert.equal(snapshot(), before);
}
setup({ enemies: [{ id: 'target', hp: 0 }] });
const deadBefore = snapshot();
store.getState().playCard(card.instanceId, 'target');
assert.equal(snapshot(), deadBefore);
// Hold queue resolution so duplicate inputs exercise the public action boundary.
const resolveQueue = store.getState().resolveQueue;
setup(); store.setState({ resolveQueue: () => {} });
const energy = store.getState().player.energy;
store.getState().playCard(card.instanceId, 'target');
store.getState().playCard(card.instanceId, 'target');
assert.equal(store.getState().player.energy, energy - 1);
assert.equal(store.getState().actionQueue.length, 1);
setup();
store.getState().endTurn(); store.getState().endTurn();
assert.equal(store.getState().actionQueue.length, 1);
store.setState({ resolveQueue });
// A provider may finish even after the browser aborts. Ignore that stale result.
let finish;
const originalFetch = globalThis.fetch;
globalThis.fetch = () => new Promise(resolve => { finish = resolve; });
store.getState().startSelfieCapture();
const pending = store.getState().submitSelfie('synthetic-local-fixture');
store.getState().initializeRun('starter');
finish({ ok: true, json: async () => ({ character: { name: 'Stale' }, cards: [] }) });
await pending;
assert.equal(store.getState().seed, 'starter');
assert.equal(store.getState().ugcPhase, null);
assert.equal(store.getState().generatedCharacter, null);
globalThis.fetch = originalFetch;
store.getState().initializeRun('cleanup');
setup({ combatResult: 'victory', cardRewards: [card], goldReward: 25 });
const initialGold = store.getState().player.gold;
const initialDeck = store.getState().masterDeck.length;
store.getState().claimCardReward(card.instanceId);
store.getState().claimCardReward(card.instanceId);
assert.equal(store.getState().player.gold, initialGold + 25);
assert.equal(store.getState().masterDeck.length, initialDeck + 1);
store.getState().initializeRun('cleanup');
console.log('PASS: reward commitment is idempotent; phase guards, missing/dead targets, duplicate play/end turn, stale generation response');

// Rest resolves once, preserves feedback, and never over-heals.
store.getState().initializeRun('rest');
store.setState({ nodeEvent: 'rest', player: { ...store.getState().player, hp: 79, maxHp: 80 } });
store.getState().restHeal();
assert.equal(store.getState().player.hp, 80);
assert.equal(store.getState().nodeEvent, 'rest');
assert.match(store.getState().restOutcome, /1 HP/);
const upgradeId = store.getState().masterDeck[0].instanceId;
store.getState().restUpgrade(upgradeId);
assert.equal(store.getState().masterDeck[0].upgraded, undefined);
store.getState().dismissNodeEvent();
assert.equal(store.getState().nodeEvent, null);
// Full-health events still resolve, and cannot be claimed twice.
store.setState({ nodeEvent: 'mystery', eventOutcome: null, currentEvent: { id: 'test', title: 'Test', description: '', choices: [
 { id: 'heal', effects: [{ type: 'healPercent', amount: 15 }] },
 { id: 'gold', effects: [{ type: 'gold', amount: 30 }] },
 { id: 'paid', condition: 'hasGold50', effects: [{ type: 'healFull' }] }
] } });
store.getState().chooseEventOption('heal');
assert.match(store.getState().eventOutcome, /Already at full health/);
const goldBefore = store.getState().player.gold;
store.getState().chooseEventOption('gold');
assert.equal(store.getState().player.gold, goldBefore);
store.setState({ eventOutcome: null, player: { ...store.getState().player, gold: 0 } });
store.getState().chooseEventOption('paid');
assert.equal(store.getState().eventOutcome, null);
store.getState().initializeRun('cleanup');
console.log('PASS: rest feedback, capped healing, repeat-choice guards, full-health event resolution, paid event affordability');

store.getState().initializeRun('upgrade');
store.setState({ nodeEvent: 'rest' });
const upgradeTarget = store.getState().masterDeck[0];
store.getState().restUpgrade(upgradeTarget.instanceId);
const upgradedOnce = JSON.stringify(store.getState().masterDeck);
assert.equal(store.getState().masterDeck[0].upgraded, true);
assert.equal(store.getState().nodeEvent, 'rest');
store.getState().restUpgrade(store.getState().masterDeck[1].instanceId);
assert.equal(JSON.stringify(store.getState().masterDeck), upgradedOnce);
store.getState().initializeRun('cleanup');
console.log('PASS: one upgrade per rest with persistent result');
// A no-benefit upgrade must not spend the rest action or add a misleading '+'.
store.getState().initializeRun('no-op-upgrade');
store.setState({ nodeEvent: 'rest', masterDeck: [{ ...card, type: 'Skill', cost: 0, effects: [{ type: 'Draw', amount: 2, target: 'Self' }] }] });
store.getState().restUpgrade(card.instanceId);
assert.equal(store.getState().restOutcome, null);
assert.equal(store.getState().masterDeck[0].upgraded, undefined);
// Powers leave the battle even without an explicit exhaust flag.
const power = { ...card, instanceId: 'power-test', type: 'Power', target: 'Self', effects: [] };
setup({ hand: [power], resolveQueue: () => {}, drawPile: [], discardPile: [], exhaustPile: [] });
store.getState().playCard(power.instanceId);
const playedPower = store.getState().playingCards.find(played => played.card.instanceId === power.instanceId);
assert.equal(playedPower.isExhausting, true);
store.getState().cleanupPlayingCard(playedPower.id);
assert.equal(store.getState().exhaustPile.length, 0, 'visual cleanup cannot move a card');
assert.equal(store.getState().resolvingCards.length, 1);
store.setState({ resolveQueue });
store.getState().resolveQueue();
while (store.getState().isResolving || store.getState().actionQueue.length) await new Promise(resolve => setTimeout(resolve, 5));
assert.equal(store.getState().exhaustPile.length, 1);
assert.equal(store.getState().resolvingCards.length, 0);
assert.equal(store.getState().discardPile.length, 0);
store.getState().drawCards(5);
assert.equal(store.getState().hand.length, 0);
store.setState({ resolveQueue });
store.getState().initializeRun('cleanup');
console.log('PASS: no-op upgrades do not spend rest; Power cards exhaust and cannot be redrawn');

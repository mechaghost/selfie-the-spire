import assert from 'node:assert/strict';
import { build } from 'esbuild';
await build({ stdin: { contents: `export { useGameStore } from './src/store/gameStore'; export { enemies, selectEnemyIntent } from './src/data/enemies'; export { RNG } from './src/core/rng'; export { createCardInstance } from './src/data/cards';`, resolveDir: process.cwd() }, outfile: 'tests/.e2e-out/tactics.mjs', bundle: true, platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' } });
const { useGameStore: store, enemies, selectEnemyIntent, RNG, createCardInstance } = await import('./.e2e-out/tactics.mjs');
for (const definition of Object.values(enemies)) {
    for (const { intent } of definition.aiPatterns) {
        if (intent.hits) assert.equal(intent.effects.filter(e => e.type === 'Damage' && e.target === 'Target').length, intent.hits, `${definition.id}: every advertised hit must resolve`);
    }
    const opening = selectEnemyIntent({ templateId: definition.id, hp: 100, maxHp: 100, intent: null }, new RNG('opening'));
    const openers = definition.aiPatterns.filter(p => p.condition === 'Turn1');
    if (openers.length) assert.ok(openers.some(p => p.intent === opening), `${definition.id}: opener priority`);
    const lowHp = definition.aiPatterns.filter(p => p.condition === 'BelowHalfHP');
    if (lowHp.length) {
        const next = selectEnemyIntent({ templateId: definition.id, hp: 40, maxHp: 100, intent: opening }, new RNG('phase'));
        assert.ok(lowHp.some(p => p.intent === next), `${definition.id}: low-HP phase priority`);
    }
    const sequence = () => {
        const rng = new RNG('tactics');
        let enemy = { templateId: definition.id, hp: 100, maxHp: 100, intent: null };
        return Array.from({length: 20}, () => {
            const next = selectEnemyIntent(enemy, rng);
            assert.ok(next);
            const eligible = definition.aiPatterns.filter(p => !p.condition || p.condition === 'Always');
            if (enemy.intent && new Set(eligible.map(p => JSON.stringify(p.intent.effects))).size > 1) {
                assert.notDeepEqual(next.effects, enemy.intent.effects, `${definition.id}: varied moves`);
            }
            enemy = { ...enemy, intent: next };
            return next;
        });
    };
    assert.deepEqual(sequence(), sequence(), `${definition.id}: deterministic moves`);
}
async function settle() {
    const deadline = Date.now() + 15000;
    while (store.getState().isResolving || store.getState().actionQueue.length) {
        assert.ok(Date.now() < deadline, 'combat queue completes');
        await new Promise(resolve => setTimeout(resolve, 20));
    }
}
store.getState().initializeRun('block-lifetime');
const defender = { id: 'defender', templateId: 'dumpster_crawler', name: 'Test defender', hp: 100, maxHp: 100, block: 17, statuses: [], intent: { type: 'Defend', block: 8, effects: [{type: 'Block', amount: 8, target: 'Self'}] } };
store.setState({ inCombat: true, isPlayerTurn: true, enemies: [defender], hand: [], player: {...store.getState().player, block: 9} });
store.getState().endTurn(); await settle();
assert.equal(store.getState().enemies[0].block, 8, 'old enemy Block expires; new Block survives into player turn');
assert.equal(store.getState().player.block, 0, 'player Block expires at player turn start');
const jab = createCardInstance('neon_jab');
store.setState({ hand: [jab] });
store.getState().playCard(jab.instanceId, 'defender'); await settle();
assert.equal(store.getState().enemies[0].hp, 100, 'enemy defense absorbs the attack');
assert.equal(store.getState().enemies[0].block, 2, 'attack consumes enemy Block');
store.getState().initializeRun('cleanup');
console.log('PASS: enemy hit contracts, deterministic varied moves, Block expiration and damage absorption');

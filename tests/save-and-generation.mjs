import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/.e2e-out', { recursive: true });
await build({ entryPoints: ['src/store/gameStore.ts'], outfile: 'tests/.e2e-out/migration.mjs', bundle: true, platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' } });
const oldCard = { id: 'old', instanceId: 'preserve-me', name: 'Old card', type: 'Skill', cost: 1, target: 'Self', description: 'Wrong old text', effects: [{ type: 'Heal', amount: 4, target: 'Self' }, { type: 'Block', amount: 7, target: 'Self' }] };
const pileKeys = ['masterDeck', 'drawPile', 'hand', 'discardPile', 'exhaustPile', 'cardRewards', 'shopCards', 'generatedCards'];
const oldSave = { seed: 'migration', floor: 0, inCombat: false, isPlayerTurn: false, combatResult: null, enemies: [],
    player: { id: 'player', name: 'Legacy hero', hp: 80, maxHp: 80, block: 0, statuses: [], energy: 3, maxEnergy: 3, gold: 99 },
    ...Object.fromEntries(pileKeys.map(key => [key, [oldCard]])) };
globalThis.localStorage = { getItem: () => JSON.stringify(oldSave), setItem: () => {}, removeItem: () => {} };
const { useGameStore } = await import('./.e2e-out/migration.mjs');
for (const key of pileKeys) {
    const migrated = useGameStore.getState()[key][0];
    assert.equal(migrated.description, 'Heal 4 HP. Gain 7 Block.');
    assert.equal(migrated.instanceId, oldCard.instanceId);
    assert.deepEqual(migrated.effects, oldCard.effects);
}
await mkdir('server/node_modules/.cache/copy-audit', { recursive: true });
await build({ entryPoints: ['server/src/routes/character.ts'], outfile: 'server/node_modules/.cache/copy-audit/route.mjs', bundle: true, packages: 'external', platform: 'node', format: 'esm' });
const savedKey = process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY;
try {
    const { characterRoute } = await import('../server/node_modules/.cache/copy-audit/route.mjs');
    const response = await characterRoute.request('/generate-character', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: 'synthetic-no-provider-fixture' }) });
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.match(result.error, /starter hero/);
    assert.equal(result.character, undefined);
} finally {
    if (savedKey !== undefined) process.env.GEMINI_API_KEY = savedKey;
}
console.log('PASS: saved text migrates across all eight card lists without changing effects/IDs; unconfigured generation fails honestly without a provider call');

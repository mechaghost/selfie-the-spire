import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/.e2e-out', { recursive: true });
await build({ stdin: { contents: `export { CARD_DATABASE, upgradeCard, canUpgradeCard } from './src/data/cards'; export { ARCHETYPES } from './server/src/services/archetypes'; export { attackDamage } from './src/core/combatMath'; export { describeCardEffects } from './src/core/cardText';`, resolveDir: process.cwd() }, outfile: 'tests/.e2e-out/copy.mjs', bundle: true, platform: 'node', format: 'esm' });
const { CARD_DATABASE, upgradeCard, ARCHETYPES, describeCardEffects, attackDamage, canUpgradeCard } = await import('./.e2e-out/copy.mjs');
// Upgrading Block must not change an earlier healing or status amount in the text.
assert.equal(upgradeCard(CARD_DATABASE.rally).description, 'Heal 4 HP. Gain 7 Block.');
const regen = ARCHETYPES.concrete.cards.find(card => card.name === 'Regen');
assert.equal(upgradeCard(regen).description, 'Gain 4 Regen. Gain 6 Block. Exhaust.');
const entangle = ARCHETYPES.concrete.cards.find(card => card.name === 'Entangle');
assert.equal(upgradeCard(entangle).description, 'Apply 2 Weak to the selected enemy. Gain 7 Block.');
// Only the first hit is upgraded; do not claim all three hits increased.
assert.equal(upgradeCard(CARD_DATABASE.ricochet).description, 'Deal 7 damage to a random enemy. Deal 4 damage to a random enemy. Deal 4 damage to a random enemy.');
assert.match(CARD_DATABASE.surf.description, /random card/);
assert.equal(upgradeCard(CARD_DATABASE.rewind).cost, 0);
assert.equal(upgradeCard(CARD_DATABASE.rewind).description, 'Draw 3 cards.');
const archetypeCards = Object.values(ARCHETYPES).flatMap(archetype => archetype.cards);
assert.equal(archetypeCards.length, 50);
for (const card of [...Object.values(CARD_DATABASE), ...archetypeCards]) {
    const description = describeCardEffects(card);
    assert.ok(description.length > 0, card.name);
    assert.ok(!/undefined|NaN/.test(description), card.name);
    if (card.exhausts) assert.match(description, /Exhaust\.$/, card.name);
    if (card.exhausts) assert.match(card.description, /Exhaust\./, card.name);
}
console.log(`PASS: copy contracts across ${Object.keys(CARD_DATABASE).length} base cards and ${archetypeCards.length} archetype cards; mixed-effect upgrades, random discard, repeated hits, exhaust, and marketing count`);

assert.equal(canUpgradeCard(CARD_DATABASE.surf), false);
assert.equal(upgradeCard(CARD_DATABASE.surf), CARD_DATABASE.surf);
assert.equal(canUpgradeCard(CARD_DATABASE.shiv_toss), true);
assert.equal(canUpgradeCard(upgradeCard(CARD_DATABASE.shiv_toss)), false);
const strengthWeak = [{ id: 'strength', amount: 2 }, { id: 'weak', amount: 1 }];
assert.equal(attackDamage(7, strengthWeak, [{ id: 'vulnerable', amount: 1 }]), 9);
assert.equal(attackDamage(7, [{ id: 'weak', amount: 0 }]), 7);
assert.equal(attackDamage(1, [{ id: 'strength', amount: -3 }]), 1);
assert.match(describeCardEffects({ type: 'Power', effects: [] }), /Exhaust/);
console.log('PASS: upgrade eligibility, one-use Power text, and damage modifier rounding');

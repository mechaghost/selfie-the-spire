/** Check only persisted game data; never spread untrusted save fields into store methods. */
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonnegative = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const pileNames = ['masterDeck', 'drawPile', 'hand', 'discardPile', 'exhaustPile'] as const;
const effectTypes = ['Damage', 'Block', 'ApplyStatus', 'Heal', 'Draw', 'Discard', 'Exhaust'];
function card(value: unknown): value is Record<string, unknown> & { instanceId: string } {
    return record(value) && typeof value.id === 'string' && typeof value.instanceId === 'string' && value.instanceId.length > 0 &&
        typeof value.name === 'string' && typeof value.description === 'string' && nonnegative(value.cost) &&
        ['Attack', 'Skill', 'Power', 'Status', 'Curse'].includes(String(value.type)) &&
        ['Enemy', 'AllEnemies', 'Self', 'None'].includes(String(value.target)) &&
        Array.isArray(value.effects) && value.effects.every(effect => record(effect) && effectTypes.includes(String(effect.type)) &&
            ['Self', 'Target', 'AllEnemies', 'RandomEnemy', 'None'].includes(String(effect.target)) &&
            (effect.amount === undefined || nonnegative(effect.amount)));
}
function entity(value: unknown): boolean {
    return record(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
        nonnegative(value.hp) && nonnegative(value.maxHp) && value.maxHp > 0 && value.hp <= value.maxHp && nonnegative(value.block) &&
        Array.isArray(value.statuses) && value.statuses.every(status => record(status) && typeof status.id === 'string' && nonnegative(status.amount));
}
export function validateSave(data: unknown): asserts data is Record<string, unknown> {
    if (!record(data) || typeof data.seed !== 'string' || !data.seed || !entity(data.player) ||
        !record(data.player) || !nonnegative(data.player.energy) || !nonnegative(data.player.maxEnergy) || !nonnegative(data.player.gold) ||
        !Number.isInteger(data.floor) || !nonnegative(data.floor) || data.floor > 9 ||
        typeof data.inCombat !== 'boolean' || typeof data.isPlayerTurn !== 'boolean' ||
        ![null, 'victory', 'defeat'].includes(data.combatResult as null | string) ||
        !Array.isArray(data.enemies) || !data.enemies.every(entity) ||
        pileNames.some(key => !Array.isArray(data[key]) || !(data[key] as unknown[]).every(card))) {
        throw new Error('Incomplete or invalid run data');
    }
    for (const key of ['cardRewards', 'shopCards']) {
        if (!Array.isArray(data[key]) || !(data[key] as unknown[]).every(card)) throw new Error('Invalid reward/shop cards');
    }
    if (data.inCombat && !data.isPlayerTurn && !data.combatResult) throw new Error('Interrupted enemy turn has no recoverable queue');
    const deck = data.masterDeck as Array<{ instanceId: string }>;
    const ids = deck.map(card => card.instanceId);
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate master deck instance');
    if (data.inCombat) {
        const owned = ['drawPile', 'hand', 'discardPile', 'exhaustPile'].flatMap(key => (data[key] as typeof deck).map(card => card.instanceId));
        if (owned.length !== ids.length || new Set(owned).size !== owned.length || owned.some(id => !ids.includes(id))) {
            throw new Error('Incomplete or duplicated combat card ownership');
        }
    }
}

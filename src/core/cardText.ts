import { Card, Effect } from './models';
import { STATUS_REGISTRY } from '../data/statusEffects';

/** Describe the ordered effect payload, including mixed targets and random selection. */
export function describeCardEffects(card: Pick<Card, 'effects' | 'exhausts'> & { type?: Card['type'] }): string {
    const sentences = card.effects.map((effect: Effect) => {
        const n = effect.amount ?? 0;
        const recipient = effect.target === 'AllEnemies' ? 'all enemies' : effect.target === 'RandomEnemy' ? 'a random enemy' : effect.target === 'Target' ? 'the selected enemy' : 'yourself';
        switch (effect.type) {
            case 'Damage': return `Deal ${n} damage to ${recipient}.`;
            case 'Block': return effect.target === 'Self' ? `Gain ${n} Block.` : `Give ${recipient} ${n} Block.`;
            case 'ApplyStatus': return `${effect.target === 'Self' ? 'Gain' : 'Apply'} ${n} ${STATUS_REGISTRY[effect.statusId ?? '']?.name ?? effect.statusId}${effect.target === 'Self' ? '' : ` to ${recipient}`}.`;
            case 'Heal': return effect.target === 'Self' ? `Heal ${n} HP.` : `Heal ${recipient} for ${n} HP.`;
            case 'Draw': return `Draw ${n} ${n === 1 ? 'card' : 'cards'}.`;
            case 'Discard': return `Discard ${n} random ${n === 1 ? 'card' : 'cards'} from your hand.`;
            case 'Exhaust': return '';
        }
    }).filter(Boolean);
    if (card.exhausts || card.type === 'Power') sentences.push('Exhaust.');
    return sentences.join(' ');
}

export const STATUS_HELP: Record<string, string> = {
    vulnerable: 'Takes 50% more attack damage while active.',
    weak: 'Deals 25% less attack damage while active.',
    strength: 'Adds 1 damage per stack to each attack hit.',
    dexterity: 'Adds 1 Block per stack whenever an effect grants Block.',
    burn: 'At the start of its turn, loses 1 HP per stack, ignoring Block. Then loses 1 stack.',
    thorns: 'When hit by an attack, deals 1 damage per stack back to the attacker. Block can absorb it.',
    regen: 'At the start of its turn, heals 1 HP per stack, up to max HP. Then loses 1 stack.',
};

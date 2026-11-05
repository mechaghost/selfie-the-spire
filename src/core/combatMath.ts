import { StatusEffect } from './models';
import { STATUS_REGISTRY } from '../data/statusEffects';

/** Shared rounding and modifier order for combat and current-state previews. */
export function attackDamage(base: number, source: StatusEffect[] = [], target: StatusEffect[] = []): number {
    let damage = base;
    for (const status of source) if (status.amount > 0) damage += (STATUS_REGISTRY[status.id]?.flatDamageGivenPerStack ?? 0) * status.amount;
    for (const status of source) {
        const multiplier = STATUS_REGISTRY[status.id]?.damageGivenMultiplier;
        if (status.amount > 0 && multiplier) damage = Math.floor(damage * multiplier);
    }
    for (const status of target) {
        const multiplier = STATUS_REGISTRY[status.id]?.damageTakenMultiplier;
        if (status.amount > 0 && multiplier) damage = Math.floor(damage * multiplier);
    }
    return Math.max(0, damage);
}

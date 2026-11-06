import { EnemyIntent, StatusEffect } from './models';
import { attackDamage, blockGain } from './combatMath';
import { STATUS_REGISTRY } from '../data/statusEffects';
/** Derived from executable effects, never the optional decorative intent.damage/hits fields. */
export function intentView(intent: EnemyIntent | null, source: StatusEffect[], target: StatusEffect[]) {
    if(!intent)return {previewKind:'current' as const,attack:null,block:0,statuses:[] as string[],healing:0,label:'Preparing'};
    const damages=intent.effects.filter(effect=>effect.type==='Damage' && effect.target!=='Self').map(effect=>attackDamage(effect.amount??0,source,target));
    const attack=damages.length ? damages.every(n=>n===damages[0]) ? `${damages[0]}${damages.length>1 ? ` × ${damages.length}` : ''}` : damages.join(' + ') : null;
    const block=intent.effects.filter(effect=>effect.type==='Block' && effect.target==='Self').reduce((n,e)=>n+blockGain(e.amount??0,source),0);
    const healing=intent.effects.filter(effect=>effect.type==='Heal').reduce((n,e)=>n+(e.amount??0),0);
    const statuses=intent.effects.filter(effect=>effect.type==='ApplyStatus').map(e=>`${e.target==='Self'?'Gains':'Applies'} ${e.amount??0} ${STATUS_REGISTRY[e.statusId??'']?.name ?? e.statusId ?? 'status'}`);
    const parts=[attack?`Attack ${attack}`:null,block?`Block ${block}`:null,healing?`Heal ${healing}`:null,statuses.length?'Status':null].filter(Boolean);
    return {previewKind:'current' as const,attack,block,statuses,healing,label:parts.join(' · ') || 'Preparing'};
}

export function describeIntent(intent: EnemyIntent | null, sourceStatuses: StatusEffect[] = [], targetStatuses: StatusEffect[] = []): string {
    if (!intent) return 'Waiting...';
    const parts = intent.effects.map(effect => {
        const n = effect.amount ?? 0;
        const status = STATUS_REGISTRY[effect.statusId ?? '']?.name ?? effect.statusId ?? 'status';
        switch (effect.type) {
            case 'Damage': return `Deals ${attackDamage(n, sourceStatuses, effect.target === 'Self' ? sourceStatuses : targetStatuses)} damage${effect.target === 'Self' ? ' to itself' : ' to you'}`;
            case 'Block': return effect.target==='Self' ? `Gains ${blockGain(n,sourceStatuses)} Block` : `Grants you ${blockGain(n,targetStatuses)} Block`;
            case 'ApplyStatus': return effect.target === 'Self' ? `Gains ${n} ${status}` : `Applies ${n} ${status} to you`;
            case 'Heal': return effect.target==='Self' ? `Heals ${n} HP` : `Heals you for ${n} HP`;
            default: return '';
        }
    }).filter(Boolean);
    if(!parts.length)return 'Preparing an unknown action.';
    const damageNote=intent.effects.some(effect=>effect.type==='Damage') ? ' Damage is shown before Block and may change if statuses change.' : '';
    return `Current preview: ${parts.join('. ')}.${damageNote}`;
}

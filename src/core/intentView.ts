import { EnemyIntent, StatusEffect } from './models';
import { attackDamage } from './combatMath';
/** Derived from executable effects, never the optional decorative intent.damage/hits fields. */
export function intentView(intent: EnemyIntent | null, source: StatusEffect[], target: StatusEffect[]) {
    if(!intent)return {attack:null,block:0,statuses:[] as string[],healing:0,label:'Preparing'};
    const damages=intent.effects.filter(effect=>effect.type==='Damage' && effect.target!=='Self').map(effect=>attackDamage(effect.amount??0,source,target));
    const attack=damages.length ? damages.every(n=>n===damages[0]) ? `${damages[0]}${damages.length>1 ? ` × ${damages.length}` : ''}` : damages.join(' + ') : null;
    const block=intent.effects.filter(effect=>effect.type==='Block').reduce((n,e)=>n+(e.amount??0),0);
    const healing=intent.effects.filter(effect=>effect.type==='Heal').reduce((n,e)=>n+(e.amount??0),0);
    const statuses=intent.effects.filter(effect=>effect.type==='ApplyStatus').map(e=>`${e.target==='Self'?'Gains':'Applies'} ${e.amount??0} ${e.statusId??'status'}`);
    const parts=[attack?`Attack ${attack}`:null,block?`Block ${block}`:null,healing?`Heal ${healing}`:null,statuses.length?'Status':null].filter(Boolean);
    return {attack,block,statuses,healing,label:parts.join(' · ') || 'Preparing'};
}

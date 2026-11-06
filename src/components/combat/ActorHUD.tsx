import type {Entity} from '../../core/models';
import type {intentView} from '../../core/intentView';
import {ActorStatusSummary} from './ActorStatusSummary';

type Stats=Pick<Entity,'hp'|'maxHp'|'block'|'statuses'>;

/** Shared by the live arena and its composition review; parent owns interaction. */
export function HeroHUDContents({entity,width}:{entity:Stats;width:number}) {
    return <><strong>You</strong><span>{entity.hp}/{entity.maxHp}</span><span>◆ {entity.block}</span><ActorStatusSummary statuses={entity.statuses} width={width}/></>;
}

export function EnemyHUDContents({entity,index,width,intent}:{entity:Stats & {name:string};index:number;width:number;intent:ReturnType<typeof intentView>}) {
    return <>
        <strong>{index+1}. {entity.name}</strong><span>{entity.hp}/{entity.maxHp}</span>
        <b title={entity.hp>0 && intent.attack ? 'Current damage preview. Status changes before this attack can change damage. Inspect for details.' : undefined} aria-label={entity.hp>0 && intent.attack ? `Current damage preview: ${intent.attack}${intent.block ? `; gains ${intent.block} Block` : ''}` : entity.hp>0 ? intent.label : undefined}>{entity.hp<=0 ? 'Defeated' : intent.attack ? `≈ ⚔ ${intent.attack}${intent.block?` ◆ ${intent.block}`:''}${intent.statuses.length?' ✦':''}` : [intent.block?`◆ ${intent.block}`:null,intent.healing?`+${intent.healing} HP`:null,intent.statuses.length?'✦':null].filter(Boolean).join(' ') || 'Preparing'}</b>
        {entity.hp>0 && <small className="actor-block-effects" title={`${entity.block} Block${entity.statuses.length ? `; ${entity.statuses.length} active effects. Inspect for details.` : ''}`}><span>◆{entity.block}</span><ActorStatusSummary statuses={entity.statuses} width={width-18-String(entity.block).length*9}/></small>}
    </>;
}

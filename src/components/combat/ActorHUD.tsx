import type {Entity} from '../../core/models';
import type {intentView} from '../../core/intentView';
import {ActorStatusSummary} from './ActorStatusSummary';

type Stats=Pick<Entity,'hp'|'maxHp'|'block'|'statuses'>;

function HealthTrack({hp,maxHp}:Stats) {
    return <span className="actor-health-track" aria-hidden="true"><span style={{width:`${Math.max(0,Math.min(100,hp/maxHp*100))}%`}}/></span>;
}

/** Shared by the live arena and its composition review; parent owns interaction. */
export function HeroHUDContents({entity,width}:{entity:Stats;width:number}) {
    return <><strong>You</strong><span className="actor-vitals">{entity.hp}/{entity.maxHp} HP</span>
        <span className="actor-block-effects">{entity.block>0 && <span>◆{entity.block}</span>}<ActorStatusSummary statuses={entity.statuses} width={width-10-(entity.block>0?20+String(entity.block).length*8:0)}/></span><HealthTrack {...entity}/></>;
}

export function EnemyHUDContents({entity,width,intent}:{entity:Stats & {name:string};width:number;intent:ReturnType<typeof intentView>}) {
    const attack = width<92 ? `⚔ ${intent.attack?.replace(/ × /g,'×')}` : `≈ ⚔ ${intent.attack}`;
    return <>
        <strong title={entity.name}>{entity.name}</strong>
        <b className="actor-intent" title={entity.hp>0 && intent.attack ? 'Current damage preview. Status changes before this attack can change damage. Inspect for details.' : undefined} aria-label={entity.hp>0 && intent.attack ? `Current damage preview: ${intent.attack}${intent.block ? `; gains ${intent.block} Block` : ''}` : entity.hp>0 ? intent.label : undefined}>{entity.hp<=0 ? 'Defeated' : intent.attack ? `${attack}${intent.block && width>=92?` ◆ ${intent.block}`:''}${intent.statuses.length && width>=92?' ✦':''}` : [intent.block?`◆ ${intent.block}`:null,intent.healing?`+${intent.healing} HP`:null,intent.statuses.length?'✦':null].filter(Boolean).join(' ') || 'Preparing'}</b>
        <span className="actor-vitals">{entity.hp}/{entity.maxHp}{entity.block>0 && (width>=95 || entity.statuses.length===0) && <span className="actor-block-effects">◆{entity.block}</span>}
            {width>=95 && <ActorStatusSummary statuses={entity.statuses} width={width-49-(entity.block>0?20+String(entity.block).length*8:0)}/>}
            {width<95 && entity.statuses.length>0 && <span className="actor-status-overflow">+{entity.statuses.length}</span>}
        </span>
        <HealthTrack {...entity}/>
    </>;
}

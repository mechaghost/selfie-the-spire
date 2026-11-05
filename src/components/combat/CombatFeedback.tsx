import { useEffect, useRef, useState } from 'react';
import { ImpactNotice, subscribeImpacts } from '../../rendering/CombatPresentation';
import { BattleLayout } from '../../rendering/battleLayout';
interface Feedback extends ImpactNotice {key:string}
export function impactLabel(impact:ImpactNotice):string {
    if(impact.effect==='blocked')return `Blocked ${Math.abs(impact.blockDelta)}`;
    if(impact.effect==='block')return `+${impact.blockDelta} Block`;
    if(impact.effect==='heal')return `+${impact.hpDelta} HP`;
    if(impact.effect==='status')return impact.label ?? 'Status';
    const prefix=impact.effect==='burn'?'Burn ':impact.effect==='thorns'?'Spikes ':'';
    return `${prefix}${impact.hpDelta<0 ? impact.hpDelta : 'Blocked'}${impact.blockDelta<0 ? ` · ◆ ${Math.abs(impact.blockDelta)}` : ''}`;
}
/** Result feedback is independent of graphics availability and cannot mutate battle state. */
export function CombatFeedback({layout}:{layout:BattleLayout}) {
    const [items,setItems]=useState<Feedback[]>([]);
    const seen=useRef(new Set<string>());
    useEffect(()=>{
        const timers=new Set<ReturnType<typeof setTimeout>>();
        const unsubscribe=subscribeImpacts(notice=>{
            const key=`${notice.battleId}:${notice.actionId}:${notice.targetId}:${notice.effect}`;
            if(seen.current.has(key))return;
            seen.current.add(key);if(seen.current.size>128)seen.current.delete(seen.current.values().next().value!);
            setItems(previous=>[...previous.slice(-7),{...notice,key}]);
            const timer=setTimeout(()=>{timers.delete(timer);setItems(previous=>previous.filter(item=>item.key!==key));},1100);timers.add(timer);
        });
        return()=>{unsubscribe();timers.forEach(clearTimeout);seen.current.clear();};
    },[]);
    return <div className="combat-feedback" aria-live="polite" aria-atomic="false">
        {items.map((item,index)=>{
            const slot=item.targetId==='player'?layout.hero:layout.enemies.find(slot=>slot.id===item.targetId);
            if(!slot)return null;
            const offset=items.slice(0,index).filter(other=>other.targetId===item.targetId).length*23;
            return <span key={item.key} className={`combat-impact impact-${item.effect}`} style={{left:slot.foot.x,top:Math.max(8,slot.art.y+slot.art.height*.35-offset)}}>{impactLabel(item)}</span>;
        })}
    </div>;
}

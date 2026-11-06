import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCombatInteraction } from '../../store/combatInteraction';
import { ACTOR_VISUALS, resolveAppearance } from '../../data/actorVisuals';
import { locationForFloor } from '../../data/locations';
import { battleLayout } from '../../rendering/battleLayout';
import { intentView } from '../../core/intentView';
import { setCombatMotionMode } from '../../core/combatTiming';
import { ActorClip } from '../../core/battleVisualModels';
import { CombatFeedback } from './CombatFeedback';
import { BattleStage } from './BattleStage';
import { InspectionDialog } from '../ui/CardInspector';
import { describeIntent, describeStatuses } from './EntityPanel';
import './BattleArena.css';
export function BattleArena() {
    const {player,enemies,floor,isBossFloor,activeAnimations,combatResult} = useGameStore(state=>({player:state.player,enemies:state.enemies,floor:state.floor,isBossFloor:state.isBossFloor,activeAnimations:state.activeAnimations,combatResult:state.combatResult}));
    const {mode,commit} = useCombatInteraction();
    const root=useRef<HTMLDivElement>(null);
    const [noticeHost,setNoticeHost]=useState<HTMLDivElement|null>(null);
    const [size,setSize]=useState({width:320,height:200});
    const [inspected,setInspected]=useState<string|null>(null);
    const [reducedMotion,setReducedMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(()=>{setCombatMotionMode(reducedMotion ? 'reduced' : 'normal');return()=>setCombatMotionMode('normal');},[reducedMotion]);
    useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>setReducedMotion(media.matches);media.addEventListener('change',changed);return()=>media.removeEventListener('change',changed);},[]);
    useLayoutEffect(()=>{
        const observer=new ResizeObserver(([entry])=>{setSize({width:Math.max(280,entry.contentRect.width),height:Math.max(140,entry.contentRect.height)});useGameStore.getState().resetDragState();});
        observer.observe(root.current!);return()=>observer.disconnect();
    },[]);
    const ids=enemies.map(enemy=>enemy.id).join('|');
    const layout=useMemo(()=>battleLayout(size.width,size.height,ids.split('|').filter(Boolean),isBossFloor),[size,ids,isBossFloor]);
    useLayoutEffect(()=>{
        const origin=root.current!.getBoundingClientRect();
        const bounds:Record<string,DOMRect>={};
        for(const slot of [layout.hero,...layout.enemies]) bounds[slot.id]=new DOMRect(origin.left+slot.target.x,origin.top+slot.target.y,slot.target.width,slot.target.height);
        useGameStore.setState({entityBounds:bounds});
        return()=>{useGameStore.setState({entityBounds:{}});};
    },[layout]);
    const motionFor=(id:string)=>{if(id==='player' && combatResult==='victory')return {clip:'celebrate' as ActorClip,motionToken:'victory'};const animation=[...activeAnimations].reverse().find(animation=>animation.targetId===id && animation.type==='lunge');return {clip:(animation?'attack':'idle') as ActorClip,motionToken:animation?.id};};
    const snapshot=useMemo(()=>({layout,location:locationForFloor(floor),reducedMotion,actors:[
        {id:'player',visual:resolveAppearance(player.combatAppearance),defeated:player.hp<=0,...motionFor('player')},
        ...enemies.map(enemy=>({id:enemy.id,visual:ACTOR_VISUALS[enemy.templateId] ?? ACTOR_VISUALS.alley_rat,defeated:enemy.hp<=0,...motionFor(enemy.id)})),
    ]}),[layout,floor,reducedMotion,player.hp,player.combatAppearance,enemies,activeAnimations,combatResult]);
    const entity=inspected==='player' ? player : enemies.find(enemy=>enemy.id===inspected);
    return <div className="battle-arena"><div className="battle-arena-content" ref={root}>
        <BattleStage snapshot={snapshot} noticeHost={noticeHost} forceFallback={import.meta.env.DEV && new URLSearchParams(location.search).has('fallback')}/>
        <CombatFeedback layout={layout}/>
        <button className="actor-hero-hud" style={{left:layout.hero.hud.x,top:layout.hero.hud.y,width:layout.hero.hud.width}} onClick={()=>setInspected('player')} aria-label={`Inspect ${player.name}, ${player.hp} of ${player.maxHp} HP, ${player.block} Block. ${describeStatuses(player.statuses).map(status=>status.split(' — ')[0]).join('; ') || 'No active effects.'}`}><strong>You</strong><span>{player.hp}/{player.maxHp}</span><span>◆ {player.block}</span>{player.statuses.length>0 && <span title="Inspect to read active effects">✦ {player.statuses.length}</span>}</button>
        {enemies.map(enemy=>{
            const slot=layout.enemies.find(slot=>slot.id===enemy.id)!;
            const intent=intentView(enemy.intent,enemy.statuses,player.statuses);
            return <button key={enemy.id} data-combat-target={enemy.id} data-entity-id={enemy.id} className={`actor-target ${mode==='targeting'?'is-selectable':''}`} disabled={enemy.hp<=0}
                style={{left:slot.target.x,top:slot.target.y,width:slot.target.width,height:slot.target.height}}
                aria-label={enemy.hp<=0 ? `${enemy.name}, defeated` : `${mode==='targeting'?'Target':'Inspect'} ${enemy.name}, ${enemy.hp} of ${enemy.maxHp} HP, ${enemy.block} Block. ${intent.label}. ${describeStatuses(enemy.statuses).map(status=>status.split(' — ')[0]).join('; ') || 'No active effects.'}`}
                onClick={event=>{event.stopPropagation();if(mode==='targeting')commit(enemy.id);else setInspected(enemy.id);}}>
                <span className="actor-hud" style={{left:slot.hud.x-slot.target.x,top:slot.hud.y-slot.target.y,width:slot.hud.width}}>
                    <strong>{slot.index+1}. {enemy.name}</strong><span>{enemy.hp}/{enemy.maxHp}</span>
                    <b title={enemy.hp>0 && intent.attack ? 'Current damage preview. Status changes before this attack can change damage. Inspect for details.' : undefined} aria-label={enemy.hp>0 && intent.attack ? `Current damage preview: ${intent.attack}${intent.block ? `; gains ${intent.block} Block` : ''}` : enemy.hp>0 ? intent.label : undefined}>{enemy.hp<=0 ? 'Defeated' : intent.attack ? `≈ ⚔ ${intent.attack}${intent.block?` ◆ ${intent.block}`:''}${intent.statuses.length?' ✦':''}` : [intent.block?`◆ ${intent.block}`:null,intent.healing?`+${intent.healing} HP`:null,intent.statuses.length?'✦':null].filter(Boolean).join(' ') || 'Preparing'}</b>
                    {enemy.hp>0 && <small title={`${enemy.block} Block${enemy.statuses.length ? `; ${enemy.statuses.length} active effects. Inspect for details.` : ''}`}>◆{enemy.block}{enemy.statuses.length ? ` ✦${enemy.statuses.length}` : ''}</small>}
                </span><span className="actor-slot-marker">{slot.index+1}</span>
            </button>;
        })}
        </div><div className="battle-notice-host" ref={setNoticeHost}/>
        {entity && <InspectionDialog title={entity.name} onClose={()=>setInspected(null)}>
            <p>{entity.hp}/{entity.maxHp} HP · {entity.block} Block</p>
            {'intent' in entity && <p>{describeIntent(entity.intent,entity.statuses,player.statuses)}</p>}
            {describeStatuses(entity.statuses).map(line=><p key={line}>{line}</p>)}
            {!entity.statuses.length && <p>No active effects.</p>}
        </InspectionDialog>}
    </div>;
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCombatInteraction } from '../../store/combatInteraction';
import { ACTOR_VISUALS, resolveAppearance } from '../../data/actorVisuals';
import { locationForFloor } from '../../data/locations';
import { actorShape } from '../../rendering/actorShape';
import { targetAtPoint } from '../../core/targeting';
import { arenaAtPoint } from '../../core/arenaDrag';
import { battleLayout } from '../../rendering/battleLayout';
import { intentView } from '../../core/intentView';
import { setCombatMotionMode } from '../../core/combatTiming';
import { ActorClip } from '../../core/battleVisualModels';
import { CombatFeedback } from './CombatFeedback';
import { BattleStage } from './BattleStage';
import { HeroHUDContents, EnemyHUDContents } from './ActorHUD';
import { InspectionDialog } from '../ui/CardInspector';
import { StatusIcon } from '../ui/StatusIcon';
import { describeIntent, describeStatuses } from './EntityPanel';
import './BattleArena.css';
export function BattleArena({targetControls='arena'}:{targetControls?:'arena'|'list'}) {
    const {player,enemies,floor,isBossFloor,activeAnimations,combatResult} = useGameStore(state=>({player:state.player,enemies:state.enemies,floor:state.floor,isBossFloor:state.isBossFloor,activeAnimations:state.activeAnimations,combatResult:state.combatResult}));
    const {mode,commit} = useCombatInteraction();
    const root=useRef<HTMLDivElement>(null);
    const [noticeHost,setNoticeHost]=useState<HTMLDivElement|null>(null);
    const [size,setSize]=useState({width:320,height:200});
    const [hovered,setHovered]=useState<string|null>(null);
    const [focused,setFocused]=useState<string|null>(null);
    const dragTarget = useGameStore(state => {
        const drag=state.dragState;
        if(!drag.isActive) return null;
        if(drag.targetType==='Enemy') return targetAtPoint(state.entityBounds,state.enemies.filter(enemy=>enemy.hp>0).map(enemy=>enemy.id),drag.currentX,drag.currentY);
        return arenaAtPoint(drag.currentX,drag.currentY) ? drag.targetType==='AllEnemies' ? 'all' : 'player' : null;
    });
    const dragging=useGameStore(state=>state.dragState.isActive);
    const [inspected,setInspected]=useState<string|null>(null);
    const [reducedMotion,setReducedMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(()=>{setCombatMotionMode(reducedMotion ? 'reduced' : 'normal');return()=>setCombatMotionMode('normal');},[reducedMotion]);
    useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>setReducedMotion(media.matches);media.addEventListener('change',changed);return()=>media.removeEventListener('change',changed);},[]);
    useLayoutEffect(()=>{
        const observer=new ResizeObserver(([entry])=>{setSize({width:Math.max(280,entry.contentRect.width),height:Math.max(140,entry.contentRect.height)});useGameStore.getState().resetDragState();});
        observer.observe(root.current!);return()=>observer.disconnect();
    },[]);
    const rosterKey=JSON.stringify(enemies.map(enemy=>[enemy.id,enemy.templateId]));
    const visuals=useMemo(()=>{
        const roster=JSON.parse(rosterKey) as [string,string][];
        return Object.fromEntries([
            ['player',resolveAppearance(player.combatAppearance)],
            ...roster.map(([id,templateId])=>[id,ACTOR_VISUALS[templateId] ?? ACTOR_VISUALS.alley_rat] as const),
        ]);
    },[rosterKey,player.combatAppearance]);
    const layout=useMemo(()=>battleLayout(size.width,size.height,Object.keys(visuals).filter(id=>id!=='player'),isBossFloor,
        Object.fromEntries(Object.entries(visuals).map(([id,visual])=>[id,actorShape(visual)]))),[size,visuals,isBossFloor]);
    useLayoutEffect(()=>{
        const origin=root.current!.getBoundingClientRect();
        const bounds:Record<string,DOMRect>={};
        for(const slot of [layout.hero,...layout.enemies]) bounds[slot.id]=new DOMRect(origin.left+slot.target.x,origin.top+slot.target.y,slot.target.width,slot.target.height);
        useGameStore.setState({entityBounds:bounds});
        return()=>{useGameStore.setState({entityBounds:{}});};
    },[layout]);
    const motionFor=(id:string)=>{if(id==='player' && combatResult==='victory')return {clip:'celebrate' as ActorClip,motionToken:'victory'};const animation=[...activeAnimations].reverse().find(animation=>animation.targetId===id && animation.type==='lunge');return {clip:(animation?'attack':'idle') as ActorClip,motionToken:animation?.id};};
    const hotActor=dragging ? dragTarget : hovered ?? focused;
    const choosing=mode==='targeting' && !dragging;
    const glowFor=(id:string)=>hotActor===id || (hotActor==='all' && id!=='player') ? 'active' as const : choosing && id!=='player' ? 'available' as const : undefined;
    const snapshot=useMemo(()=>({layout,location:locationForFloor(floor),reducedMotion,actors:[
        {id:'player',visual:visuals.player,glow:glowFor('player'),defeated:player.hp<=0,...motionFor('player')},
        ...enemies.map(enemy=>({id:enemy.id,visual:visuals[enemy.id],glow:glowFor(enemy.id),defeated:enemy.hp<=0,...motionFor(enemy.id)})),
    ]}),[layout,floor,reducedMotion,player.hp,visuals,enemies,activeAnimations,combatResult,hotActor,choosing]);
    const entity=inspected==='player' ? player : enemies.find(enemy=>enemy.id===inspected);
    return <div className="battle-arena"><div className="battle-arena-content" ref={root}>
        <BattleStage snapshot={snapshot} noticeHost={noticeHost} forceFallback={import.meta.env.DEV && new URLSearchParams(location.search).has('fallback')}/>
        <CombatFeedback layout={layout} actors={snapshot.actors}/>
        <button type="button" className="actor-hud actor-hero-hud" onPointerEnter={()=>setHovered('player')} onPointerLeave={()=>setHovered(null)} onFocus={()=>setFocused('player')} onBlur={()=>setFocused(null)} style={{left:layout.hero.hud.x,top:layout.hero.hud.y,width:layout.hero.hud.width,height:layout.hero.hud.height}} onClick={()=>setInspected('player')} aria-label={`Inspect ${player.name}, ${player.hp} of ${player.maxHp} HP, ${player.block} Block. ${describeStatuses(player.statuses).map(status=>status.split(' — ')[0]).join('; ') || 'No active effects.'}`}><HeroHUDContents entity={player} width={layout.hero.hud.width}/></button>
        {enemies.map(enemy=>{
            const slot=layout.enemies.find(slot=>slot.id===enemy.id)!;
            const intent=intentView(enemy.intent,enemy.statuses,player.statuses);
            const activate=()=>{if(mode==='targeting')commit(enemy.id);else setInspected(enemy.id);};
            return <div key={enemy.id}>
                <button type="button" className="actor-hud" tabIndex={-1} disabled={enemy.hp<=0}
                    onPointerEnter={()=>setHovered(enemy.id)} onPointerLeave={()=>setHovered(null)}
                    onClick={activate} aria-label={`${mode==='targeting'?'Target':'Inspect'} ${enemy.name} (slot ${slot.index+1} stats)`}
                    style={{left:slot.hud.x,top:slot.hud.y,width:slot.hud.width,height:slot.hud.height}}>
                    <EnemyHUDContents entity={enemy} width={slot.hud.width} intent={intent}/>
                </button>
                <button type="button" data-combat-target={enemy.id} data-entity-id={enemy.id} className={`actor-target ${mode==='targeting'?'is-selectable':''}`} disabled={enemy.hp<=0}
                tabIndex={mode==='targeting' && targetControls==='list' ? -1 : 0}
                style={{left:slot.target.x,top:slot.target.y,width:slot.target.width,height:slot.target.height}}
                aria-label={enemy.hp<=0 ? `${enemy.name}, slot ${slot.index+1}, defeated` : `${mode==='targeting'?'Target':'Inspect'} ${enemy.name}, slot ${slot.index+1}, ${enemy.hp} of ${enemy.maxHp} HP, ${enemy.block} Block. ${intent.label}. ${describeStatuses(enemy.statuses).map(status=>status.split(' — ')[0]).join('; ') || 'No active effects.'}`}
                onPointerEnter={()=>setHovered(enemy.id)} onPointerLeave={()=>setHovered(null)}
                onFocus={()=>setFocused(enemy.id)} onBlur={()=>setFocused(null)}
                onClick={activate} />
            </div>;
        })}
        </div><div className="battle-notice-host" ref={setNoticeHost}/>
        {entity && <InspectionDialog title={entity.name} onClose={()=>setInspected(null)}>
            <p>{entity.hp}/{entity.maxHp} HP · {entity.block} Block</p>
            {'intent' in entity && <p>{describeIntent(entity.intent,entity.statuses,player.statuses)}</p>}
            {entity.statuses.map(status=><p className="effect-description" key={status.id}><StatusIcon id={status.id}/><span>{describeStatuses([status])[0]}</span></p>)}
            {!entity.statuses.length && <p>No active effects.</p>}
        </InspectionDialog>}
    </div>;
}

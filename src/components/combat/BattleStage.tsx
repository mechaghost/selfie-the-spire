import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { BattleScene, SceneSnapshot } from '../../rendering/BattleScene';
import './BattleStage.css';
import { actorPlacement } from '../../rendering/actorPlacement';
import type { ActorSlot } from '../../rendering/battleLayout';
import type { SceneActor } from '../../rendering/BattleScene';
import { startStageMount } from '../../rendering/stageMountLifecycle';
function FallbackActor({actor,slot}:{actor:SceneActor;slot:ActorSlot}) {
    const [dimensions,setDimensions]=useState<{width:number;height:number}|null>(null);
    const [failed,setFailed]=useState(false);
    const rect=dimensions ? actorPlacement(slot,dimensions.width,dimensions.height,actor.visual.footAnchor) : {left:slot.art.x,top:slot.art.y,width:slot.art.width,height:slot.art.height};
    return <div className="battle-fallback-actor" style={{left:rect.left,top:rect.top,width:rect.width,height:rect.height,opacity:actor.defeated?.15:1}}>
        {(!dimensions || failed) && <svg viewBox="0 0 100 180"><path fill={actor.id==='player'?'#f3b16e':'#b9a4d6'} d="M30 45L8 100 24 110 40 78 34 130 20 175H43L52 136 65 175H87L72 115 70 45ZM32 24A20 20 0 1 0 72 24A20 20 0 1 0 32 24"/></svg>}
        {!failed && <img src={actor.visual.fallbackImageUrl} alt="" onLoad={event=>setDimensions({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight})} onError={()=>setFailed(true)} />}
    </div>;
}
export type StageStatus = 'loading' | 'ready' | 'degraded';
interface Props { snapshot: SceneSnapshot; noticeHost: HTMLElement | null; forceFallback?: boolean; onStatus?: (status:StageStatus)=>void }
/** DOM fallback exists before asynchronous initialization and remains independent of the canvas. */
export function BattleStage({snapshot,noticeHost,forceFallback=false,onStatus}: Props) {
    const focusReturn = useRef<HTMLDivElement>(null);
    const host = useRef<HTMLDivElement>(null);
    const scene = useRef<BattleScene | null>(null);
    const latest = useRef(snapshot); latest.current = snapshot;
    const [status,setStatus] = useState<StageStatus>('loading');
    const [attempt,setAttempt] = useState(0);
    const rosterKey = snapshot.actors.map(actor=>`${actor.id}:${actor.visual.id}:${actor.visual.fallbackImageUrl}`).join('|');
    useEffect(() => {
        let cancelled = false;
        let owned: BattleScene | undefined;
        setStatus(forceFallback ? 'degraded' : 'loading');
        const stop=forceFallback ? ()=>{} : startStageMount({
            load:async()=>{
                const {BattleScene}=await import('../../rendering/BattleScene');
                return ()=>{
                    if(!host.current)throw new Error('Combat stage host unavailable');
                    return new BattleScene(host.current,latest.current,()=>{if(!cancelled)setStatus('degraded');});
                };
            },
            onCreate:created=>{owned=created;scene.current=created;},
            onReady:created=>{created.update(latest.current);setStatus('ready');},
            onFailure:()=>{if(scene.current===owned)scene.current=null;setStatus('degraded');},
        });
        return () => { cancelled=true; stop(); if(scene.current===owned)scene.current=null; };
    }, [rosterKey,snapshot.location.id,forceFallback,attempt]);
    useEffect(()=>{scene.current?.update(snapshot);},[snapshot]);
    useEffect(()=>{onStatus?.(status);},[status,onStatus]);
    return <div className="battle-stage-visual" ref={focusReturn} role="group" aria-label="Combat arena" tabIndex={-1} data-stage-status={status}>
        <div className="battle-canvas" ref={host} />
        {status !== 'ready' && <div className="battle-dom-fallback" aria-hidden="true" style={{backgroundColor:`#${snapshot.location.sky.toString(16).padStart(6,'0')}`}}>
            <div className="battle-fallback-ground" style={{top:snapshot.layout.width<600 && snapshot.layout.height>=300 && snapshot.layout.enemies.length===3 ? '32%' : '73%',backgroundColor:`#${snapshot.location.ground.toString(16).padStart(6,'0')}`}} />
            {snapshot.actors.map(actor=>{
                const slot = actor.id==='player' ? snapshot.layout.hero : snapshot.layout.enemies.find(slot=>slot.id===actor.id);
                if(!slot)return null;
                return <FallbackActor key={`${actor.id}:${actor.visual.fallbackImageUrl}`} actor={actor} slot={slot} />;
            })}
        </div>}
        {status==='degraded' && noticeHost && createPortal(<div className="battle-renderer-notice" role="status">Simplified graphics <button onClick={()=>{
            // The retry button disappears while mounting. Return keyboard focus
            // before removal; the next Tab follows the arena's target controls.
            focusReturn.current?.focus({preventScroll:true});
            setAttempt(n=>n+1);
        }}>Retry graphics</button></div>,noticeHost)}
    </div>;
}

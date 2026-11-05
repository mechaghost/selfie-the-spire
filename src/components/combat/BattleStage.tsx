import { useEffect, useRef, useState } from 'react';
import type { BattleScene, SceneSnapshot } from '../../rendering/BattleScene';
import './BattleStage.css';
export type StageStatus = 'loading' | 'ready' | 'degraded';
interface Props { snapshot: SceneSnapshot; forceFallback?: boolean; onStatus?: (status:StageStatus)=>void }
/** DOM fallback exists before asynchronous initialization and remains independent of the canvas. */
export function BattleStage({snapshot,forceFallback=false,onStatus}: Props) {
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
        if (!forceFallback) void import('../../rendering/BattleScene').then(async ({BattleScene}) => {
            if (cancelled || !host.current) return;
            owned = new BattleScene(host.current,latest.current,()=>{if(!cancelled)setStatus('degraded');});
            scene.current = owned;
            const mounted = await owned.mount();
            if (!cancelled && mounted) { owned.update(latest.current); setStatus('ready'); }
        }).catch(()=>{if(!cancelled)setStatus('degraded');});
        return () => { cancelled=true; owned?.destroy(); if(scene.current===owned)scene.current=null; };
    }, [rosterKey,forceFallback,attempt]);
    useEffect(()=>{scene.current?.update(snapshot);},[snapshot]);
    useEffect(()=>{onStatus?.(status);},[status,onStatus]);
    return <div className="battle-stage-visual" data-stage-status={status}>
        <div className="battle-canvas" ref={host} />
        {status !== 'ready' && <div className="battle-dom-fallback" aria-hidden="true" style={{backgroundColor:`#${snapshot.location.sky.toString(16).padStart(6,'0')}`}}>
            <div className="battle-fallback-ground" style={{top:snapshot.layout.width<600 && snapshot.layout.height>=300 && snapshot.layout.enemies.length===3 ? '32%' : '73%',backgroundColor:`#${snapshot.location.ground.toString(16).padStart(6,'0')}`}} />
            {snapshot.actors.map(actor=>{
                const slot = actor.id==='player' ? snapshot.layout.hero : snapshot.layout.enemies.find(slot=>slot.id===actor.id);
                if(!slot)return null;
                return <div key={actor.id} className="battle-fallback-actor" style={{left:slot.art.x,top:slot.art.y,width:slot.art.width,height:slot.art.height,opacity:actor.defeated?.15:1}}>
                    <svg viewBox="0 0 100 180"><path fill={actor.id==='player'?'#f3b16e':'#b9a4d6'} d="M30 45L8 100 24 110 40 78 34 130 20 175H43L52 136 65 175H87L72 115 70 45ZM32 24A20 20 0 1 0 72 24A20 20 0 1 0 32 24"/></svg>
                    <img src={actor.visual.fallbackImageUrl} alt="" onError={event=>{event.currentTarget.style.display='none';}} />
                </div>;
            })}
        </div>}
        {status==='degraded' && <div className="battle-renderer-notice" role="status">Simplified graphics <button onClick={()=>setAttempt(n=>n+1)}>Retry graphics</button></div>}
    </div>;
}

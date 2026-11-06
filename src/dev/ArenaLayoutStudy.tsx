import { useLayoutEffect, useRef, useState } from 'react';
import { battleLayout, Rect } from '../rendering/battleLayout';
import { CardItem } from '../components/ui/CardItem';
import { createCardInstance } from '../data/cards';
import './ArenaLayoutStudy.css';
import { BattleStage } from '../components/combat/BattleStage';
import { ACTOR_VISUALS, HERO_ARCHETYPES } from '../data/actorVisuals';
import { LOCATIONS } from '../data/locations';
import { enemies } from '../data/enemies';
import { ActorClip } from '../core/battleVisualModels';
const position = (rect: Rect) => ({ left: rect.x, top: rect.y, width: rect.width, height: rect.height });
const roster = Object.keys(enemies);
const cards = Array.from({length:10}, (_, i) => createCardInstance(i % 2 ? 'haymaker' : 'finesse'));
export default function ArenaLayoutStudy() {
    const [hero,setHero]=useState('neon');
    const [actorIds, setActorIds] = useState(['fire_escape_spider','vending_golem','alley_rat']);
    const [renderer, setRenderer] = useState(false);
    const [fallback, setFallback] = useState(false);
    const [district, setDistrict] = useState(0);
    const [count, setCount] = useState(3);
    const [boss, setBoss] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [scrub,setScrub]=useState(false);
    const [frameMs,setFrameMs]=useState(140);
    const [preview, setPreview] = useState<{actor:string;clip:ActorClip;token:number} | null>(null);
    const [dead, setDead] = useState<string[]>([]);
    const [size, setSize] = useState({width:320,height:220});
    const stage = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const element = stage.current!;
        const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: Math.max(140, entry.contentRect.height) }));
        observer.observe(element); return () => observer.disconnect();
    }, []);
    const layout = battleLayout(size.width, size.height, Array.from({length:count}, (_, i) => `enemy-${i}`), boss);
    return <main className="arena-study">
        <header><strong>NEO MIAMI</strong><span>Combat art and layout review</span></header>
        <nav aria-label="Layout variants"><button onClick={()=>setRenderer(value=>!value)}>{renderer ? 'DOM study' : 'Pixi scene'}</button><button onClick={()=>setFallback(value=>!value)}>{fallback ? 'Enable graphics' : 'Force fallback'}</button><button onClick={()=>setDistrict(value=>(value+1)%5)}>{LOCATIONS[district].name}</button>{[1,2,3].map(n => <button key={n} onClick={() => {setCount(n);setBoss(false);setDead([]);setSelected(null);}}>{n} {n === 1 ? 'enemy' : 'enemies'}</button>)}<button onClick={() => {setCount(1);setBoss(true);setActorIds(ids=>['the_billboard',...ids.slice(1)]);setDead([]);setSelected(null);}}>Boss</button><button disabled={!selected} onClick={() => setDead([...dead, selected!])}>Defeat selected</button>{actorIds.slice(0,count).map((id,i)=><label key={i}>Enemy {i+1} <select aria-label={`Enemy ${i+1} artwork`} value={id} onChange={event=>{const next=[...actorIds];next[i]=event.target.value;setActorIds(next);setDead([]);setSelected(null);}}>{roster.map(key=><option key={key} value={key}>{enemies[key].name} · {ACTOR_VISUALS[key].productionStatus}</option>)}</select></label>)}<label>Hero <select aria-label="Hero artwork" value={hero} onChange={event=>{setHero(event.target.value);setPreview(null);setDead([]);setSelected('player');}}>{HERO_ARCHETYPES.map(id=><option key={id} value={id}>{id}</option>)}</select></label><button onClick={()=>setSelected('player')}>Select hero</button>{(['idle','attack','hit','guard','cast','celebrate'] as const).map(clip=><button key={clip} disabled={!selected || !renderer} onClick={()=>setPreview({actor:selected!,clip,token:Date.now()})}>Replay {clip}</button>)}<button onClick={()=>{setDead([]);setPreview(null);}}>Reset poses</button><label><span>Freeze selected pose</span><input type="checkbox" checked={scrub} onChange={event=>setScrub(event.target.checked)} /></label><label>Frame time (ms)<input aria-label="Frame time in milliseconds" type="number" min="0" max="1000" step="10" value={frameMs} onChange={event=>setFrameMs(Math.max(0,Math.min(1000,Number(event.target.value))))} /></label><span>Missing artwork uses idle. Freeze samples the selected replay at this time.</span></nav>
        <section className="study-stage" ref={stage} aria-label="Combat composition">
            {renderer && <BattleStage forceFallback={fallback} snapshot={{layout,location:LOCATIONS[district],reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,actors:[{id:'player',visual:ACTOR_VISUALS[`hero-${hero}`],defeated:dead.includes('player'),clip:preview?.actor==='player'?preview.clip:undefined,previewElapsedMs:scrub && preview?.actor==='player'?frameMs:undefined,motionToken:preview?.actor==='player'?String(preview.token):undefined},...layout.enemies.map((slot,i)=>({id:slot.id,visual:ACTOR_VISUALS[actorIds[i]],defeated:dead.includes(slot.id),clip:preview?.actor===slot.id?preview.clip:undefined,previewElapsedMs:scrub && preview?.actor===slot.id?frameMs:undefined,motionToken:preview?.actor===slot.id?String(preview.token):undefined}))]}} />}
            {!renderer && <div className="study-skyline" aria-hidden="true" />}
            {!renderer && <div className="study-road" aria-hidden="true" />}
            <div className="study-hero-hud" style={position(layout.hero.hud)}><strong>You</strong><span>72/80</span><span>◆ 8</span></div>
            {!renderer && <svg aria-hidden="true" className="study-actor study-hero" viewBox="0 0 100 180" style={position(layout.hero.art)}><ellipse cx="50" cy="174" rx="35" ry="5" fill="#070b16"/><path d="M36 78L28 126 18 170H36L51 125 61 170H80L68 119 65 75Z" fill="#d597a8"/><path d="M32 42L21 92 32 98 43 70 62 74 78 92 89 82 69 44Z" fill="#f3a44a"/><circle cx="51" cy="25" r="17" fill="#aee5df"/></svg>}
            {layout.enemies.map((slot, i) => <div key={slot.id}>
                {!renderer && <svg aria-hidden="true" viewBox="0 0 130 180" className={`study-actor study-monster ${dead.includes(slot.id) ? 'is-dead' : ''} ${selected === slot.id ? 'selected' : ''}`} style={position(slot.art)}><ellipse cx="65" cy="173" rx="57" ry="6" fill="#070b16"/>{i === 0 && !boss ? <path d="M57 70L12 30 2 40 40 94 3 140 8 166 25 138 55 113 75 113 103 138 122 170 127 140 90 94 128 40 116 30 73 70Z" fill="#99cebf"/> : <path d="M30 22L95 22 122 72 108 132 100 171H77L67 132 54 171H28L16 115 7 70Z" fill={i === 1 ? '#b49ad8' : '#ea9278'}/>}<path d="M40 82H54M77 82H91" stroke="#101a30" strokeWidth="10"/></svg>}
                <button className="study-target" disabled={dead.includes(slot.id)} aria-label={`${enemies[actorIds[i]].name}, ${dead.includes(slot.id) ? 'defeated' : '30 health, attacks for 6 twice'}`} aria-pressed={selected === slot.id} style={position(slot.target)} onClick={() => setSelected(slot.id)}>
                    <span className="study-hud" style={{position:'absolute',left:slot.hud.x-slot.target.x,top:slot.hud.y-slot.target.y,width:slot.hud.width}}><strong>{i+1}. {enemies[actorIds[i]].name}</strong><span>{dead.includes(slot.id) ? 'Defeated' : '30/40'}</span><b>⚔ 6 × 2</b><span title="Weak 2, Burn 3, Strength 1, Spikes 2">◆5 · +4</span></span>
                    <span className="study-slot-number" aria-hidden="true">{i+1}</span>
                </button>
            </div>)}
        </section>
        <div className="study-controls"><span><strong>3/3</strong> Energy</span><span>{selected==='player' ? 'Hero selected' : selected ? `Target ${Number(selected.slice(-1))+1}` : 'Choose a target'}</span><button>End Turn</button></div>
        <section className="study-hand" aria-label="Ten-card hand">{cards.map(card => <CardItem key={card.instanceId} card={card} canPlay isDraggable={false} onInspect={() => {}} />)}</section>
    </main>;
}

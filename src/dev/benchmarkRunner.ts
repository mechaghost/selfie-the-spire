import { BattleScene, battleTextures, SceneSnapshot } from '../rendering/BattleScene';
import { battleLayout } from '../rendering/battleLayout';
import { ACTOR_VISUALS, HERO_ARCHETYPES } from '../data/actorVisuals';
import { LOCATIONS } from '../data/locations';

export function frameSummary(samples:readonly number[]) {
    const sorted=[...samples].sort((a,b)=>a-b);
    const percentile=(p:number)=>sorted.length ? sorted[Math.max(0,Math.ceil(sorted.length*p)-1)] : null;
    return {samples:sorted.length,p50:percentile(.5),p95:percentile(.95),p99:percentile(.99),over50ms:sorted.filter(n=>n>50).length,max:sorted[sorted.length-1]??null};
}
const resources=()=>battleTextures.diagnostics(texture=>texture.source.pixelWidth*texture.source.pixelHeight*4);
type Cycle = {cycle:number;district:string;readyMs:number;frames:ReturnType<typeof frameSummary>;peak:ReturnType<typeof resources>;afterDispose:ReturnType<typeof resources>};
export async function runArenaBenchmark(host:HTMLElement,signal:AbortSignal,durationMs:number,onProgress:(message:string)=>void) {
    const started=performance.now(),frames:number[]=[],cycles:Cycle[]=[],failures:string[]=[];
    const baseline=resources(),initialSize=host.getBoundingClientRect();
    const environment={userAgent:navigator.userAgent,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,arenaWidth:initialSize.width,arenaHeight:initialSize.height,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
    let hidden=false,resized=false,current:BattleScene|undefined,raf=0,monitorRaf=0,previousFrame=started;
    // Keep this sampler alive across mounts: scene loading stalls are part of
    // the aggregate distribution, while cycle samples describe loaded scenes.
    const monitor=(now:number)=>{frames.push(now-previousFrame);previousFrame=now;monitorRaf=requestAnimationFrame(monitor);};
    monitorRaf=requestAnimationFrame(monitor);
    const visibility=()=>{if(document.hidden)hidden=true;};visibility();
    const resize=()=>{resized=true;};
    document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);
    try {
        for(let cycle=0;cycle<20;cycle++) {
            signal.throwIfAborted();
            const begin=performance.now(),district=LOCATIONS[cycle%5],boss=cycle%5===4;
            const enemyIds=boss?['the_billboard']:['fire_escape_spider','vending_golem','alley_rat'];
            const bounds=host.getBoundingClientRect();
            const snapshot:SceneSnapshot={layout:battleLayout(Math.max(280,bounds.width),Math.max(140,bounds.height),enemyIds,boss),location:district,reducedMotion:false,
                actors:[{id:'player',visual:ACTOR_VISUALS[`hero-${HERO_ARCHETYPES[cycle%5]}`],defeated:false},...enemyIds.map(id=>({id,visual:ACTOR_VISUALS[id],defeated:false}))]};
            current=new BattleScene(host,snapshot,message=>failures.push(message));
            await current.mount();signal.throwIfAborted();
            const readyMs=performance.now()-begin,local:number[]=[];
            let previous=performance.now(),lastSecond=-1,lastBeat=-1,peak=resources();
            const scene=current;
            await new Promise<void>((resolve,reject)=>{
                const abort=()=>{cancelAnimationFrame(raf);signal.removeEventListener('abort',abort);reject(signal.reason);};
                signal.addEventListener('abort',abort,{once:true});
                const tick=(now:number)=>{
                    const delta=now-previous;previous=now;local.push(delta);
                    const second=Math.floor((now-begin)/1000),beat=Math.floor((now-begin)/1500);
                    if(beat!==lastBeat){lastBeat=beat;scene.update({...snapshot,actors:snapshot.actors.map((actor,index)=>({...actor,clip:((beat+index)%3===0?'attack':(beat+index)%3===1?'guard':'hit'),motionToken:String(beat)}))});}
                    if(second!==lastSecond){lastSecond=second;const sample=resources();if(sample.estimatedBytes>peak.estimatedBytes)peak=sample;onProgress(`Cycle ${cycle+1}/20 · ${district.name} · ${Math.floor((now-started)/1000)} seconds`);}
                    if(now-begin>=durationMs/20){signal.removeEventListener('abort',abort);resolve();}
                    else raf=requestAnimationFrame(tick);
                };
                raf=requestAnimationFrame(tick);
            });
            current.destroy();current=undefined;
            cycles.push({cycle:cycle+1,district:district.id,readyMs,frames:frameSummary(local),peak,afterDispose:resources()});
        }
        const final=resources();
        return {version:1,scope:'Renderer study with fixed visible hand; RAF intervals are not GPU timings or full gameplay certification. Browser cache is not cleared.',environment,
            durationMs:performance.now()-started,requestedDurationMs:durationMs,hidden,resized,failures,baseline,final,frames:frameSummary(frames),cycles,
            valid:!hidden&&!resized&&!failures.length&&baseline.entries===0&&cycles.every(c=>c.afterDispose.entries===0&&c.afterDispose.references===0),
            resourceLoads:performance.getEntriesByType('resource').filter(entry=>entry.startTime>=started&&entry.name.includes('/assets/battle/')).map(entry=>{const r=entry as PerformanceResourceTiming;return {asset:new URL(r.name).pathname,durationMs:r.duration,transferBytes:r.transferSize,encodedBytes:r.encodedBodySize};})};
    } finally {
        cancelAnimationFrame(raf);cancelAnimationFrame(monitorRaf);current?.destroy();
        document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);
    }
}

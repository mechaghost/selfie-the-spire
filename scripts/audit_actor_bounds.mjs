import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import sharp from '../tests/server-sharp.mjs';
await mkdir('tests/.e2e-out',{recursive:true});
await build({stdin:{contents:"export {ACTOR_VISUALS} from './src/data/actorVisuals';export {battleLayout} from './src/rendering/battleLayout';export {actorPlacement} from './src/rendering/actorPlacement';export {sampleActorMotion,motionProfile,actorPoseAt} from './src/rendering/actorMotion';export {clipFrameAt} from './src/rendering/clipPlayback';export {ENCOUNTER_POOLS} from './src/data/encounters';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/actor-bounds.mjs',bundle:true,platform:'node',format:'esm'});
const {ACTOR_VISUALS,battleLayout,actorPlacement,sampleActorMotion,motionProfile,actorPoseAt,clipFrameAt,ENCOUNTER_POOLS}=await import('../tests/.e2e-out/actor-bounds.mjs');
const metadata=JSON.parse(await readFile('src/data/battleTextureSources.json','utf8'));
const bounds=new Map();
const pixels=new Map();
const bossIds=new Set(ENCOUNTER_POOLS.act1_boss.flatMap(encounter=>encounter.enemyIds));
for(const visual of Object.values(ACTOR_VISUALS))for(const url of [visual.fallbackImageUrl,...Object.values(visual.keyPoses??{}).map(pose=>pose.imageUrl)]) {
    if(bounds.has(url))continue;
    const {data,info}=await sharp('public'+url).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,right=0,top=info.height,bottom=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*info.channels+3]>=32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}
    pixels.set(url,{data,info});
    const source=metadata[url];
    bounds.set(url,{left:left/source.resolution,right:right/source.resolution,top:top/source.resolution,bottom:bottom/source.resolution});
}
const sizes=[[320,220],[320,244],[320,300],[390,380],[390,464],[430,520],[664,250],[768,500],[1440,650]];
const findings=[];let samples=0,rectangleCandidates=0;
const clips={idle:0,attack:320,hit:220,guard:220,cast:220,celebrate:600,defeat:280};
function motionSamples(visual) {
    const result=[];
    for(const [clip,duration] of Object.entries(clips)) {
        const authored=visual.clips[clip];
        const times=new Set([0,duration,...Array.from({length:Math.ceil(duration/20)},(_,i)=>i*20)]);
        let boundary=0;
        for(const ms of authored?.durationsMs??[]) {boundary+=ms;times.add(boundary-1);times.add(boundary);}
        for(const elapsed of times)for(const reduced of [false,true]) {
            const frame=authored ? clipFrameAt(authored,elapsed,reduced)??'idle' : actorPoseAt(clip,elapsed,reduced);
            const pose=visual.keyPoses?.[frame]??{imageUrl:visual.fallbackImageUrl,footAnchor:visual.footAnchor};
            // Idle bob/squash phase depends on wall time, independent of clip time.
            for(const phase of reduced?[0]:[-1,0,1]) {
                const profile=motionProfile(visual.id);
                const idleTime=phase*Math.PI/2*(profile==='heavy'?1050:700);
                result.push({clip,elapsed,reduced,frame,pose,phase,idleTime});
            }
        }
    }
    return result;
}
const actorSamples=new Map(Object.values(ACTOR_VISUALS).map(visual=>[visual.id,motionSamples(visual)]));
for(const [width,height] of sizes)for(const [count,boss] of [[1,false],[2,false],[3,false],[1,true]]) {
    const layout=battleLayout(width,height,Array.from({length:count},(_,i)=>`e${i}`),boss);
    for(const visual of Object.values(ACTOR_VISUALS)) {
        const hero=visual.id.startsWith('hero-');
        if(boss && !hero && !bossIds.has(visual.id))continue;
        for(const slot of hero?[layout.hero]:layout.enemies)for(const {frame,pose,clip,elapsed,reduced,phase,idleTime} of actorSamples.get(visual.id)) {
            const source=metadata[pose.imageUrl],idle=metadata[visual.fallbackImageUrl],box=bounds.get(pose.imageUrl);
            const motion=sampleActorMotion(motionProfile(visual.id),clip,elapsed,idleTime,hero?1:-1,reduced);
            const scale=actorPlacement(slot,idle.width,idle.height,visual.footAnchor).scale*(pose.scale??1);
            const points=[];
            for(const x of [box.left,box.right])for(const y of [box.top,box.bottom]) {
                const dx=(x-source.width*pose.footAnchor[0])*scale*motion.scaleX,dy=(y-source.height*pose.footAnchor[1])*scale*motion.scaleY;
                points.push([slot.foot.x+motion.x+dx*Math.cos(motion.rotation)-dy*Math.sin(motion.rotation),slot.foot.y+motion.y+dx*Math.sin(motion.rotation)+dy*Math.cos(motion.rotation)]);
            }
            const extent={left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
            const overflow=Math.max(0,-extent.left,extent.right-width,-extent.top,extent.bottom-height);
            samples++;
            const context={actor:visual.id,clip,frame,elapsed,reduced,phase,width,height,count,boss,slot:slot.index};
            if(overflow>2)findings.push({kind:'canvas',...context,overflow:+overflow.toFixed(2),extent});
            for(const other of [layout.hero,...layout.enemies]) {
                const rect=other.hud;
                const overlapX=Math.min(extent.right,rect.x+rect.width)-Math.max(extent.left,rect.x);
                const overlapY=Math.min(extent.bottom,rect.y+rect.height)-Math.max(extent.top,rect.y);
                if(overlapX>2 && overlapY>2) {
                    rectangleCandidates++;
                    // Test visible pixels inside the HUD, excluding the same 2px tolerance.
                    // Invert the sprite transform; runtime alpha data remains authoritative.
                    const {data,info}=pixels.get(pose.imageUrl);
                    let visibleOverlap=false;
                    for(let y=Math.max(rect.y+2,Math.floor(extent.top))+.5;y<Math.min(rect.y+rect.height-2,extent.bottom)&&!visibleOverlap;y++)
                        for(let x=Math.max(rect.x+2,Math.floor(extent.left))+.5;x<Math.min(rect.x+rect.width-2,extent.right);x++) {
                            const dx=x-slot.foot.x-motion.x,dy=y-slot.foot.y-motion.y;
                            const localX=(dx*Math.cos(motion.rotation)+dy*Math.sin(motion.rotation))/(scale*motion.scaleX)+source.width*pose.footAnchor[0];
                            const localY=(-dx*Math.sin(motion.rotation)+dy*Math.cos(motion.rotation))/(scale*motion.scaleY)+source.height*pose.footAnchor[1];
                            const px=Math.floor(localX*source.resolution),py=Math.floor(localY*source.resolution);
                            if(px>=0&&py>=0&&px<info.width&&py<info.height&&data[(py*info.width+px)*info.channels+3]>=32){visibleOverlap=true;break;}
                        }
                    if(visibleOverlap)findings.push({kind:'hud',...context,hud:other.index,overlapX:+overlapX.toFixed(2),overlapY:+overlapY.toFixed(2),extent});
                }
            }
        }
    }
}
const report={note:'Conservative transformed alpha bounds (alpha >=32), clips sampled every 20ms plus authored frame boundaries and completion; normal/reduced motion and idle phase extrema, one/two/three enemies and solo boss layout. Canvas/HUD intersection candidates require visual inspection; rectangles include transparent corners and discrete samples are not continuous-time certification. HUD candidates are refined by inverse-transforming 1 CSS pixel sample centers into runtime alpha inside a 2px HUD inset; this excludes transparent rectangle corners but is not GPU filtering equivalence. Boss slots use the actual boss roster. Loose pose sources represent atlas-equivalent art.',sizes,samples,rectangleCandidates,findings};
await writeFile('docs/actor-bounds-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({samples,rectangleCandidates,candidates:findings.length,worst:findings.sort((a,b)=>(b.overflow??b.overlapY)-(a.overflow??a.overlapY)).slice(0,8)},null,2));
if(process.argv.includes('--check') && findings.length)process.exitCode=1;

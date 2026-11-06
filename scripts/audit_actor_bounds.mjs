import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import sharp from '../tests/server-sharp.mjs';
await mkdir('tests/.e2e-out',{recursive:true});
await build({stdin:{contents:"export {ACTOR_VISUALS} from './src/data/actorVisuals';export {battleLayout} from './src/rendering/battleLayout';export {actorPlacement} from './src/rendering/actorPlacement';export {sampleActorMotion,motionProfile} from './src/rendering/actorMotion';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/actor-bounds.mjs',bundle:true,platform:'node',format:'esm'});
const {ACTOR_VISUALS,battleLayout,actorPlacement,sampleActorMotion,motionProfile}=await import('../tests/.e2e-out/actor-bounds.mjs');
const metadata=JSON.parse(await readFile('src/data/battleTextureSources.json','utf8'));
const bounds=new Map();
for(const visual of Object.values(ACTOR_VISUALS))for(const url of [visual.fallbackImageUrl,...Object.values(visual.keyPoses??{}).map(pose=>pose.imageUrl)]) {
    if(bounds.has(url))continue;
    const {data,info}=await sharp('public'+url).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,right=0,top=info.height,bottom=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*info.channels+3]>=32){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}
    const source=metadata[url];
    bounds.set(url,{left:left/source.resolution,right:right/source.resolution,top:top/source.resolution,bottom:bottom/source.resolution});
}
const sizes=[[320,220],[320,300],[390,380],[390,464],[430,520],[664,250],[768,500],[1440,650]];
const findings=[];let samples=0;
for(const [width,height] of sizes)for(const count of [1,2,3]) {
    const layout=battleLayout(width,height,Array.from({length:count},(_,i)=>`e${i}`));
    for(const visual of Object.values(ACTOR_VISUALS)) {
        const hero=visual.id.startsWith('hero-');
        for(const slot of hero?[layout.hero]:layout.enemies)for(const [frame,pose] of [['idle',{imageUrl:visual.fallbackImageUrl,footAnchor:visual.footAnchor}],...Object.entries(visual.keyPoses??{})]) {
            const source=metadata[pose.imageUrl],idle=metadata[visual.fallbackImageUrl],box=bounds.get(pose.imageUrl);
            const elapsed=frame==='windup'?0:frame==='recovery'?260:140;
            const clip=['windup','recovery'].includes(frame)?'attack':frame;
            const motion=sampleActorMotion(motionProfile(visual.id),clip,elapsed,0,hero?1:-1,false);
            const scale=actorPlacement(slot,idle.width,idle.height,visual.footAnchor).scale*(pose.scale??1);
            const points=[];
            for(const x of [box.left,box.right])for(const y of [box.top,box.bottom]) {
                const dx=(x-source.width*pose.footAnchor[0])*scale*motion.scaleX,dy=(y-source.height*pose.footAnchor[1])*scale*motion.scaleY;
                points.push([slot.foot.x+motion.x+dx*Math.cos(motion.rotation)-dy*Math.sin(motion.rotation),slot.foot.y+motion.y+dx*Math.sin(motion.rotation)+dy*Math.cos(motion.rotation)]);
            }
            const extent={left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
            const overflow=Math.max(0,-extent.left,extent.right-width,-extent.top,extent.bottom-height);
            samples++;
            if(overflow>2)findings.push({kind:'canvas',actor:visual.id,frame,width,height,count,slot:slot.index,overflow:+overflow.toFixed(2),extent});
            for(const other of [layout.hero,...layout.enemies]) {
                const rect=other.hud;
                const overlapX=Math.min(extent.right,rect.x+rect.width)-Math.max(extent.left,rect.x);
                const overlapY=Math.min(extent.bottom,rect.y+rect.height)-Math.max(extent.top,rect.y);
                if(overlapX>2 && overlapY>2)findings.push({kind:'hud',actor:visual.id,frame,width,height,count,slot:slot.index,hud:other.index,overlapX:+overlapX.toFixed(2),overlapY:+overlapY.toFixed(2),extent});
            }
        }
    }
}
const report={note:'Conservative transformed alpha bounds (alpha >=32), sampled poses at contact/anticipation/recovery. Canvas/HUD intersection candidates require visual inspection; bounding rectangles include transparent corners and are not proof of pixel overlap or full-time animation certification. Loose pose sources represent atlas-equivalent art.',samples,findings};
await writeFile('docs/actor-bounds-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({samples,candidates:findings.length,worst:findings.sort((a,b)=>(b.overflow??b.overlapY)-(a.overflow??a.overlapY)).slice(0,8)},null,2));
if(process.argv.includes('--check') && findings.length)process.exitCode=1;

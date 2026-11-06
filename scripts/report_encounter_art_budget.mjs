import {build} from 'esbuild';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
await mkdir('tests/.e2e-out',{recursive:true});
await build({stdin:{contents:"export {ACTOR_VISUALS} from './src/data/actorVisuals';export {ENCOUNTER_POOLS} from './src/data/encounters';export {LOCATIONS} from './src/data/locations';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/encounter-art-budget.mjs',bundle:true,platform:'node',format:'esm'});
const {ACTOR_VISUALS,ENCOUNTER_POOLS,LOCATIONS}=await import('../tests/.e2e-out/encounter-art-budget.mjs');
const metadata=JSON.parse(await readFile('src/data/battleTextureSources.json','utf8'));
const fileSizes=new Map();
async function total(urls) {
    let bytes=0,decodedBytes=0;
    for(const url of new Set(urls)) {
        if(!fileSizes.has(url))fileSizes.set(url,(await stat('public'+url)).size);
        bytes+=fileSizes.get(url);
        const source=metadata[url];
        if(!source)throw new Error(`Missing runtime size metadata: ${url}`);
        decodedBytes+=source.runtimeWidth*source.runtimeHeight*4;
    }
    return {files:new Set(urls).size,bytes,decodedBytes};
}
// Mirrors successful BattleScene mounting: idle is required; layers and poses
// stream independently. Atlas frames replace matching loose poses, not idle.
function actorUrls(visual) {
    return [visual.fallbackImageUrl,...(visual.atlasUrl?[visual.atlasUrl]:[]),
        ...Object.entries(visual.keyPoses??{}).filter(([frame])=>!visual.atlasUrl || !visual.atlasFrames?.[frame]).map(([,pose])=>pose.imageUrl)];
}
const rows=[];
const encounters=[...new Map(Object.values(ENCOUNTER_POOLS).flat().map(encounter=>[encounter.id,encounter])).values()];
for(const hero of Object.values(ACTOR_VISUALS).filter(visual=>visual.id.startsWith('hero-')))
for(const encounter of encounters)for(const location of LOCATIONS) {
    const actors=[hero,...encounter.enemyIds.map(id=>ACTOR_VISUALS[id])];
    const required=await total(actors.map(actor=>actor.fallbackImageUrl));
    const all=await total([...location.layers.map(layer=>layer.url),...actors.flatMap(actorUrls)]);
    rows.push({hero:hero.id,encounter:encounter.id,location:location.id,required,all});
}
const descending=(a,b)=>b.all.bytes-a.all.bytes;
rows.sort(descending);
const report={note:'File-byte inventory for a cold successful scene load, not network timing or measured VRAM. Unique URLs deduplicated as in cache. Required means actor idle textures awaited before ready; all includes concurrently streamed layers and poses. Excludes app JS, fonts, cards, HTTP overhead, cache reuse, failed-atlas fallback downloads, personalized cutouts, framebuffers, mipmaps and driver overhead. Every legal encounter is exercised in every district because district visuals do not constrain encounter pools.',combinations:rows.length,maxRequiredBytes:Math.max(...rows.map(row=>row.required.bytes)),maxAllBytes:rows[0].all.bytes,maxDecodedBytes:Math.max(...rows.map(row=>row.all.decodedBytes)),over5MB:rows.filter(row=>row.all.bytes>5_000_000).length,over64MiB:rows.filter(row=>row.all.decodedBytes>64*1024*1024).length,worst:rows.slice(0,10),rows};
const checking = process.argv.includes('--check');
const reportPath = checking ? 'tests/.e2e-out/encounter-art-budget.json' : 'docs/encounter-art-budget.json';
await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:undefined},null,2));
if (checking && (report.over5MB || report.over64MiB)) {
    console.error('Encounter art exceeds the transfer or decoded texture budget. See ' + reportPath);
    process.exitCode = 1;
}

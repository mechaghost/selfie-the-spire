import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('tests/.e2e-out',{recursive:true});
await build({stdin:{contents:"export {ACTOR_VISUALS,HERO_ARCHETYPES} from './src/data/actorVisuals';export {enemies} from './src/data/enemies';export {ENCOUNTER_POOLS} from './src/data/encounters';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/motion-inventory.mjs',bundle:true,format:'esm',platform:'node'});
const {ACTOR_VISUALS,HERO_ARCHETYPES,enemies,ENCOUNTER_POOLS}=await import('../tests/.e2e-out/motion-inventory.mjs');
const reachable=new Set(Object.values(ENCOUNTER_POOLS).flatMap(pool=>pool.flatMap(encounter=>encounter.enemyIds)));
const rows=Object.entries(ACTOR_VISUALS).map(([id,visual])=>{
 const hero=id.startsWith('hero-');
 const effects=enemies[id]?.aiPatterns.flatMap(pattern=>pattern.intent.effects??[])??[];
 const required=['attack','hit','defeat',...(hero?['guard','cast','celebrate']:[]),...(!hero&&effects.some(effect=>effect.type==='Block')?['guard']:[]),...(!hero&&effects.some(effect=>['ApplyStatus','Heal'].includes(effect.type))?['cast']:[])];
 const keyPoses=Object.keys(visual.keyPoses??{}),timelines=Object.keys(visual.clips);
 return {id,reachability:hero?'hero':reachable.has(id)?'production':'legacy/dev',status:visual.productionStatus,keyPoses,timelines,missingContactPoses:required.filter(pose=>!keyPoses.includes(pose)),missingTimelines:['idle',...required].filter(clip=>!timelines.includes(clip))};
});
if (process.argv.includes('--check-release')) {
    const releaseIds = new Set([...reachable, ...HERO_ARCHETYPES.map(id => `hero-${id}`)]);
    const missingVisuals = [...releaseIds].filter(id => !ACTOR_VISUALS[id]);
    const releaseRows = rows.filter(row => releaseIds.has(row.id));
    const pendingReview = releaseRows.filter(row => row.status !== 'approved');
    const missingMotion = releaseRows.filter(row => row.missingContactPoses.length || row.missingTimelines.length);
    const staticIdle = releaseRows.filter(row => ACTOR_VISUALS[row.id].clips.idle?.frames.every(frame => frame === 'idle'));

    for (const id of missingVisuals) console.error(`${id}: no actor visual registered`);
    for (const row of missingMotion) {
        console.error(`${row.id}: missing poses [${row.missingContactPoses.join(', ')}], missing timelines [${row.missingTimelines.join(', ')}]`);
    }
    for (const row of staticIdle) console.error(`${row.id}: idle timeline repeats only the standing frame`);
    if (pendingReview.length) {
        console.error(`Art approval pending for ${pendingReview.length} actors: ${pendingReview.map(row => row.id).join(', ')}`);
    }
    if (missingVisuals.length || pendingReview.length || missingMotion.length || staticIdle.length) process.exit(1);
    console.log(`Art coverage and approval passed for ${releaseRows.length} actors`);
    process.exit(0);
}
const report={note:'Presence is not art approval. Required guard/cast inferred from executable effects; heroes can use generated effects. Timelines can reuse poses and are not proof of authored inbetweens.',actors:rows.length,productionEnemies:reachable.size,approved:rows.filter(row=>row.status==='approved').length,rows};
await writeFile('docs/battle-motion-inventory.json',JSON.stringify(report,null,2)+'\n');
const header='# Runtime motion inventory\n\nGenerated with `node scripts/report_battle_motion.mjs` from actor manifests and encounter pools. This separates existing art from missing portfolio work; it does not grant art approval. Idle cutouts exist for all actors. Rows with an idle timeline have an authored blink or light-dip loop. The remaining rows need an authored idle sequence. All idle animation needs final review. The Neon hero, Rat, Golem and Spider attacks have authored wind-up/contact/recovery poses. Other current attack timelines reuse idle/contact/idle; neither is a complete animation approval.\n\n';
const table='| Actor | Reachability | Extra key poses | Existing timelines | Missing contact poses | Status |\n|---|---|---|---|---|---|\n'+rows.map(row=>`| ${row.id} | ${row.reachability} | ${row.keyPoses.join(', ')||'none'} | ${row.timelines.join(', ')||'none'} | ${row.missingContactPoses.join(', ')||'none'} | ${row.status} |`).join('\n');
await writeFile('docs/battle-motion-inventory.md',header+table+'\n\n'+report.note+'\n');
console.log(`${report.actors} actors, ${report.productionEnemies} production enemies, ${report.approved} approved; inventory written`);

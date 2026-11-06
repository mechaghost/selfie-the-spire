import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('server/node_modules/.cache/combat-matting',{recursive:true});
await build({stdin:{contents:"export * from './server/src/services/removeCombatBackground';export * from './server/src/services/combatCutout';",resolveDir:process.cwd()},outfile:'server/node_modules/.cache/combat-matting/processor.mjs',bundle:true,packages:'external',platform:'node',format:'esm'});
process.env.COMBAT_MATTING_MODEL_PATH=resolve('server/models/u2net.onnx');
const {removeCombatBackground,prepareCombatCutout}=await import('../server/node_modules/.cache/combat-matting/processor.mjs');
const {default:sharp}=await import('./server-sharp.mjs');
const results=[];
await mkdir('tests/.e2e-out',{recursive:true});
for(const name of ['street-runner','chrome','volt','concrete','smoke']) {
 const original=await readFile(`art-source/battle/actors/${name}-idle-v1.png`);
 const opaque=await sharp(original).flatten({background:'#e6e6e6'}).png().toBuffer();
 const started=performance.now();
 const cutout=await removeCombatBackground(opaque);
 const durationMs=Math.round(performance.now()-started);
 const personal=await prepareCombatCutout(cutout);
 await writeFile(`tests/.e2e-out/matted-${name}.webp`,Buffer.from(personal.split(',')[1],'base64'));
 const metadata=await sharp(cutout).metadata();assert.equal(metadata.hasAlpha,true);
 const expected=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const actual=await sharp(cutout).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(expected.info.width,actual.info.width);assert.equal(expected.info.height,actual.info.height);
 let intersection=0,union=0,originalForeground=0;
 for(let i=3;i<expected.data.length;i+=4){const a=expected.data[i]>127,b=actual.data[i]>127;if(a)originalForeground++;if(a&&b)intersection++;if(a||b)union++;}
 const iou=intersection/union,foregroundRetention=intersection/originalForeground;
 assert.ok(iou>.9,`${name}: foreground mask IoU ${iou} must exceed .9`);
 assert.ok(foregroundRetention>.97,`${name}: foreground retention ${foregroundRetention} must exceed .97`);
 results.push({name,durationMs,maskIoU:iou,foregroundRetention,outputCharacters:personal.length,rssAfterBytes:process.memoryUsage().rss});
}
await assert.rejects(removeCombatBackground(Buffer.from('bad')));
await writeFile('tests/.e2e-out/combat-matting-report.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({result:'PASS',results,note:'Controlled artwork fixtures, not live selfie generation or deployment performance. RSS is sampled process resident memory after each fixture, not peak or model-only memory.'}));

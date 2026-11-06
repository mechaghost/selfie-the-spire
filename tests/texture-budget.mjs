import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await build({entryPoints:['src/rendering/textureBudget.ts'],outfile:'tests/.e2e-out/texture-budget.mjs',bundle:true,platform:'node',format:'esm'});
const {textureDecodePlan,packagedTextureSource}=await import('./.e2e-out/texture-budget.mjs');
const packageInfo=JSON.parse(await readFile('docs/battle-art-package.json','utf8'));
let original=0,budgeted=0;
for(const asset of packageInfo.assets) {
 const url='/assets/battle/'+asset.asset;
 const metadata=packagedTextureSource(url,asset.runtimeWidth,asset.runtimeHeight);
 assert.ok(metadata,'packaged dimensions resolve');
 assert.equal(metadata.width,asset.width);assert.equal(metadata.height,asset.height);
 assert.equal(metadata.resolution,asset.resolution);
 assert.equal(packagedTextureSource(url,1,1),undefined,'mismatched assets do not use stale source metadata');
 const plan=textureDecodePlan('/assets/battle/'+asset.asset,asset.width,asset.height);
 assert.ok(Math.max(plan.width,plan.height)<=(asset.asset.startsWith('locations/')?1536:768));
 assert.ok(plan.width/plan.resolution>=asset.width && plan.height/plan.resolution>=asset.height,'logical atlas extent remains available');
 assert.ok(plan.width/plan.resolution-asset.width<1/plan.resolution);
 original+=asset.width*asset.height*4;budgeted+=plan.width*plan.height*4;
}
const atlas=textureDecodePlan('/assets/battle/actors/vending-golem-poses-v1.webp',1244,3819);
assert.deepEqual(atlas,{width:622,height:1910,resolution:.5});
assert.deepEqual(textureDecodePlan('/assets/battle/actors/small.webp',128,256),{width:128,height:256,resolution:1});
console.log(`PASS: source-space bounds and texture caps; all loose assets estimated RGBA ${original.toLocaleString()} → ${budgeted.toLocaleString()} bytes (not simultaneous or measured GPU use)`);

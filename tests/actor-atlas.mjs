import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export * from './src/rendering/actorAtlas'; export * from './src/data/actorAtlasFrames'; export * from './src/core/battleVisualModels'; export {Texture,TextureSource} from 'pixi.js'; export {ACTOR_VISUALS} from './src/data/actorVisuals';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/actor-atlas.mjs',bundle:true,platform:'node',format:'esm'});
const {atlasTextures,Texture,TextureSource,validateActorVisual,ACTOR_VISUALS,GOLEM_ATLAS_FRAMES,GOLEM_ATLAS_SOURCE}=await import('./.e2e-out/actor-atlas.mjs');
const source=new TextureSource({width:512,height:512});
const atlas=new Texture({source});
const frame={rect:[20,30,100,200],sourceSize:[200,300],offset:[40,50],footAnchor:[.5,.94]};
const views=atlasTextures(atlas,{contact:frame});const view=views.get('contact');
assert.equal(view.source,source,'frames share pixel ownership');
assert.equal(view.width,200,'trim retains original canvas width');
assert.equal(view.height,300,'trim retains original canvas height');
assert.equal(view.trim.x,40);assert.equal(view.trim.y,50);
assert.equal(view.frame.x,20);assert.equal(view.frame.y,30);
assert.throws(()=>atlasTextures(atlas,{valid:frame,bad:{...frame,rect:[500,0,100,200]}}));
view.destroy(false);assert.equal(source.destroyed,false,'view disposal does not destroy shared pixels');
const visual={...ACTOR_VISUALS['hero-neon'],atlasUrl:'/assets/battle/actors/test.webp',atlasFrames:{contact:frame},clips:{attack:{frames:['contact'],durationsMs:[140],loop:false,completion:'idle'}}};
validateActorVisual(visual);
assert.throws(()=>validateActorVisual({...visual,atlasFrames:{contact:{...frame,offset:[150,0]}}}));
assert.throws(()=>validateActorVisual({...visual,atlasUrl:undefined}));
atlas.destroy(true);assert.equal(source.destroyed,true);
console.log('PASS: real Pixi atlas views, original canvas/trim preservation, shared ownership, invalid bounds and named-frame validation');

const packed=Object.values(GOLEM_ATLAS_SOURCE)[0];
const packedSource=new TextureSource({resource:{width:packed.runtimeWidth,height:packed.runtimeHeight},resolution:packed.resolution});
const packedTexture=new Texture({source:packedSource});
assert.equal(packedTexture.width,packed.width);assert.equal(packedTexture.height,packed.height);
const packedViews=atlasTextures(packedTexture,GOLEM_ATLAS_FRAMES);
assert.deepEqual([...packedViews.keys()],['attack','hit','defeat','guard']);
for(const [name,frame] of packedViews) {
 assert.equal(frame.width,GOLEM_ATLAS_FRAMES[name].sourceSize[0]);
 assert.equal(frame.height,GOLEM_ATLAS_FRAMES[name].sourceSize[1]);
 frame.destroy(false);
}
packedTexture.destroy(true);
console.log('PASS: four production Golem frames preserve source size on half-resolution Pixi texture');

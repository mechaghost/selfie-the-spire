import assert from 'node:assert/strict';
import {build} from 'esbuild';
const pixi=`
export const apps=[];
export const textureFailures={remaining:0};
export const initialization={wait:undefined};
export class Rectangle {constructor(x,y,width,height){Object.assign(this,{x,y,width,height});}}
class Pair {set(x,y=x){this.x=x;this.y=y;}}
export class Container {children=[];addChild(...items){this.children.push(...items);} }
export class Graphics extends Container {clear(){return this;}rect(){return this;}ellipse(){return this;}fill(){return this;}}
export class Sprite {constructor(texture){this.texture=texture;}anchor=new Pair();scale=new Pair();position=new Pair();}
export class ImageSource {constructor({resource}){this.resource=resource;}}
export class Texture {constructor({source}){if(textureFailures.remaining>0){textureFailures.remaining--;throw new Error('texture construction failed');}this.source=source;this.width=100;this.height=100;}destroy(){this.destroyed=true;}}
export class Application {constructor(){apps.push(this);}stage=new Container();canvas={setAttribute(){},addEventListener(){},removeEventListener(){}};renderer={resize(){}};ticker={add(){}};async init(){await initialization.wait;}render(){}start(){}stop(){}destroy(){this.destroyed=true;}}
`;
await build({stdin:{contents:`export * from './src/rendering/BattleScene'; export {ACTOR_VISUALS} from './src/data/actorVisuals'; export {publishImpact,publishAction,identifyAction} from './src/rendering/CombatPresentation'; export {startStageMount} from './src/rendering/stageMountLifecycle'; export {apps,textureFailures,initialization} from 'pixi.js'; export {battleLayout} from './src/rendering/battleLayout';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/renderer-streaming.mjs',bundle:true,platform:'node',format:'esm',plugins:[{name:'controlled-pixi',setup(b){b.onResolve({filter:/^pixi.js$/},()=>({path:'pixi',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:pixi,loader:'js'}));}}]});
const pending=new Map();
globalThis.Image=class {set src(url){if(url)pending.set(url,this);}};
globalThis.window={devicePixelRatio:1,setTimeout};
const listeners=new Set();
globalThis.document={hidden:false,addEventListener:(type,fn)=>listeners.add(fn),removeEventListener:(type,fn)=>listeners.delete(fn)};
const {ACTOR_VISUALS,publishImpact,BattleScene,battleTextures,apps,battleLayout,publishAction,identifyAction,textureFailures,initialization,startStageMount}=await import('./.e2e-out/renderer-streaming.mjs');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const resolve=url=>{const image=pending.get(url);assert.ok(image,url);pending.delete(url);return image.onload();};
const reject=url=>{const image=pending.get(url);assert.ok(image,url);pending.delete(url);image.onerror();};
const actor=(id)=>({id,defeated:false,visual:{id,clips:{},fallbackImageUrl:`/${id}`,footAnchor:[.5,1],keyPoses:{attack:{imageUrl:`/${id}-attack`,footAnchor:[.5,1]}}}});
const snapshot={layout:battleLayout(390,400,['enemy'],false),location:{sky:0,ground:0,accent:0,layers:[{url:'/far',depth:0},{url:'/near',depth:2,plane:'foreground',sway:2}]},actors:[actor('player'),actor('enemy')],reducedMotion:false};
snapshot.actors[1].visual.atlasUrl='/enemy-atlas';
snapshot.actors[1].visual.atlasFrames={attack:{rect:[0,0,50,50],sourceSize:[100,100],offset:[25,25],footAnchor:[.5,1]}};
const host={appendChild(){}};let failures=0;
const scene=new BattleScene(host,snapshot,()=>failures++);
let ready=false;const mounting=scene.mount().then(value=>ready=value);
await flush();resolve('/enemy');await flush();assert.equal(ready,false,'mandatory hero still loading');
resolve('/player');await flush();await mounting;
assert.equal(ready,true,'optional poses and backdrop do not delay actor-ready scene');
publishAction(identifyAction({type:'APPLY_STATUS',payload:{sourceId:'enemy',targetId:'player'}}),'begin');
assert.equal(scene.casts.has('enemy'),true,'status action animates source, not recipient');
assert.equal(scene.casts.has('player'),false);
assert.equal(pending.size,4);
const world=apps[0].stage.children[3];assert.equal(world.sortableChildren,true);
assert.deepEqual(world.children.map(child=>child.zIndex),[2,3,0,1],'stable roster order independent of completion order');
resolve('/near');resolve('/far');await flush();
const backdrop=apps[0].stage.children[1];assert.equal(backdrop.sortableChildren,true);
assert.deepEqual(backdrop.children.map(child=>child.zIndex),[0],'background stays behind actors');
const foreground=apps[0].stage.children[4];
assert.equal(foreground.sortableChildren,true);
assert.deepEqual(foreground.children.map(child=>child.zIndex),[2],'foreground stays above actors despite reverse load order');
scene.update({...snapshot,reducedMotion:true});
assert.equal(foreground.children[0].position.x,-3,'reduced motion removes decorative sway');
scene.update(snapshot);
resolve('/enemy-atlas');await flush();
assert.equal(scene.atlasViews.size,1,'optional atlas installs frame views');
const atlasView=scene.atlasViews.get('enemy:attack');
publishAction(identifyAction({type:'DAMAGE_ENTITY',payload:{sourceId:'player',targetId:'enemy',amount:6}}),'begin');
assert.equal(scene.casts.has('enemy'),true,'another actor attacking does not cancel this source cast');
publishAction(identifyAction({type:'DAMAGE_ENTITY',payload:{sourceId:'enemy',targetId:'player',amount:6}}),'complete');
assert.equal(scene.casts.has('enemy'),true,'completion does not start a new pose transition');
publishAction(identifyAction({type:'DAMAGE_ENTITY',payload:{sourceId:'enemy',targetId:'player',amount:6}}),'begin');
assert.equal(scene.casts.has('enemy'),false,'following attack cancels the source cast before anticipation/contact');
const preview={...snapshot,actors:snapshot.actors.map(actor=>actor.id==='enemy'?{...actor,clip:'attack',previewElapsedMs:140}:actor)};
scene.update(preview);assert.equal(scene.sprites.get('enemy').texture,atlasView,'scrub holds contact frame');
scene.update({...preview,actors:preview.actors.map(actor=>({...actor,previewElapsedMs:320}))});
assert.equal(scene.sprites.get('enemy').texture,scene.poses.get('enemy:idle'),'scrub samples recovery idle');
reject('/player-attack');await flush();assert.equal(failures,0,'missing optional pose keeps idle scene usable');
const playerSprite=scene.sprites.get('player');
scene.update(snapshot);const baseScale=playerSprite.scale.x;
const customFrame={width:200,height:200};
const customSnapshot={...snapshot,actors:snapshot.actors.map(actor=>actor.id==='player'?{...actor,clip:'attack',previewElapsedMs:0,visual:{...actor.visual,keyPoses:{windup:{imageUrl:'/windup',footAnchor:[.4,.9],scale:.5}},clips:{attack:{frames:['windup'],durationsMs:[80],loop:false,completion:'idle'}}}}:actor)};
scene.update(customSnapshot);
assert.equal(playerSprite.scale.x,baseScale,'unloaded optional frame must not resize fallback idle');
scene.poses.set('player:windup',customFrame);scene.update(customSnapshot);
assert.equal(playerSprite.scale.x,baseScale*.5,'named frame uses its explicit scale correction');
assert.equal(playerSprite.anchor.x,.4);assert.equal(playerSprite.anchor.y,.9);
scene.update({...customSnapshot,reducedMotion:true});
assert.equal(playerSprite.texture,scene.poses.get('player:idle'));assert.equal(playerSprite.scale.x,baseScale,'reduced motion restores idle scale');
const idleLoopSnapshot={...customSnapshot,actors:customSnapshot.actors.map(actor=>actor.id==='player'?{...actor,clip:'idle',previewElapsedMs:800,visual:{...actor.visual,clips:{idle:{frames:['idle','windup'],durationsMs:[800,800],loop:true,completion:'idle'}}}}:actor)};
scene.update(idleLoopSnapshot);
assert.equal(playerSprite.texture,customFrame,'authored idle selects its alternate frame');
scene.update({...idleLoopSnapshot,actors:idleLoopSnapshot.actors.map(actor=>({...actor,previewElapsedMs:1600}))});
assert.equal(playerSprite.texture,scene.poses.get('player:idle'),'authored idle loops back to the base frame');
scene.update({...idleLoopSnapshot,reducedMotion:true});
assert.equal(playerSprite.texture,scene.poses.get('player:idle'),'reduced motion suppresses authored idle cycling');
scene.poses.delete('player:windup');
scene.destroy();assert.equal(atlasView.destroyed,true,'atlas views disposed with scene');assert.equal(scene.atlasViews.size,0);assert.equal(scene.casts.size,0);assert.equal(listeners.size,0);assert.equal(apps[0].destroyed,true);
assert.equal(pending.has('/enemy-attack'),false,'atlas-covered poses are not downloaded twice');
await flush();
assert.deepEqual(battleTextures.stats(),{entries:0,references:0},'late optional textures released after disposal');
assert.equal(failures,0);
const broken=new BattleScene(host,snapshot,()=>failures++);
const failedMount=broken.mount().catch(error=>error);
await flush();reject('/player');await flush();
assert.ok(await failedMount instanceof Error);assert.equal(failures,1);
resolve('/enemy');resolve('/near');resolve('/far');await flush();
assert.deepEqual(battleTextures.stats(),{entries:0,references:0});assert.equal(listeners.size,0);
assert.equal(apps[1].destroyed,true,'mandatory failure disposes application');
console.log('PASS: mandatory readiness, independent optional streaming, stable depth, disposal during loads and zero retained leases');
const atlasFailure=new BattleScene(host,snapshot,()=>failures++);
const retryMount=atlasFailure.mount();await flush();resolve('/player');resolve('/enemy');await flush();await retryMount;
reject('/enemy-atlas');await flush();
assert.ok(pending.has('/enemy-attack'),'failed atlas starts individual pose fallback');
resolve('/enemy-attack');resolve('/player-attack');resolve('/far');resolve('/near');await flush();
assert.ok(atlasFailure.poses.has('enemy:attack'),'fallback pose installed');
atlasFailure.destroy();assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
console.log('PASS: atlas failure falls back to individual poses without duplicate requests or leaked leases');
// Loose authored frames should not wait behind a slow atlas, nor reload on atlas failure.
const mixedSnapshot={...snapshot,actors:snapshot.actors.map(actor=>actor.id==='enemy'?{...actor,visual:{...actor.visual,keyPoses:{...actor.visual.keyPoses,windup:{imageUrl:'/enemy-windup',footAnchor:[.5,1]}}}}:actor)};
const mixed=new BattleScene(host,mixedSnapshot,()=>failures++);
const mixedMount=mixed.mount();await flush();resolve('/player');resolve('/enemy');await flush();await mixedMount;
assert.ok(pending.has('/enemy-atlas'));
assert.ok(pending.has('/enemy-windup'),'non-atlas wind-up starts while atlas is pending');
assert.equal(pending.has('/enemy-attack'),false,'atlas-covered contact is not duplicated');
resolve('/enemy-windup');await flush();
assert.ok(mixed.poses.has('enemy:windup'));
reject('/enemy-atlas');await flush();
assert.equal(pending.has('/enemy-windup'),false,'atlas failure does not re-request the independent pose');
resolve('/enemy-attack');resolve('/player-attack');resolve('/far');resolve('/near');await flush();
mixed.destroy();assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
console.log('PASS: non-atlas frames stream independently and are not duplicated on atlas failure');
// Exercise bitmap ownership independently of GPU allocation.
globalThis.Image.prototype.naturalWidth=1536;
globalThis.Image.prototype.naturalHeight=1024;
const bitmaps=[];
globalThis.ImageBitmap=class {constructor(){bitmaps.push(this);}close(){this.closed=true;}};
globalThis.createImageBitmap=async()=>new ImageBitmap();
const resized=new BattleScene(host,snapshot,()=>failures++);
const resizedMount=resized.mount();await flush();resolve('/player');resolve('/enemy');await flush();await resizedMount;
resolve('/enemy-atlas');resolve('/player-attack');resolve('/far');resolve('/near');await flush();
assert.ok(bitmaps.length>=3,'large actor textures use resized bitmaps');
resized.destroy();assert.ok(bitmaps.every(bitmap=>bitmap.closed),'owned bitmaps close when final texture lease ends');
assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
console.log('PASS: resized bitmap ownership and final-lease disposal');

// Construction exceptions must reject the lease, not escape an async image handler.
delete globalThis.createImageBitmap;
for(const [url,width,height] of [['/construction-failure',1536,1024],['/assets/battle/actors/street-runner-idle-v1.webp',553,711]]) {
    globalThis.Image.prototype.naturalWidth=width;globalThis.Image.prototype.naturalHeight=height;
    const construction=battleTextures.acquire(url);
    const constructionResult=construction.ready.catch(error=>error);
    await flush();textureFailures.remaining=1;
    await resolve(url);
    assert.match((await constructionResult).message,/texture construction failed/);
    construction.release();
    assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
}
globalThis.Image.prototype.naturalWidth=1536;globalThis.Image.prototype.naturalHeight=1024;

// A network-complete image whose bitmap decoder stalls still has a deadline.
const deadlines=[];
window.setTimeout=callback=>{deadlines.push(callback);return 987654321;};
let completeDecode;
globalThis.createImageBitmap=()=>new Promise(resolve=>{completeDecode=resolve;});
const stalled=battleTextures.acquire('/decoder-stall');
const stalledResult=stalled.ready.catch(error=>error);
await flush();const decoding=resolve('/decoder-stall');
assert.equal(typeof completeDecode,'function');
assert.equal(deadlines.length,1);
deadlines[0]();
assert.match((await stalledResult).message,/Asset timeout/);
stalled.release();
assert.deepEqual(battleTextures.stats(),{entries:0,references:0},'timed-out decode releases its cache entry');
const lateBitmap=new ImageBitmap();completeDecode(lateBitmap);await decoding;await flush();
assert.equal(lateBitmap.closed,true,'bitmap arriving after timeout is closed, never installed');
assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
window.setTimeout=setTimeout;
console.log('PASS: texture construction errors reject; decoder deadline and late bitmap disposal settle cleanly');

// Use the real scene lifecycle with GPU initialization held beyond the stage deadline.
const nativeSetTimeout=globalThis.setTimeout,nativeClearTimeout=globalThis.clearTimeout;
let stageDeadline,finishInitialization;
initialization.wait=new Promise(resolve=>{finishInitialization=resolve;});
globalThis.setTimeout=callback=>{stageDeadline=callback;return 123456789;};
globalThis.clearTimeout=()=>{};
try {
    let attached=0,stageFailures=0,stageReady=0;
    const lateScene=new BattleScene({appendChild(){attached++;}},snapshot,()=>stageFailures++);
    const lateApp=apps.at(-1);
    const stop=startStageMount({load:async()=>()=>lateScene,onCreate(){},onReady(){stageReady++;},onFailure(){stageFailures++;}});
    await flush();stageDeadline();
    assert.equal(stageFailures,1);assert.equal(stageReady,0);
    assert.equal(attached,0);assert.equal(lateApp.destroyed,undefined,'uninitialized GPU is not destroyed prematurely');
    finishInitialization();await flush();
    assert.equal(lateApp.destroyed,true,'GPU resolving after timeout is destroyed');
    assert.equal(attached,0,'late GPU canvas never attaches');assert.equal(stageReady,0);
    assert.equal(listeners.size,0);assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
    stop();assert.equal(stageFailures,1);
} finally {
    initialization.wait=undefined;
    globalThis.setTimeout=nativeSetTimeout;globalThis.clearTimeout=nativeClearTimeout;
}
console.log('PASS: stage timeout disposes late GPU initialization without canvas, listeners or asset leases');

// Exercise actual Wraith manifests through the scene's event subscriptions and clock.
// GPU objects are doubles; frame selection and event arbitration are production code.
delete globalThis.createImageBitmap; // End the deliberately stalled decoder fixture above.
const originalPerformance=globalThis.performance;
let clock=1000;
globalThis.performance={now:()=>clock};
const wraithVisual=ACTOR_VISUALS.neon_wraith;
const reactionSnapshot={...snapshot,location:{...snapshot.location,layers:[]},actors:[{id:'enemy',defeated:false,visual:wraithVisual}]};
const reactionScene=new BattleScene(host,reactionSnapshot,()=>{throw new Error('reaction scene failed');});
try {
 const ready=reactionScene.mount();await flush();resolve(wraithVisual.fallbackImageUrl);await flush();await ready;
 for(const pose of Object.values(wraithVisual.keyPoses)){if(pending.has(pose.imageUrl))resolve(pose.imageUrl);}
 await flush();
 const sprite=reactionScene.sprites.get('enemy');
 const texture=frame=>reactionScene.poses.get(`enemy:${frame}`);
 const curse=identifyAction({type:'APPLY_STATUS',payload:{sourceId:'enemy',targetId:'player'}});
 clock=0;publishAction(curse,'begin');reactionScene.update(reactionSnapshot);
 assert.equal(sprite.texture,texture('cast'),'status source uses its authored cast pose');
 clock=159;reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('cast'));
 clock=160;reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('idle'),'cast recovers at 160ms');
 clock=220;reactionScene.update(reactionSnapshot);assert.equal(reactionScene.casts.size,0,'cast expires after 220ms');
 clock=1000;
 const damage=identifyAction({type:'DAMAGE_ENTITY',payload:{sourceId:'player',targetId:'enemy',amount:6}});
 publishImpact(damage,{effect:'damage',targetId:'enemy',hpDelta:-6,blockDelta:0});
 reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('hit'),'actual impact selects authored hit');
 clock=1139;reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('hit'));
 clock=1140;reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('idle'),'authored recovery starts at 140ms');
 clock=1220;reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('idle'));assert.equal(reactionScene.reactions.size,0);
 // A later hit restarts the reaction; defeat overrides it immediately.
 clock=1300;publishImpact(damage,{effect:'burn',targetId:'enemy',hpDelta:-1,blockDelta:0});
 reactionScene.update(reactionSnapshot);assert.equal(sprite.texture,texture('hit'));
 const defeated={...reactionSnapshot,actors:reactionSnapshot.actors.map(actor=>({...actor,defeated:true}))};
 reactionScene.update(defeated);assert.equal(sprite.texture,texture('defeat'),'defeat interrupts active reaction');
 clock=1600;reactionScene.update(defeated);assert.equal(sprite.texture,texture('defeat'),'late frames do not resurrect idle');
 reactionScene.update({...defeated,reducedMotion:true});assert.equal(sprite.texture,texture('defeat'));
 reactionScene.update({...reactionSnapshot,reducedMotion:true});assert.equal(sprite.texture,texture('idle'),'reduced-motion living actor skips hit');
 reactionScene.destroy();
 publishImpact(damage,{effect:'damage',targetId:'enemy',hpDelta:-6,blockDelta:0});
 assert.equal(reactionScene.reactions.size,0,'disposed scene receives no late impacts');
 assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
 console.log('PASS: actual Wraith impact/recovery, repeat hit, defeat interruption, reduced motion and disposal through scene event subscriptions (controlled GPU and clock)');
} finally {reactionScene.destroy();globalThis.performance=originalPerformance;}

// Slime's self-buff applies Block followed immediately by Strength. Preserve the
// brace when the cast and Block reaction overlap, then play the queued cast.
const slimeVisual = ACTOR_VISUALS.sewer_slime;
const slimeSnapshot = {
    ...reactionSnapshot,
    actors: [{id:'enemy',defeated:false,visual:slimeVisual}],
};
const slimeScene = new BattleScene(host,slimeSnapshot,reason=>{throw new Error(reason);});
globalThis.performance = {now:()=>clock};
try {
    const ready = slimeScene.mount();
    await flush();
    resolve(slimeVisual.fallbackImageUrl);
    await ready;
    for (const pose of Object.values(slimeVisual.keyPoses)) {
        if (pending.has(pose.imageUrl)) resolve(pose.imageUrl);
    }
    await flush();
    const sprite = slimeScene.sprites.get('enemy');
    const guard = slimeScene.poses.get('enemy:guard');
    const cast = slimeScene.poses.get('enemy:cast');
    const idle = slimeScene.poses.get('enemy:idle');
    assert.ok(sprite && guard && cast && idle);
    const block = identifyAction({type:'GAIN_BLOCK',payload:{sourceId:'enemy',targetId:'enemy',amount:6}});
    const strength = identifyAction({type:'APPLY_STATUS',payload:{sourceId:'enemy',targetId:'enemy'}});
    const weak = identifyAction({type:'APPLY_STATUS',payload:{sourceId:'enemy',targetId:'player'}});
    clock = 3000;
    publishImpact(block,{effect:'block',targetId:'enemy',hpDelta:0,blockDelta:6});
    publishAction(strength,'begin');
    slimeScene.update(slimeSnapshot);
    assert.equal(sprite.texture,guard,'Block shows its guard first');
    clock += 220;
    slimeScene.update(slimeSnapshot);
    assert.equal(sprite.texture,cast,'Strength plays after the guard');
    clock += 160;
    slimeScene.update(slimeSnapshot);
    assert.equal(sprite.texture,idle);
    publishAction(weak,'begin');
    slimeScene.update(slimeSnapshot);
    assert.equal(sprite.texture,cast,'Weak plays the cast after the Block reaction expires');
    clock += 160;
    slimeScene.update(slimeSnapshot);
    assert.equal(sprite.texture,idle);
} finally {
    slimeScene.destroy();
    globalThis.performance = originalPerformance;
}
assert.deepEqual(battleTextures.stats(),{entries:0,references:0});
console.log('PASS: Slime guard then Strength cast, followed by an independent Weak cast');

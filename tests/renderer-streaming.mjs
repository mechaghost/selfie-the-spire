import assert from 'node:assert/strict';
import {build} from 'esbuild';
const pixi=`
export const apps=[];
export class Rectangle {constructor(x,y,width,height){Object.assign(this,{x,y,width,height});}}
class Pair {set(x,y=x){this.x=x;this.y=y;}}
export class Container {children=[];addChild(...items){this.children.push(...items);} }
export class Graphics extends Container {clear(){return this;}rect(){return this;}ellipse(){return this;}fill(){return this;}}
export class Sprite {constructor(texture){this.texture=texture;}anchor=new Pair();scale=new Pair();position=new Pair();}
export class ImageSource {constructor({resource}){this.resource=resource;}}
export class Texture {constructor({source}){this.source=source;this.width=100;this.height=100;}destroy(){this.destroyed=true;}}
export class Application {constructor(){apps.push(this);}stage=new Container();canvas={setAttribute(){},addEventListener(){},removeEventListener(){}};renderer={resize(){}};ticker={add(){}};async init(){}render(){}start(){}stop(){}destroy(){this.destroyed=true;}}
`;
await build({stdin:{contents:`export * from './src/rendering/BattleScene'; export {publishAction,identifyAction} from './src/rendering/CombatPresentation'; export {apps} from 'pixi.js'; export {battleLayout} from './src/rendering/battleLayout';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/renderer-streaming.mjs',bundle:true,platform:'node',format:'esm',plugins:[{name:'controlled-pixi',setup(b){b.onResolve({filter:/^pixi.js$/},()=>({path:'pixi',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:pixi,loader:'js'}));}}]});
const pending=new Map();
globalThis.Image=class {set src(url){if(url)pending.set(url,this);}};
globalThis.window={devicePixelRatio:1,setTimeout};
const listeners=new Set();
globalThis.document={hidden:false,addEventListener:(type,fn)=>listeners.add(fn),removeEventListener:(type,fn)=>listeners.delete(fn)};
const {BattleScene,battleTextures,apps,battleLayout,publishAction,identifyAction}=await import('./.e2e-out/renderer-streaming.mjs');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const resolve=url=>{const image=pending.get(url);assert.ok(image,url);pending.delete(url);image.onload();};
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

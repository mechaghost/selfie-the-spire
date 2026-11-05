import assert from 'node:assert/strict';
import {build} from 'esbuild';
const pixi=`
export const apps=[];
class Pair {set(x,y=x){this.x=x;this.y=y;}}
export class Container {children=[];addChild(...items){this.children.push(...items);} }
export class Graphics extends Container {clear(){return this;}rect(){return this;}ellipse(){return this;}fill(){return this;}}
export class Sprite {constructor(texture){this.texture=texture;}anchor=new Pair();scale=new Pair();position=new Pair();}
export class ImageSource {constructor({resource}){this.resource=resource;}}
export class Texture {constructor({source}){this.source=source;this.width=100;this.height=100;}destroy(){this.destroyed=true;}}
export class Application {constructor(){apps.push(this);}stage=new Container();canvas={setAttribute(){},addEventListener(){},removeEventListener(){}};renderer={resize(){}};ticker={add(){}};async init(){}render(){}start(){}stop(){}destroy(){this.destroyed=true;}}
`;
await build({stdin:{contents:`export * from './src/rendering/BattleScene'; export {apps} from 'pixi.js'; export {battleLayout} from './src/rendering/battleLayout';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/renderer-streaming.mjs',bundle:true,platform:'node',format:'esm',plugins:[{name:'controlled-pixi',setup(b){b.onResolve({filter:/^pixi.js$/},()=>({path:'pixi',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:pixi,loader:'js'}));}}]});
const pending=new Map();
globalThis.Image=class {set src(url){if(url)pending.set(url,this);}};
globalThis.window={devicePixelRatio:1,setTimeout};
const listeners=new Set();
globalThis.document={hidden:false,addEventListener:(type,fn)=>listeners.add(fn),removeEventListener:(type,fn)=>listeners.delete(fn)};
const {BattleScene,battleTextures,apps,battleLayout}=await import('./.e2e-out/renderer-streaming.mjs');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const resolve=url=>{const image=pending.get(url);assert.ok(image,url);pending.delete(url);image.onload();};
const reject=url=>{const image=pending.get(url);assert.ok(image,url);pending.delete(url);image.onerror();};
const actor=(id)=>({id,defeated:false,visual:{id,fallbackImageUrl:`/${id}`,footAnchor:[.5,1],keyPoses:{attack:{imageUrl:`/${id}-attack`,footAnchor:[.5,1]}}}});
const snapshot={layout:battleLayout(390,400,['enemy'],false),location:{sky:0,ground:0,accent:0,layers:[{url:'/far',depth:0},{url:'/near',depth:2}]},actors:[actor('player'),actor('enemy')],reducedMotion:false};
const host={appendChild(){}};let failures=0;
const scene=new BattleScene(host,snapshot,()=>failures++);
let ready=false;const mounting=scene.mount().then(value=>ready=value);
await flush();resolve('/enemy');await flush();assert.equal(ready,false,'mandatory hero still loading');
resolve('/player');await flush();await mounting;
assert.equal(ready,true,'optional poses and backdrop do not delay actor-ready scene');
assert.equal(pending.size,4);
const world=apps[0].stage.children[3];assert.equal(world.sortableChildren,true);
assert.deepEqual(world.children.map(child=>child.zIndex),[2,3,0,1],'stable roster order independent of completion order');
resolve('/near');resolve('/far');await flush();
const backdrop=apps[0].stage.children[1];assert.equal(backdrop.sortableChildren,true);
assert.deepEqual(backdrop.children.map(child=>child.zIndex),[2,0],'authored depth survives reverse load order');
reject('/player-attack');await flush();assert.equal(failures,0,'missing optional pose keeps idle scene usable');
scene.destroy();assert.equal(listeners.size,0);assert.equal(apps[0].destroyed,true);
resolve('/enemy-attack');await flush();
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

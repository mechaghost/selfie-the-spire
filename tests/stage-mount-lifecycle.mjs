import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/rendering/stageMountLifecycle.ts'],outfile:'tests/.e2e-out/stage-mount-lifecycle.mjs',bundle:true,platform:'node',format:'esm'});
const {startStageMount}=await import('./.e2e-out/stage-mount-lifecycle.mjs');
const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
let next=0;const timers=new Map();
globalThis.setTimeout=(callback,ms)=>{assert.equal(ms,15000);timers.set(++next,callback);return next;};
globalThis.clearTimeout=id=>timers.delete(id);
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
function attempt(load) {
    const events=[];
    const stop=startStageMount({load,onCreate:scene=>events.push(['create',scene]),onReady:scene=>events.push(['ready',scene]),onFailure:()=>events.push(['failure'])});
    return {events,stop};
}
function scene(mount=async()=>true){return {mount,destroys:0,destroy(){this.destroys++;}};}
const expire=()=>{assert.equal(timers.size,1);[...timers.values()][0]();};
try {
    const module=deferred();const late=scene();let constructed=0;
    const imported=attempt(()=>module.promise);await flush();expire();
    module.resolve(()=>{constructed++;return late;});await flush();
    assert.deepEqual(imported.events,[['failure']]);assert.equal(constructed,0,'late module must not create a renderer');imported.stop();

    const mounting=deferred();const slow=scene(()=>mounting.promise);
    const initialized=attempt(async()=>()=>slow);await flush();expire();
    assert.equal(slow.destroys,1);mounting.resolve(true);await flush();
    assert.deepEqual(initialized.events.map(e=>e[0]),['create','failure'],'late mount cannot restore ready');initialized.stop();assert.equal(slow.destroys,1);

    const cancelledModule=deferred();const cancelled=attempt(()=>cancelledModule.promise);cancelled.stop();
    cancelledModule.resolve(()=>{throw new Error('must never construct');});await flush();assert.deepEqual(cancelled.events,[]);assert.equal(timers.size,0);

    const abandonedMount=deferred();const abandoned=scene(()=>abandonedMount.promise);
    const unmounted=attempt(async()=>()=>abandoned);await flush();unmounted.stop();abandonedMount.reject(new Error('late rejection'));await flush();
    assert.deepEqual(unmounted.events.map(e=>e[0]),['create']);assert.equal(abandoned.destroys,1);assert.equal(timers.size,0);

    for(const load of [async()=>{throw new Error('import failed');},async()=>()=>{throw new Error('constructor failed');},async()=>()=>scene(async()=>{throw new Error('mount failed');}),async()=>()=>scene(async()=>false)]) {
        const failed=attempt(load);await flush();assert.equal(failed.events.filter(e=>e[0]==='failure').length,1);assert.equal(timers.size,0);failed.stop();
    }
    const good=scene();const recovered=attempt(async()=>()=>good);await flush();
    assert.deepEqual(recovered.events.map(e=>e[0]),['create','ready']);assert.equal(timers.size,0);
    recovered.stop();recovered.stop();assert.equal(good.destroys,1,'cleanup owns disposal once');
    console.log('PASS: stage import/init deadlines, late success/rejection, cancellation, failed/false mounts, retry success and exactly-once disposal');
} finally {globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;}

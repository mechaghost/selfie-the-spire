interface MountableScene { mount():Promise<boolean>; destroy():void }
/** Owns one asynchronous stage attempt, including module load and GPU initialization. */
export function startStageMount<T extends MountableScene>({load,onCreate,onReady,onFailure,timeoutMs=15000}:{
    load:()=>Promise<()=>T>;
    onCreate:(scene:T)=>void;
    onReady:(scene:T)=>void;
    onFailure:()=>void;
    timeoutMs?:number;
}):()=>void {
    let active=true;
    let owned:T|undefined;
    const dispose=()=>{const current=owned;owned=undefined;current?.destroy();};
    const fail=()=>{
        if(!active)return;
        active=false;clearTimeout(timer);dispose();onFailure();
    };
    const timer=setTimeout(fail,timeoutMs);
    void Promise.resolve().then(load).then(async create=>{
        if(!active)return;
        const created=create();owned=created;onCreate(created);
        const mounted=await created.mount();
        if(!active)return;
        if(!mounted){fail();return;}
        clearTimeout(timer);onReady(created);
    }).catch(fail);
    return ()=>{active=false;clearTimeout(timer);dispose();};
}

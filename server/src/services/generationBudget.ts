import {setTimeout as delay} from 'node:timers/promises';

export class GenerationTimeout extends Error {
    constructor(){super('Character generation timed out');this.name='GenerationTimeout';}
}

/** Bound the whole route, and abort sibling provider calls after any terminal result. */
export async function withGenerationBudget<T>(parent:AbortSignal,work:(signal:AbortSignal)=>Promise<T>,milliseconds=110_000):Promise<T> {
    const controller=new AbortController();
    const parentAborted=()=>controller.abort(parent.reason);
    if(parent.aborted)parentAborted();else parent.addEventListener('abort',parentAborted,{once:true});
    const timer=setTimeout(()=>controller.abort(new GenerationTimeout()),milliseconds);
    let onAbort:()=>void=()=>{};
    const cancelled=new Promise<never>((_,reject)=>{
        onAbort=()=>reject(controller.signal.reason);
        controller.signal.addEventListener('abort',onAbort,{once:true});
        if(controller.signal.aborted)onAbort();
    });
    try {
        return await Promise.race([cancelled,Promise.resolve().then(()=>{
            controller.signal.throwIfAborted();return work(controller.signal);
        })]);
    } finally {
        clearTimeout(timer);parent.removeEventListener('abort',parentAborted);
        controller.signal.removeEventListener('abort',onAbort);
        controller.abort();
    }
}

export async function retryGeneration<T>(operation:()=>Promise<T>,retries=2,signal?:AbortSignal):Promise<T> {
    for(let attempt=0;;attempt++) {
        signal?.throwIfAborted();
        try {
            const result=await operation();signal?.throwIfAborted();return result;
        } catch(error) {
            signal?.throwIfAborted();
            if(attempt>=retries)throw error;
            await delay(1000*(attempt+1),undefined,{signal});
        }
    }
}

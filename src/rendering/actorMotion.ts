import type { ActorClip } from '../core/battleVisualModels';

export type MotionProfile = 'agile' | 'heavy' | 'float' | 'slime';
export interface ActorMotion { x:number; y:number; scaleX:number; scaleY:number; rotation:number; alpha:number }
const floating = new Set(['smoke_specter','neon_wraith','chrome_phantom','dj_phantom']);
const heavy = new Set(['vending_golem','dumpster_crawler','boombox_brute','neon_sentinel','voltage_king','circuit_breaker','chrome_bouncer','the_billboard','subway_wyrm','hero-chrome','hero-concrete']);
export function motionProfile(id:string):MotionProfile {
    return floating.has(id) ? 'float' : id==='sewer_slime' ? 'slime' : heavy.has(id) ? 'heavy' : 'agile';
}
/** Decorative only. Absolute elapsed time prevents replay after a hidden-tab pause. */
export function sampleActorMotion(profile:MotionProfile, clip:ActorClip, elapsed:number, idleTime:number, direction:1|-1, reduced:boolean):ActorMotion {
    const result:ActorMotion={x:0,y:0,scaleX:1,scaleY:1,rotation:0,alpha:1};
    const ms=Math.max(0,elapsed);
    if(clip==='defeat') {
        const p=reduced ? 1 : Math.min(1,ms/280);
        return {...result,y:8*p,scaleY:1-.12*p,alpha:1-.85*p};
    }
    if(reduced)return result;
    if(clip==='attack' && ms<320) {
        // Wind up, contact at the queue's 140ms impact beat, then recover.
        const distance=profile==='heavy'?10:profile==='float'?14:20;
        const x=ms<80 ? -3*Math.sin(ms/80*Math.PI/2) : ms<140 ? -3+(distance+3)*Math.sin((ms-80)/60*Math.PI/2) : distance*Math.pow(1-(ms-140)/180,2);
        return {...result,x:x*direction,rotation:direction*x*.0015,scaleX:1+Math.max(0,x)*.001,scaleY:1-Math.max(0,x)*.001};
    }
    const wave=Math.sin(idleTime/(profile==='heavy'?1050:700));
    if(profile==='float')return {...result,y:-3-wave*2,rotation:wave*.012};
    if(profile==='slime')return {...result,scaleX:1+wave*.018,scaleY:1-wave*.018};
    return {...result,scaleY:1+wave*(profile==='heavy'?.004:.009)};
}

/** Snapshot updates must not restart an attack; repeated actions have distinct tokens. */
export class ActorMotionClock {
    private states=new Map<string,{key:string;at:number}>();
    elapsed(id:string,clip:ActorClip,token:string|undefined,now:number):number {
        const key=`${clip}:${token ?? ''}`;
        let state=this.states.get(id);
        if(!state || state.key!==key){state={key,at:now};this.states.set(id,state);}
        return Math.max(0,now-state.at);
    }
    clear(){this.states.clear();}
}

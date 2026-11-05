import { ActorVisual } from '../core/battleVisualModels';
type Clip = NonNullable<ActorVisual['clips']['idle']>;
/** Absolute-time sampling: dropped frames never extend an action or invoke game callbacks. */
export function clipFrameAt(clip:Clip,elapsedMs:number,reducedMotion=false):string|null {
    if(reducedMotion) return clip.completion==='hold' ? clip.frames[clip.frames.length-1] : null;
    const duration=clip.durationsMs.reduce((sum,ms)=>sum+ms,0);
    let time=Math.max(0,Number.isFinite(elapsedMs)?elapsedMs:duration);
    if(time>=duration) {
        if(clip.loop) time%=duration;
        else return clip.completion==='hold'?clip.frames[clip.frames.length-1]:null;
    }
    for(let i=0;i<clip.frames.length;i++) {
        if(time<clip.durationsMs[i])return clip.frames[i];
        time-=clip.durationsMs[i];
    }
    return null;
}

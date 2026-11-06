import { ActorSlot } from './battleLayout';
/** Shared idle framing for canvas sprites and DOM recovery images. */
export function actorPlacement(slot:ActorSlot,width:number,height:number,anchor:readonly [number,number]) {
    const scale=slot.art.height/height;
    return {scale,width:width*scale,height:height*scale,left:slot.foot.x-width*scale*anchor[0],top:slot.foot.y-height*scale*anchor[1]};
}

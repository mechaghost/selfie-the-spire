import { LocationId } from '../core/battleVisualModels';

export interface AmbientMark { x:number; y:number; width:number; height:number; alpha:number; color:number }
/** Decorative, bounded and deterministic: never consumes the run's RNG. */
export function locationAtmosphere(id:LocationId, width:number, height:number, elapsedMs:number, reducedMotion:boolean):AmbientMark[] {
    if(reducedMotion || width<=0 || height<=0) return [];
    const t=Math.max(0,elapsedMs)/1000;
    const wrap=(value:number)=>((value%1)+1)%1;
    const count=id==='underpass'?16:id==='rooftop'?12:8;
    return Array.from({length:count},(_,i)=>{
        const seed=wrap(i*.61803398875+.13);
        const phase=i*1.7;
        if(id==='underpass') return {x:seed*width,y:wrap(i*.37+t*.19)*height,width:1,height:9,alpha:.12,color:0xa8d8db};
        if(id==='rooftop') return {x:wrap(seed+t*.025)*width,y:(.08+wrap(i*.31)*.72)*height+Math.sin(t+phase)*3,width:2,height:1,alpha:.16,color:0xffce93};
        if(id==='wynwood') return {x:seed*width+Math.sin(t*.3+phase)*5,y:wrap(i*.29-t*.012)*height,width:2,height:2,alpha:.07+.04*Math.sin(t*.6+phase),color:0xf2c065};
        if(id==='club-backlot') return {x:seed*width,y:(.65+wrap(i*.41)*.3)*height,width:width*.045,height:2,alpha:.055+.025*Math.sin(t*1.4+phase),color:i%2?0xc789d9:0x79d9e4};
        return {x:seed*width+Math.sin(t*.35+phase)*3,y:(.7+wrap(i*.43)*.27)*height,width:width*.035,height:1,alpha:.08+.035*Math.sin(t*.8+phase),color:0xf3a49f};
    });
}

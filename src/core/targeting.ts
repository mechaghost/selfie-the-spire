export interface TargetBounds {left:number;top:number;width:number;height:number}
/** One exact rectangle test for preview and commit; no radius padding or DPR conversion. */
export function targetAtPoint(bounds:Record<string,TargetBounds>,livingIds:readonly string[],x:number,y:number):string|null {
    return livingIds.find(id=>{const box=bounds[id];return box && x>=box.left && x<=box.left+box.width && y>=box.top && y<=box.top+box.height;}) ?? null;
}

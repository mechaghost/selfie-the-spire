import textureSources from '../data/battleTextureSources.json';
export interface TextureSourceInfo {width:number;height:number;runtimeWidth:number;runtimeHeight:number;resolution:number}
export function packagedTextureSource(url:string,width:number,height:number):TextureSourceInfo|undefined {
    const entry=(textureSources as Record<string,TextureSourceInfo>)[url];
    return entry && entry.runtimeWidth===width && entry.runtimeHeight===height ? entry : undefined;
}
/** Power-of-two decode tiers keep atlas coordinates in source units. */
export function textureDecodePlan(url:string,width:number,height:number) {
    const limit=url.includes('/locations/')?1536:url.includes('-poses-')?2048:768;
    let resolution=1;
    while(Math.max(width,height)*resolution>limit)resolution/=2;
    return {width:Math.ceil(width*resolution),height:Math.ceil(height*resolution),resolution};
}

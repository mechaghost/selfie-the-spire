import { Rectangle, Texture } from 'pixi.js';
import { AtlasFrame } from '../core/battleVisualModels';

/** Frame views own no source pixels. Destroy views before releasing the atlas lease. */
export function atlasTextures(atlas:Texture,frames:Record<string,AtlasFrame>):Map<string,Texture> {
    // Validate the whole manifest first, so a corrupt late frame cannot leak earlier views.
    for(const frame of Object.values(frames)) {
        const [x,y,w,h]=frame.rect;
        if(x+w>atlas.width || y+h>atlas.height)throw new Error('Atlas frame exceeds loaded texture');
    }
    const result=new Map<string,Texture>();
    try {
        for(const [name,frame] of Object.entries(frames)) {
            const [x,y,w,h]=frame.rect,[sw,sh]=frame.sourceSize,[ox,oy]=frame.offset;
            result.set(name,new Texture({source:atlas.source,frame:new Rectangle(x,y,w,h),orig:new Rectangle(0,0,sw,sh),trim:new Rectangle(ox,oy,w,h)}));
        }
        return result;
    } catch(error) { for(const texture of result.values())texture.destroy(false);throw error; }
}

import {removeGreenScreen} from './chromaKey';

export async function prepareBrowserCombatCutout(source:string,signal?:AbortSignal):Promise<string> {
    if(source.length>10_000_000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(source))throw new Error('Invalid generated character image');
    signal?.throwIfAborted();
    const blob=await (await fetch(source,{signal})).blob();
    const image=await createImageBitmap(blob);
    try {
        signal?.throwIfAborted();
        if(image.width<128 || image.height<128 || image.width>4096 || image.height>4096)throw new Error('Invalid generated character size');
        const scale=Math.min(1,1024/Math.max(image.width,image.height));
        const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
        const context=canvas.getContext('2d',{willReadFrequently:true});
        if(!context)throw new Error('Your browser could not prepare the character');
        context.drawImage(image,0,0,canvas.width,canvas.height);
        const pixels=context.getImageData(0,0,canvas.width,canvas.height);
        const bounds=removeGreenScreen(pixels.data,canvas.width,canvas.height);
        context.putImageData(pixels,0,0);
        const output=document.createElement('canvas');output.width=512;output.height=768;
        const target=output.getContext('2d');if(!target)throw new Error('Your browser could not prepare the character');
        const fit=Math.min(480/bounds.width,736/bounds.height),w=Math.round(bounds.width*fit),h=Math.round(bounds.height*fit);
        target.drawImage(canvas,bounds.left,bounds.top,bounds.width,bounds.height,Math.floor((512-w)/2),760-h,w,h);
        for(const quality of [.85,.7]){
            signal?.throwIfAborted();
            const url=output.toDataURL('image/webp',quality);
            if(url.startsWith('data:image/webp;base64,') && url.length<=512_000)return url;
        }
        throw new Error('Your browser could not save a compact transparent character');
    } finally {image.close();}
}

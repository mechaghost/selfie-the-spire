import {removeGreenScreen} from './chromaKey';
import {isPersonalizedCutout} from './battleVisualModels';

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
        const drawCutout = (width: number) => {
            output.width = width;
            output.height = width * 1.5;
            const scale = width / 512;
            const fit = Math.min(480 * scale / bounds.width, 736 * scale / bounds.height);
            const w = Math.round(bounds.width * fit);
            const h = Math.round(bounds.height * fit);
            target.drawImage(canvas, bounds.left, bounds.top, bounds.width, bounds.height,
                Math.floor((width - w) / 2), Math.round(760 * scale) - h, w, h);
        };
        drawCutout(512);
        for (const quality of [.85, .7]) {
            signal?.throwIfAborted();
            const url = output.toDataURL('image/webp', quality);
            if (!url.startsWith('data:image/webp;')) break;
            if (isPersonalizedCutout(url)) return url;
        }
        for (const width of [384, 256, 192]) {
            signal?.throwIfAborted();
            drawCutout(width);
            const url = output.toDataURL('image/png');
            if (isPersonalizedCutout(url)) return url;
        }
        throw new Error('Your browser could not save a compact transparent character');
    } finally {image.close();}
}

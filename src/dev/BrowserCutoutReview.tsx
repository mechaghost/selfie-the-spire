import {useState} from 'react';
import {prepareBrowserCombatCutout} from '../core/browserCombatCutout';
import fixture from './fixtures/personalCutout.json';

/** Controlled fixture only: exercises the real browser decoder, Canvas and WebP encoder. */
export function BrowserCutoutReview(){
    const [result,setResult]=useState('');
    const [preview,setPreview]=useState('');
    const run=async()=>{
        setResult('Checking browser cutout…');
        try {
            const image=await createImageBitmap(await (await fetch(fixture.idleImageUrl)).blob());
            const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1152;
            const ctx=canvas.getContext('2d')!;
            ctx.fillStyle='#00ff00';ctx.fillRect(0,0,768,1152);
            ctx.drawImage(image,48,48,672,1008);image.close();
            const source=canvas.toDataURL('image/png');
            const start=performance.now();
            const output=await prepareBrowserCombatCutout(source);
            const elapsed=Math.round(performance.now()-start);
            const decoded=await createImageBitmap(await (await fetch(output)).blob());
            canvas.width=decoded.width;canvas.height=decoded.height;
            ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(decoded,0,0);decoded.close();
            const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
            let clear=0,solid=0;for(let i=3;i<rgba.length;i+=4){if(rgba[i]===0)clear++;if(rgba[i]===255)solid++;}
            if(canvas.width!==512 || canvas.height!==768 || clear<1000 || solid<1000)throw new Error('Invalid normalized output');
            const controller=new AbortController();controller.abort();
            let cancelled=false;try{await prepareBrowserCombatCutout(source,controller.signal);}catch(e){cancelled=e instanceof DOMException && e.name==='AbortError';}
            if(!cancelled)throw new Error('Cancellation failed');
            ctx.fillStyle='#888';ctx.fillRect(0,0,canvas.width,canvas.height);
            let rejected=false;try{await prepareBrowserCombatCutout(canvas.toDataURL('image/png'));}catch(e){rejected=e instanceof Error && e.message.includes('clean green');}
            if(!rejected)throw new Error('Invalid background accepted');
            setPreview(output);setResult(`PASS: 512 × 768 transparent WebP; ${output.length} characters; ${elapsed} ms; cancellation and invalid backdrop rejected. Controlled fixture, not live Gemini output.`);
        } catch(e){setResult(`FAIL: ${e instanceof Error?e.message:String(e)}`);}
    };
    return <div><button onClick={run}>Test browser cutout</button><p role="status">{result}</p>{preview&&<img alt="Browser extracted character fixture" src={preview} style={{width:150,background:'repeating-conic-gradient(#444 0% 25%,#222 0% 50%) 0 / 20px 20px'}}/>}</div>;
}

import {useEffect,useRef,useState} from 'react';
import {subscribePresentation} from '../rendering/CombatPresentation';

/** Development-only real GPU-context failure; never mutates combat state. */
export function GraphicsLossReview() {
    const [message,setMessage]=useState('Graphics loss test idle');
    const cancel=useRef<(()=>void)|undefined>(undefined);
    useEffect(()=>()=>cancel.current?.(),[]);
    function lose() {
        const canvas=document.querySelector<HTMLCanvasElement>('.battle-canvas canvas');
        const gl=canvas?.getContext('webgl2') ?? canvas?.getContext('webgl');
        const extension=gl?.getExtension('WEBGL_lose_context');
        if(!canvas || !extension){setMessage('No supported live WebGL context');return;}
        canvas.addEventListener('webglcontextlost',()=>setMessage('Actual WebGL context loss observed'),{once:true});
        extension.loseContext();
        setMessage('WebGL context loss requested');
    }
    function trigger(event:React.MouseEvent<HTMLButtonElement>,nextAction:boolean) {
        cancel.current?.();cancel.current=undefined;
        if(nextAction) {
            cancel.current=subscribePresentation(notice=>{
                if(notice.phase!=='begin' || notice.type!=='DAMAGE_ENTITY')return;
                cancel.current?.();cancel.current=undefined;lose();
            });
            setMessage('Armed: lose graphics on next damage action');
        } else lose();
        event.currentTarget.closest('details')?.removeAttribute('open');
    }
    return <><button onClick={event=>trigger(event,false)}>Lose graphics now</button><button onClick={event=>trigger(event,true)}>Lose graphics on next attack</button><span role="status">{message}</span></>;
}

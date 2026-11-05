import { useEffect, useState } from 'react';
import { CombatClock } from '../../core/combatTiming';
import { DEFEAT_PRESENTATION_MS } from '../../rendering/actorMotion';

/** Delays only the overlay. The queue has already finalized and saved the result. */
export function useResultReveal(result:string|null, animate:boolean):boolean {
    // Restored reward checkpoints open immediately; there is no attack to replay.
    const [revealed,setRevealed]=useState(result);
    useEffect(()=>{
        const clock=new CombatClock();
        const media=matchMedia('(prefers-reduced-motion: reduce)');
        const finish=()=>{clock.cancel();setRevealed(result);};
        const skip=()=>{if(media.matches || document.hidden)finish();};
        if(!result || !animate || media.matches || document.hidden)finish();
        else clock.schedule(finish,DEFEAT_PRESENTATION_MS);
        media.addEventListener('change',skip);
        document.addEventListener('visibilitychange',skip);
        return()=>{clock.cancel();media.removeEventListener('change',skip);document.removeEventListener('visibilitychange',skip);};
    },[result,animate]);
    return !!result && result===revealed;
}

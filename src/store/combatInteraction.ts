import { create } from 'zustand';
import { useGameStore } from './gameStore';
type Mode = 'idle' | 'inspect' | 'targeting' | 'submitting';
interface Interaction { mode:Mode; cardId:string|null; error:string|null; inspect:(id:string)=>void; close:()=>void; choose:()=>void; cancel:()=>void; commit:(targetId?:string)=>boolean }
export const useCombatInteraction = create<Interaction>((set,get)=>({
    mode:'idle',cardId:null,error:null,
    inspect:cardId=>set({mode:'inspect',cardId,error:null}),
    close:()=>set({mode:'idle',cardId:null,error:null}),
    choose:()=>set({mode:'targeting',error:null}),
    cancel:()=>set({mode:'inspect',error:null}),
    commit:targetId=>{
        const selection=get(), state=useGameStore.getState();
        if(selection.mode==='submitting')return false;
        const card=state.hand.find(card=>card.instanceId===selection.cardId);
        if(!card || !state.inCombat || !state.isPlayerTurn || state.isResolving || state.actionQueue.length || state.combatResult){set({mode:'idle',cardId:null,error:null});return false;}
        if(state.player.energy<card.cost){set({error:'Not enough energy.'});return false;}
        if(card.target==='Enemy' && !state.enemies.some(enemy=>enemy.id===targetId && enemy.hp>0)){set({mode:'targeting',error:'Choose a living enemy.'});return false;}
        set({mode:'submitting',error:null});
        state.playCard(card.instanceId,targetId);
        const accepted=!useGameStore.getState().hand.some(item=>item.instanceId===card.instanceId);
        set(accepted ? {mode:'idle',cardId:null,error:null} : {mode:'inspect',error:'Card could not be played. Try again.'});
        return accepted;
    },
}));

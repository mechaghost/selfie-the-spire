import { GameAction } from '../core/models';
export interface ActionIdentity {battleId:string;commandId:string;actionId:string}
export interface ActionNotice extends ActionIdentity {type:GameAction['type'];phase:'begin'|'complete';sourceId?:string;targetId?:string}
let battle=0,command=0,action=0;
const listeners=new Set<(notice:ActionNotice)=>void>();
/** IDs and presentation notifications never consume gameplay RNG. No subscriber can apply an effect. */
export function beginPresentationBattle(){battle++;command=0;action=0;}
export function identifyAction(value:GameAction,parent?:ActionIdentity):GameAction & ActionIdentity {
    if(value.battleId && value.commandId && value.actionId)return value as GameAction & ActionIdentity;
    return {...value,battleId:parent?.battleId ?? `battle-${battle}`,commandId:parent?.commandId ?? `command-${++command}`,actionId:`action-${++action}`};
}
export function identifyChildren(values:GameAction[],parent:ActionIdentity){return values.map(value=>identifyAction(value,parent));}
export function publishAction(value:GameAction & ActionIdentity,phase:ActionNotice['phase']) {
    const notice={battleId:value.battleId,commandId:value.commandId,actionId:value.actionId,type:value.type,phase,sourceId:value.payload?.sourceId,targetId:value.payload?.targetId};
    for(const listener of listeners) { try{listener(notice);}catch{/* Presentation failure cannot interrupt authoritative combat. */} }
}
export function subscribePresentation(listener:(notice:ActionNotice)=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}

import type { Entity } from '../../core/models';
import { STATUS_REGISTRY } from '../../data/statusEffects';

/** The containing actor button supplies the accessible name and inspection action. */
export function ActorStatusSummary({statuses,width}:{statuses:Entity['statuses'];width:number}) {
    if(!statuses.length)return null;
    // Reserve a readable +N count before fitting up to three 16px icons.
    const overflowWidth=8+String(statuses.length).length*9;
    const capacity=Math.max(0,Math.min(3,Math.floor((width-overflowWidth-2)/18)));
    const shown=statuses.length<=Math.min(3,Math.floor(width/18)) ? statuses.length : capacity;
    const remaining=statuses.length-shown;
    return <span className="actor-status-summary" aria-hidden="true" title="Inspect character for effect stacks and details">
        {statuses.slice(0,shown).map(status=><span className="actor-status-symbol" key={status.id} title={`${STATUS_REGISTRY[status.id]?.name ?? status.name ?? status.id} ×${status.amount}`}>{STATUS_REGISTRY[status.id]?.icon ?? '?'}</span>)}
        {remaining>0 && <span className="actor-status-overflow">+{remaining}</span>}
    </span>;
}

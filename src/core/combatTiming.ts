export type MotionMode = 'normal' | 'reduced' | 'off';
export type CombatBeat = 'anticipation' | 'recovery' | 'announcement' | 'enemyGap';
const normal:Record<CombatBeat,number>={anticipation:140,recovery:180,announcement:260,enemyGap:120};
const reduced:Record<CombatBeat,number>={anticipation:0,recovery:100,announcement:160,enemyGap:60};
let mode:MotionMode='normal';
export function setCombatMotionMode(value:MotionMode) { mode=value; }
export function combatDelay(beat:CombatBeat):number { return mode==='off' ? 0 : (mode==='reduced' ? reduced : normal)[beat]; }
/** Even callbacks already queued by a host scheduler become inert after cancellation. */
export class CombatClock {
    private generation=0;
    private pending=new Set<ReturnType<typeof setTimeout>>();
    schedule(fn:()=>void,ms:number) {
        const generation=this.generation;
        const id=setTimeout(()=>{this.pending.delete(id);if(generation===this.generation)fn();},Math.max(0,ms));
        this.pending.add(id);return id;
    }
    cancel() {this.generation++;this.pending.forEach(id=>clearTimeout(id));this.pending.clear();}
    get pendingCount(){return this.pending.size;}
}

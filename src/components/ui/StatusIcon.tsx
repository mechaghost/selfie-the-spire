import { Asterisk, Flame, HeartCrack, HeartPulse, HelpCircle, ShieldPlus, Sword, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './StatusIcon.css';

const symbols:Record<string,{icon:LucideIcon;color:string}>={
    weak:{icon:TrendingDown,color:'#ffc585'},
    vulnerable:{icon:HeartCrack,color:'#ff9caf'},
    burn:{icon:Flame,color:'#ffb276'},
    strength:{icon:Sword,color:'#ffe29a'},
    dexterity:{icon:ShieldPlus,color:'#9cddff'},
    thorns:{icon:Asterisk,color:'#d4bcff'},
    regen:{icon:HeartPulse,color:'#a0efc6'},
};

/** Decorative symbol: adjacent text or the containing control names the effect. */
export function StatusIcon({id}:{id:string}) {
    const {icon:Icon,color}=symbols[id] ?? {icon:HelpCircle,color:'#dce5ee'};
    return <Icon className="effect-symbol" aria-hidden="true" focusable="false" size={16} strokeWidth={2.25} style={{color}}/>;
}

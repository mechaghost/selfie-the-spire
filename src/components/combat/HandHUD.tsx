import { useEffect, useRef } from 'react';
import { CardInspector } from '../ui/CardInspector';
import { useGameStore } from '../../store/gameStore';
import { CardItem } from '../ui/CardItem';
import '../ui/CardItem.css';
import { useCombatInteraction } from '../../store/combatInteraction';

export function HandHUD() {
    const { hand, player, playingCards } = useGameStore(state => ({
        hand: state.hand,
        player: state.player,
        playingCards: state.playingCards
    }));

    const {cardId:selectedId,mode,error,inspect,close,choose,cancel,commit} = useCombatInteraction();
    const targeting = mode === 'targeting';
    const previousMode = useRef(mode);
    useEffect(() => {
        const previous = previousMode.current; previousMode.current = mode;
        if (!((previous === 'targeting' && mode === 'inspect') || (previous !== 'idle' && mode === 'idle'))) return;
        const timer = setTimeout(() => document.querySelector<HTMLElement>(mode === 'inspect' ? '[data-play-card]' : '.hand-container .card[tabindex], .end-turn-button')?.focus(), 0);
        return () => clearTimeout(timer);
    }, [mode]);
    const phase = useGameStore(state => state.isPlayerTurn && !state.isResolving && state.actionQueue.length === 0 && !state.combatResult);
    const previousPhase = useRef(phase);
    useEffect(() => {
        const wasReady=previousPhase.current;previousPhase.current=phase;
        if(!phase || wasReady)return;
        const timer=setTimeout(()=>document.querySelector<HTMLElement>('.hand-container .card[tabindex], .end-turn-button')?.focus(),0);
        return()=>clearTimeout(timer);
    },[phase]);
    const enemies = useGameStore(state => state.enemies);
    const selected = hand.find(card => card.instanceId === selectedId);
    useEffect(() => { if (!phase) close(); }, [phase,close]);
    useEffect(() => () => close(), [close]);
    useEffect(() => {
        if (!targeting) return;
        const timer = setTimeout(() => document.querySelector<HTMLButtonElement>('[data-combat-target]:not(:disabled), .combat-target-list button')?.focus(), 0);
        const escape = (event: KeyboardEvent) => { if(event.key === 'Escape') { event.preventDefault(); cancel(); } };
        window.addEventListener('keydown',escape);
        return () => { clearTimeout(timer);window.removeEventListener('keydown',escape); };
    }, [targeting,cancel]);
    const totalCards = hand.length;
    const totalRows = Math.ceil(totalCards / 3);

    return (
        <div className={`hand-container ${totalCards > 6 ? 'hand-overflow' : ''}`} style={{ '--total-rows': totalRows, '--hand-gaps': Math.max(1, totalCards - 1) } as React.CSSProperties}>
            {hand.map((card, index) => {
                const middleIndex = (totalCards - 1) / 2;
                const offset = index - middleIndex;
                const rotation = Math.max(-10, Math.min(10, offset * 3));
                const translateY = Math.abs(offset) * 4;

                // Per-row layout for mobile (3 columns, centered)
                const col = index % 3;
                const rowIndex = Math.floor(index / 3);
                const rowStart = rowIndex * 3;
                const rowLength = Math.min(3, totalCards - rowStart);
                const rowMiddle = (rowLength - 1) / 2;
                const rowFanOffset = col - rowMiddle;
                const rowOffset = col - (rowLength - 1) / 2;

                const canPlay = player.energy >= card.cost;

                return (
                    <div
                        key={card.instanceId}
                        className="card-slot"
                        style={{
                            '--card-offset': offset,
                            '--row-offset': rowOffset,
                            '--row-index': rowIndex,
                            '--row-rotation': `${rowFanOffset * 2}deg`,
                            '--row-lift': `${Math.abs(rowFanOffset) * 2}px`,
                            zIndex: 10 + index
                        } as React.CSSProperties}
                    >
                        <div className="card-deal-motion">
                        <CardItem
                            card={card}
                            onInspect={() => inspect(card.instanceId)}
                            canPlay={canPlay}
                            isDraggable={true}
                            style={{
                                transform: `translateY(${translateY}px) rotate(${rotation}deg)`
                            }}
                        />
                        </div>
                    </div>
                );
            })}

            {selected && mode === 'inspect' && <CardInspector card={selected} onClose={close}>
                <div className="inspection-actions">
                    {error && <p role="alert">{error}</p>}
                    {!phase ? <p>Wait for your turn.</p> : player.energy < selected.cost ? <p>Not enough energy: need {selected.cost}, have {player.energy}.</p> : <button data-play-card onClick={() => selected.target === 'Enemy' ? choose() : commit()}>Play card</button>}
                </div>
            </CardInspector>}
            {selected && targeting && <div className="combat-target-selection" role="region" aria-label="Choose card target" onClick={event=>event.stopPropagation()}>
                <p><strong>{selected.name}</strong> · Choose an enemy</p>
                {error && <p role="alert">{error}</p>}
                <div className="combat-target-list">{enemies.filter(enemy=>enemy.hp>0).map(enemy=><button key={enemy.id} onClick={()=>commit(enemy.id)}>{enemy.name} · {enemy.hp} HP</button>)}</div>
                <button onClick={cancel}>Cancel targeting</button>
            </div>}
            {playingCards.map((pc) => (
                <div key={pc.id} className="card-playing-wrapper">
                    <CardItem
                        card={pc.card}
                        canPlay={true}
                        isDraggable={false}
                    />
                </div>
            ))}
        </div>
    );
}

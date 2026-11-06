import { useEffect, useLayoutEffect, useRef } from 'react';
import { CardInspector } from '../ui/CardInspector';
import { useGameStore } from '../../store/gameStore';
import { CardItem } from '../ui/CardItem';
import '../ui/CardItem.css';
import { useCombatInteraction } from '../../store/combatInteraction';

export function HandHUD({targetControls='list',onTargetControlsChange}:{targetControls?:'arena'|'list';onTargetControlsChange?:(value:'arena'|'list')=>void}) {
    const { hand, player, playingCards } = useGameStore(state => ({
        hand: state.hand,
        player: state.player,
        playingCards: state.playingCards
    }));

    const {cardId:selectedId,mode,error,inspect,close,choose,cancel,commit} = useCombatInteraction();
    const targeting = mode === 'targeting';
    const previousMode = useRef(mode);
    const inspectedCard = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const previous = previousMode.current; previousMode.current = mode;
        if (!((previous === 'targeting' && mode === 'inspect') || (previous !== 'idle' && mode === 'idle'))) return;
        const timer = setTimeout(() => {
            if (mode === 'inspect') {
                document.querySelector<HTMLElement>('[data-play-card]')?.focus();
            } else if (inspectedCard.current?.isConnected) {
                inspectedCard.current.focus();
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [mode]);
    const phase = useGameStore(state => state.isPlayerTurn && !state.isResolving && state.actionQueue.length === 0 && !state.combatResult);
    const previousPhase = useRef(phase);
    useEffect(() => {
        const wasReady=previousPhase.current;previousPhase.current=phase;
        if(!phase || wasReady)return;
        const timer=setTimeout(() => {
            const firstCard = document.querySelector<HTMLElement>('.hand-container .card[tabindex]');
            (firstCard ?? document.querySelector<HTMLElement>('.end-turn-button'))?.focus();
        },0);
        return()=>clearTimeout(timer);
    },[phase]);
    const enemies = useGameStore(state => state.enemies);
    const selected = hand.find(card => card.instanceId === selectedId);
    useEffect(() => { if (!phase) close(); }, [phase,close]);
    useEffect(() => () => close(), [close]);
    useLayoutEffect(() => {
        if (!targeting) return;
        document.querySelector<HTMLButtonElement>(targetControls==='arena' ? '[data-combat-target]:not(:disabled)' : '.combat-target-list button')?.focus();
        const escape = (event: KeyboardEvent) => { if(event.key === 'Escape') { event.preventDefault(); cancel(); } };
        window.addEventListener('keydown',escape);
        return () => window.removeEventListener('keydown',escape);
    }, [targeting,cancel,targetControls]);
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
                            onInspect={() => {
                                inspectedCard.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                                inspect(card.instanceId);
                            }}
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
                {targetControls==='list' && <div className="combat-target-list">{enemies.map((enemy,index)=>enemy.hp>0 && <button key={enemy.id} aria-label={`${enemy.name}, slot ${index+1}, ${enemy.hp} HP`} onClick={()=>commit(enemy.id)}>{enemy.name} · {enemy.hp} HP</button>)}</div>}
                {onTargetControlsChange && <button onClick={()=>onTargetControlsChange(targetControls==='arena'?'list':'arena')}>{targetControls==='arena'?'Use target list':'Use arena targets'}</button>}
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

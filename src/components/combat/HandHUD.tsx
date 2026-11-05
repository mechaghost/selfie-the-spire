import { useState, useEffect } from 'react';
import { CardInspector } from '../ui/CardInspector';
import { useGameStore } from '../../store/gameStore';
import { CardItem } from '../ui/CardItem';
import '../ui/CardItem.css';

export function HandHUD() {
    const { hand, player, playingCards } = useGameStore(state => ({
        hand: state.hand,
        player: state.player,
        playingCards: state.playingCards
    }));

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [targeting, setTargeting] = useState(false);
    const phase = useGameStore(state => state.isPlayerTurn && !state.isResolving && state.actionQueue.length === 0 && !state.combatResult);
    const enemies = useGameStore(state => state.enemies);
    const selected = hand.find(card => card.instanceId === selectedId);
    useEffect(() => { if (!phase) { setSelectedId(null); setTargeting(false); } }, [phase]);
    const close = () => { setSelectedId(null); setTargeting(false); };
    const commit = (targetId?: string) => { if (selected) useGameStore.getState().playCard(selected.instanceId, targetId); close(); };
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
                            onInspect={() => { setSelectedId(card.instanceId); setTargeting(false); }}
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

            {selected && <CardInspector card={selected} onClose={close}>
                <div className="inspection-actions">
                    {!phase ? <p>Wait for your turn.</p> : player.energy < selected.cost ? <p>Not enough energy: need {selected.cost}, have {player.energy}.</p> : targeting ? <>
                        <p>Choose an enemy</p>
                        {enemies.filter(enemy => enemy.hp > 0).map((enemy, index) => <button autoFocus={index === 0} key={enemy.id} onClick={() => commit(enemy.id)}>{enemy.name} · {enemy.hp} HP</button>)}
                        <button onClick={() => setTargeting(false)}>Cancel targeting</button>
                    </> : <button onClick={() => selected.target === 'Enemy' ? setTargeting(true) : commit()}>Play card</button>}
                </div>
            </CardInspector>}
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

import { useState } from 'react';
import { CardInspector } from '../ui/CardInspector';
import { DeckBrowser } from '../ui/DeckBrowser';
import { useGameStore } from '../../store/gameStore';
import { Trophy, Skull } from 'lucide-react';
import { CardItem } from '../ui/CardItem';
import './CombatResultOverlay.css';
import { useResultReveal } from './useResultReveal';

export function CombatResultOverlay({animateDefeat=false}:{animateDefeat?:boolean}) {
    const { combatResult, goldReward, cardRewards, floor, seed, initializeRun, continueCombatResult, claimCardReward } = useGameStore((state) => ({
        combatResult: state.combatResult,
        goldReward: state.goldReward,
        cardRewards: state.cardRewards,
        floor: state.floor,
        seed: state.seed,
        initializeRun: state.initializeRun,
        continueCombatResult: state.continueCombatResult,
        claimCardReward: state.claimCardReward
    }));

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const revealed=useResultReveal(combatResult,animateDefeat);
    const selected = cardRewards.find(card => card.instanceId === selectedId);
    if (!combatResult || !revealed) return null;

    const isVictory = combatResult === 'victory';
    const hasRewards = isVictory && cardRewards.length > 0;

    const handleNewRun = () => {
        const newSeed = Math.random().toString(36).substring(7);
        initializeRun(newSeed);
    };

    return (
        <div className="combat-result-backdrop">
            <div className={`combat-result-card ${combatResult}`}>
                <header className="combat-result-header">
                {isVictory ? (
                    <Trophy size={48} className="combat-result-icon victory" />
                ) : (
                    <Skull size={64} className="combat-result-icon defeat" />
                )}

                <h1 className={`combat-result-title ${combatResult}`}>
                    {isVictory ? 'VICTORY' : 'DEFEAT'}
                </h1>

                <p className="combat-result-stats">
                    {isVictory ? (
                        <>Gold earned: <strong className="combat-result-gold">{goldReward}</strong></>
                    ) : (
                        <>Floor reached: <strong>{floor}</strong></>
                    )}
                </p>

                </header>

                {hasRewards && (
                    <div className="reward-section">
                        <h2 className={`reward-heading ${cardRewards.every(c => c.upgraded) ? 'prime' : ''}`}>
                            {cardRewards.every(c => c.upgraded) ? 'Upgraded rewards' : 'Choose a card'}
                        </h2>
                        <p className="reward-hint">
                            {cardRewards.every(c => c.upgraded)
                                ? 'These cards are already upgraded. Choose one, or skip and keep the gold.'
                                : 'Inspect a card, then add one to your deck. Skipping still awards the gold.'}
                        </p>
                        <div className="reward-card-row">
                            {cardRewards.map((card, i) => (
                                <div
                                    key={card.instanceId}
                                    className="reward-card-slot"
                                    style={{ animationDelay: `${0.15 + i * 0.12}s` }}

                                >
                                    <CardItem card={card} canPlay={true} isDraggable={false} onInspect={() => setSelectedId(card.instanceId)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {selected && <CardInspector card={selected} onClose={() => setSelectedId(null)}>
                    <button onClick={() => { claimCardReward(selected.instanceId); setSelectedId(null); }}>Add to deck</button>
                </CardInspector>}
                <div className="combat-result-actions">
                    {hasRewards && <DeckBrowser />}
                    {isVictory ? (
                        <button
                            className={`combat-result-btn ${hasRewards ? 'secondary' : 'primary victory'}`}
                            onClick={continueCombatResult}
                        >
                            {hasRewards ? 'Skip card · collect gold' : 'Continue'}
                        </button>
                    ) : (
                        <>
                            <button
                                className="combat-result-btn primary defeat"
                                onClick={handleNewRun}
                            >
                                New starter run
                            </button>
                            <button
                                className="combat-result-btn secondary"
                                onClick={() => initializeRun(seed)}
                            >
                                Retry route · starter hero
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

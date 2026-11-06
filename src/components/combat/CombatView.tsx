import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Enemy } from '../../core/models';
import { TopBar } from '../ui/TopBar';
import { EntityPanel, describeIntent, describeStatuses } from './EntityPanel';
import { HandHUD } from './HandHUD';
import { TargetingArrow } from './TargetingArrow';
import { CombatResultOverlay } from './CombatResultOverlay';
import './CombatView.css';
import { useCombatInteraction } from '../../store/combatInteraction';
import { BattleArena } from './BattleArena';
import { CityBackdrop } from '../ui/CityBackdrop';

export function CombatView() {
    const actorArena = import.meta.env.VITE_COMBAT_ARENA === '1' || (import.meta.env.DEV && new URLSearchParams(location.search).has('arena'));
    const [targetControls,setTargetControls]=useState<'arena'|'list'>('arena');
    const {
        player, enemies, endTurn, energy, maxEnergy, isPlayerTurn, combatResult, screenShake
    } = useGameStore((state) => ({
        player: state.player,
        enemies: state.enemies,
        endTurn: state.endTurn,
        energy: state.player.energy,
        maxEnergy: state.player.maxEnergy,
        isPlayerTurn: state.isPlayerTurn,
        combatResult: state.combatResult,
        screenShake: state.screenShake
    }));

    const busy = useGameStore(state => state.isResolving || state.actionQueue.length > 0);
    const targeting = useCombatInteraction(state=>state.mode === 'targeting');
    const isDisabled = !isPlayerTurn || busy || combatResult !== null || targeting;

    const [inspectedEnemyId, setInspectedEnemyId] = useState<string | null>(null);

    // Flash "YOUR TURN" when control comes back to the player
    const [showTurnFlash, setShowTurnFlash] = useState(false);
    const prevTurnRef = useRef(isPlayerTurn);
    useEffect(() => {
        const wasPlayerTurn = prevTurnRef.current;
        prevTurnRef.current = isPlayerTurn;
        if (isPlayerTurn && !wasPlayerTurn && !combatResult) {
            setShowTurnFlash(true);
            const t = setTimeout(() => setShowTurnFlash(false), 1100);
            return () => clearTimeout(t);
        }
    }, [isPlayerTurn, combatResult]);

    const handleStageClick = useCallback(() => {
        setInspectedEnemyId(null);
    }, []);

    const handleEnemyInspect = useCallback((enemyId: string) => {
        setInspectedEnemyId(prev => prev === enemyId ? null : enemyId);
    }, []);

    const inspectedEnemy = useMemo(() =>
        inspectedEnemyId ? enemies.find(e => e.id === inspectedEnemyId) as Enemy | undefined : undefined,
        [inspectedEnemyId, enemies]
    );

    const turnBanner = !combatResult && (!isPlayerTurn || showTurnFlash) && (
        <div className={`turn-phase-banner ${isPlayerTurn ? 'player-turn' : 'enemy-turn'}`}>
            {isPlayerTurn ? 'Your turn' : 'Enemy turn'}
        </div>
    );

    return (
        <div
            className={`combat-stage ${actorArena ? 'actor-arena-enabled' : ''} ${screenShake ? `shake-${screenShake.intensity}` : ''}`}
            onClick={handleStageClick}
        >
            <CityBackdrop />
            <div className="arena-location"><span>NEO MIAMI / AFTER HOURS</span><strong>Ocean Drive</strong></div>

            <TopBar />

            {actorArena ? <BattleArena targetControls={targetControls} /> : <div className="entities-container">
                {/* Compact player presence for animations/floating text */}
                <div className="player-presence">
                    <EntityPanel entity={player} isPlayer={true} />
                </div>

                {/* Enemy zone */}
                <div className="enemy-zone">
                    {enemies.map((enemy) => (
                        <EntityPanel
                            key={enemy.id}
                            entity={enemy}
                            isPlayer={false}
                            inspectedEnemyId={inspectedEnemyId}
                            onInspect={handleEnemyInspect}
                        />
                    ))}
                </div>
            </div>}

            {/* Enemy inspect tooltip — rendered outside overflow:hidden container */}
            {inspectedEnemy && (
                <div className="enemy-info-tooltip">
                    <p className="enemy-info-name">{inspectedEnemy.name}</p>
                    <p className="enemy-info-intent">{describeIntent(inspectedEnemy.intent, inspectedEnemy.statuses, useGameStore.getState().player.statuses)}</p>
                    {inspectedEnemy.block > 0 && <p className="enemy-info-line">Block: {inspectedEnemy.block}</p>}
                    {describeStatuses(inspectedEnemy.statuses).map((line, i) => (
                        <p key={i} className="enemy-info-line">{line}</p>
                    ))}
                    {inspectedEnemy.statuses.length === 0 && inspectedEnemy.block === 0 && (
                        <p className="enemy-info-line">No active effects</p>
                    )}
                </div>
            )}

            {!actorArena && turnBanner}

            <div className="table-controls">
                <div className="controls-left">
                    <div className={`energy-orb ${energy === 0 ? 'empty' : ''} ${energy === maxEnergy && isPlayerTurn ? 'full' : ''}`}>
                        <span className="energy-current">{energy}</span>
                        <span className="energy-max">/{maxEnergy}</span>
                    </div>
                    <span className="energy-caption">Energy</span>
                </div>

                {actorArena && turnBanner}

                <div className="controls-right">
                    <button className="end-turn-button" onClick={endTurn} disabled={isDisabled}>
                        End Turn
                    </button>
                </div>
            </div>

            <div className="hand-caption" aria-hidden="true"><span>Your hand<small className="hand-scroll-hint"> · swipe</small></span><span>Inspect a card. Make your move.</span></div>
            <div className={`deck-table ${isDisabled ? 'disabled' : ''}`}>
                <HandHUD targetControls={actorArena?targetControls:'list'} onTargetControlsChange={actorArena?setTargetControls:undefined}/>
            </div>

            <TargetingArrow />
            <CombatResultOverlay animateDefeat={actorArena} />
        </div>
    );
}

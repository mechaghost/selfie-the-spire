import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { X } from 'lucide-react';
import './TopBar.css';
import { InspectionDialog } from './CardInspector';
import { DeckBrowser } from './DeckBrowser';

const FINAL_FLOOR = 9; // 8 map floors + the boss

export function TopBar() {
    const { player, floor, abandonRun } = useGameStore(state => ({
        player: state.player,
        floor: state.floor,
        abandonRun: state.abandonRun,
    }));
    const [confirmAbandon, setConfirmAbandon] = useState(false);

    const hpPct = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;

    return (
        <div className="topbar-container">
            <div className="topbar-section">
                {confirmAbandon && <InspectionDialog title="End this run?" onClose={() => setConfirmAbandon(false)}>
                    <p>Your progress in this run will be lost.</p>
                    <button className="abandon-yes" onClick={abandonRun}>End run</button>
                    <button className="abandon-no" onClick={() => setConfirmAbandon(false)}>Keep playing</button>
                </InspectionDialog>}
                    <>
                        <button className="abandon-btn" onClick={() => setConfirmAbandon(true)} title="End run and lose progress" aria-label="End run and lose progress">
                            <X size={16} />
                        </button>
                        {player.maxHp > 0 && (
                            <div className="player-hp-inline" title={`${player.name || 'You'}: ${player.hp}/${player.maxHp} HP`}>
                                <div className="player-hp-bar-bg">
                                    <div className="player-hp-bar-fill" style={{ width: `${hpPct}%` }} />
                                </div>
                                <div className="player-hp-text">{player.hp}/{player.maxHp}</div>
                            </div>
                        )}
                    </>
            </div>

            <div className="topbar-section center">
                <span className="floor-text">{floor === 0 ? 'Street level' : <>Floor {floor}<span className="floor-total"> / {FINAL_FLOOR}</span></>}</span>
            </div>

            <div className="topbar-section right">
                <DeckBrowser />
                <span className="stat gold">💰 {player.gold}</span>
            </div>
        </div>
    );
}

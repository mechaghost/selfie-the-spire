import { useGameStore } from './store/gameStore';
import { CombatView } from './components/combat/CombatView';
import { MapView } from './components/map/MapView';
import { RestSiteView } from './components/map/RestSiteView';
import { ShopView } from './components/map/ShopView';
import { MysteryEventView } from './components/map/MysteryEventView';
import { GameOverView } from './components/ui/GameOverView';
import { RunVictoryView } from './components/ui/RunVictoryView';
import { SelfieCaptureScreen } from './components/ugc/SelfieCaptureScreen';
import { CharacterRevealScreen } from './components/ugc/CharacterRevealScreen';
import { MainMenu } from './components/ui/MainMenu';
import { InspectionDialog } from './components/ui/CardInspector';
import './App.css';
import './mobile.css';


function GameScreen() {
    const { inCombat, seed, isGameOver, isRunComplete, ugcPhase, nodeEvent } = useGameStore();

    if (import.meta.env.DEV) {
        (window as any).__gameStore = useGameStore; // eslint-disable-line
    }

    if (inCombat) return <CombatView />;
    if (isRunComplete) return <RunVictoryView />;
    if (isGameOver) return <GameOverView />;
    if (nodeEvent === 'rest') return <RestSiteView />;
    if (nodeEvent === 'shop') return <ShopView />;
    if (nodeEvent === 'mystery') return <MysteryEventView />;
    if (seed) return <div className="app-container"><MapView /></div>;

    if (ugcPhase === 'capture' || ugcPhase === 'generating') return <SelfieCaptureScreen />;
    if (ugcPhase === 'reveal') return <CharacterRevealScreen />;

    return <MainMenu />;
}

function App() {
    const { saveError, recoveryNotice, dismissRecovery } = useGameStore();
    return <>
        <GameScreen />
        {saveError && <div className="save-status" role="status">{saveError}</div>}
        {recoveryNotice && <InspectionDialog title="Saved run update" onClose={dismissRecovery}>
            <p>{recoveryNotice}</p>
            <button onClick={dismissRecovery}>Continue</button>
        </InspectionDialog>}
    </>;
}

export default App;

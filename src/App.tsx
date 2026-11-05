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
import './App.css';
import './mobile.css';


function App() {
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

export default App;

import { useState } from 'react';
import {GraphicsLossReview} from './GraphicsLossReview';
import {populateFullHandReview} from './fullHandReview';
import App from '../App';
import { useGameStore } from '../store/gameStore';
import { createCardInstance } from '../data/cards';
import { createEnemyInstance } from '../data/enemies';
import fixture from './fixtures/personalCutout.json';
import { GeneratedCharacter } from '../core/models';

const character: GeneratedCharacter = { id: 'review', name: 'Neon Runner', archetype: 'neon', title: 'The last light on Ocean Drive', portraitUrl: '/assets/characters/neon.webp', maxHp: 80, maxEnergy: 3, startingGold: 99, traits: ['Streetwise', 'Fearless'] };
const cards = ['neon_jab', 'dodge_roll', 'haymaker'].map(id => createCardInstance(id));
function reveal(personal=false) { useGameStore.setState({ seed: '', ugcPhase: 'reveal', generatedCharacter: personal ? {...character,name:'CUTOUT TEST',title:'Local art fixture · no photo',combatAppearance:{version:2,actorVisualId:'hero-chrome',idleImageUrl:fixture.idleImageUrl}} : character, generatedCards: Array.from({ length: 13 }, (_, index) => ({ ...cards[index % cards.length], isHeroCard: index === 12 })) }); }
const screens = ['Landing', 'Capture', 'Waiting', 'Error', 'Reveal', 'Personal reveal', 'Personal combat', 'Map', 'Combat', 'Full hand', 'Status HUD', 'Rewards', 'Shop', 'Rest', 'Mystery', 'Victory', 'Defeat'] as const;
export default function ReviewHarness() {
    const [revision, setRevision] = useState(0);
    const show = (screen: string) => {
        const store = useGameStore;
        store.getState().initializeRun('portfolio-review');
        store.setState({ floor: 3, player: { ...store.getState().player, hp: 72 }, submitSelfie: async () => reveal() });
        switch (screen) {
            case 'Map': store.setState({ floor: 0 }); break;
            case 'Landing': store.setState({ seed: '' }); break;
            case 'Capture': store.setState({ seed: '', ugcPhase: 'capture' }); break;
            case 'Waiting': store.setState({ seed: '', ugcPhase: 'generating', selfieDataUrl: '/assets/characters/neon.webp' }); break;
            case 'Error': store.setState({ seed: '', ugcPhase: 'capture', ugcError: 'The connection dropped. Try again or play a starter hero.' }); break;
            case 'Reveal': reveal(); break;
            case 'Personal reveal': reveal(true); break;
            case 'Personal combat': reveal(true); store.getState().startGeneratedRun();store.getState().startCombat(['alley_rat','vending_golem','fire_escape_spider'].map((id,i)=>createEnemyInstance(id,`review-personal-${i}`,store.getState().rng)));break;
            case 'Combat': store.getState().startCombat(['alley_rat', 'vending_golem', 'fire_escape_spider'].map((id, i) => createEnemyInstance(id, `review-${i}`, store.getState().rng))); break;
            case 'Full hand': populateFullHandReview(); break;
            case 'Status HUD': {
                const pending=populateFullHandReview();
                const deck=store.getState().masterDeck;
                pending.then(()=>{
                    const state=store.getState();
                    if(state.masterDeck!==deck || !state.inCombat || state.enemies[0]?.id!=='review-0')return;
                    const statuses=[{id:'weak',amount:2},{id:'burn',amount:3},{id:'strength',amount:1},{id:'vulnerable',amount:2}];
                    store.setState({player:{...state.player,block:8,statuses},enemies:state.enemies.map(enemy=>({...enemy,block:5,statuses}))});
                });
                break;
            }
            case 'Rewards': store.setState({ inCombat: true, combatResult: 'victory', goldReward: 25, cardRewards: cards }); break;
            case 'Shop': store.getState().enterShop(); break;
            case 'Rest': store.setState({ nodeEvent: 'rest' }); break;
            case 'Mystery': store.getState().enterMystery(); break;
            case 'Victory': store.setState({ isRunComplete: true, floor: 9 }); break;
            case 'Defeat': store.setState({ isGameOver: true }); break;
        }
        setRevision(value => value + 1);
    };
    return <><App key={revision} /><details style={{ position: 'fixed', right: 4, bottom: 4, zIndex: 20000, background: '#080d1b', color: 'white', maxWidth: 300, border: '1px solid #72dccc', padding: 6, fontSize: 12 }}><summary>Review screens · local fixtures</summary><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8 }}>{screens.map(screen => <button key={screen} onClick={event => { show(screen); event.currentTarget.closest('details')?.removeAttribute('open'); }}>{screen}</button>)}<GraphicsLossReview key={revision}/></div></details></>;
}

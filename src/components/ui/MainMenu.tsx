import { useState } from 'react';
import { ArrowUpRight, Camera, Swords, BookOpen, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { CARD_DATABASE } from '../../data/cards';
import { Card } from '../../core/models';
import { CardItem } from './CardItem';
import { CardInspector, InspectionDialog } from './CardInspector';
import { CityBackdrop } from './CityBackdrop';
import './MainMenu.css';

export function MainMenu() {
    const { initializeRun, startSelfieCapture } = useGameStore();
    const [help, setHelp] = useState(false);
    const [card, setCard] = useState<Card | null>(null);
    return <main className="main-menu">
        <CityBackdrop />
        <div className="menu-scrim" />
        <div className="menu-shell">
            <header className="menu-masthead"><span>NEO MIAMI <span aria-hidden="true">/</span> AFTER HOURS</span><span className="menu-edition">A ROGUELIKE DECKBUILDER</span></header>
            <div className="menu-stage">
                <section className="menu-intro" aria-labelledby="menu-title">
                    <p className="menu-eyebrow">FROM STREET LEVEL TO SKYLINE</p>
                    <h1 id="menu-title">SELFIE <span className="menu-title-line"><small>THE</small> SPIRE<span className="menu-title-dot">.</span></span></h1>
                    <p className="menu-tagline">Your face. Your hero. Your deck.</p>
                    <p className="menu-description">Build your hand. Pick your route. Take on nine floors of street magic, strange enemies, and one final boss.</p>
                    <nav className="menu-actions" aria-label="Main menu">
                        <button className="menu-play" onClick={() => initializeRun(globalThis.crypto?.randomUUID?.() ?? `starter_${Date.now()}`)}>
                            <Swords aria-hidden="true" size={23} /><span><strong>Play a starter run</strong><small>Street Runner · jump straight in</small></span><ArrowUpRight aria-hidden="true" size={24} />
                        </button>
                        <button className="menu-create" onClick={startSelfieCapture}>
                            <Camera aria-hidden="true" size={23} /><span><strong>Create my hero</strong><small>Your photo → an AI hero & signature card</small></span><ArrowUpRight aria-hidden="true" size={24} />
                        </button>
                        <button className="menu-help" onClick={() => setHelp(true)}><BookOpen aria-hidden="true" size={17} /> How to play <ArrowRight aria-hidden="true" size={16} /></button>
                    </nav>
                    <p className="menu-footnote">No photo needed for a starter run.</p>
                </section>
                <section className="menu-showcase" aria-label="Meet the starter hero">
                    <div className="menu-hero-top"><span>01 / STREET RUNNER</span><span>STARTER HERO</span></div>
                    <div className="menu-portrait"><img src="/assets/characters/neon.webp" alt="Street Runner, a neon-lit street mage" /><div className="menu-portrait-caption"><span>OCEAN DRIVE</span><strong>The night is yours.</strong></div></div>
                    <div className="menu-sample-heading"><span>A TASTE OF YOUR DECK</span><span>Inspect a card <ArrowUpRight size={13} aria-hidden="true" /></span></div>
                    <div className="menu-sample-cards">{['neon_jab', 'dodge_roll', 'haymaker'].map(id => <CardItem key={id} card={CARD_DATABASE[id]} isDraggable={false} onInspect={() => setCard(CARD_DATABASE[id])} />)}</div>
                </section>
            </div>
            <footer className="menu-footer"><span>9 FLOORS <i aria-hidden="true">/</i> ONE SHOT AT THE TOP</span><span>Fight. Refine your deck. Rise.</span></footer>
        </div>
        {card && <CardInspector card={card} onClose={() => setCard(null)} />}
        {help && <InspectionDialog title="How to play" onClose={() => setHelp(false)}>
            <ol className="menu-rules"><li><strong>Choose your hero.</strong> Start immediately with Street Runner, or use a photo to create an AI hero and signature card.</li><li><strong>Pick a route.</strong> Choose connected stops on the map: fights, shops, rest sites, and mystery encounters.</li><li><strong>Spend your energy.</strong> Inspect a card to read it and play it. Attacks may ask you to choose an enemy. Block absorbs damage.</li><li><strong>Read the enemy intentions.</strong> End your turn when you’re ready for enemies to act. Your energy refills and Block resets on your next turn.</li><li><strong>Build for the boss.</strong> Take one card reward or skip it, upgrade at rest sites, and reach the ninth floor. If your HP reaches zero, the run ends.</li></ol>
            <p>Your run saves in this browser. Ending a run clears that progress.</p>
            <button className="inspection-action" onClick={() => setHelp(false)}>Got it</button>
        </InspectionDialog>}
    </main>;
}

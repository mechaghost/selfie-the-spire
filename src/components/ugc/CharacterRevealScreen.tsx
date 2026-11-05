import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CardItem } from '../ui/CardItem';
import { CardInspector } from '../ui/CardInspector';
import { Card } from '../../core/models';
import './CharacterRevealScreen.css';
export function CharacterRevealScreen() {
    const { generatedCharacter: hero, generatedCards, startGeneratedRun } = useGameStore();
    const [selected, setSelected] = useState<Card | null>(null);
    if (!hero || !generatedCards) return null;
    const cards = generatedCards.map((card, index) => ({ ...card, instanceId: `reveal-${index}` }));
    return <div className="reveal-screen">
        <div className="reveal-header visible"><p className="reveal-archetype">{hero.archetype}</p><h2 className="reveal-name">{hero.name}</h2><p className="reveal-title">{hero.title}</p></div>
        <div className="reveal-portrait visible"><img src={hero.portraitUrl || '/assets/characters/neon.webp'} alt={hero.name} className="reveal-portrait-img" /></div>
        <div className="reveal-traits visible">{hero.traits.map(trait => <span key={trait} className="reveal-trait">{trait}</span>)}</div>
        <button className="reveal-cta visible" onClick={startGeneratedRun}>Begin your journey</button>
        <p className="reveal-hero-label">Your starting deck · inspect any card</p>
        <div className="reveal-cards visible">{cards.map(card => <div className="reveal-card-slot" key={card.instanceId}><CardItem card={card} isDraggable={false} onInspect={() => setSelected(card)} /></div>)}</div>
        <button className="reveal-cta visible" onClick={startGeneratedRun}>Start run with this deck</button>
        {selected && <CardInspector card={selected} onClose={() => setSelected(null)} />}
    </div>;
}

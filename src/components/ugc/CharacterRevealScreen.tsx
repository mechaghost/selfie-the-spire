import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CardItem } from '../ui/CardItem';
import { CardInspector } from '../ui/CardInspector';
import { Card } from '../../core/models';
import './CharacterRevealScreen.css';
import { normalizeAppearance, resolveAppearance } from '../../data/actorVisuals';
export function CharacterRevealScreen() {
    const { generatedCharacter: hero, generatedCards, startGeneratedRun, cancelUgc } = useGameStore();
    const [selected, setSelected] = useState<Card | null>(null);
    if (!hero || !generatedCards) return null;
    const appearance=normalizeAppearance(hero.combatAppearance,hero.archetype);
    const battleActor=resolveAppearance(appearance);
    const cards = generatedCards.map((card, index) => ({ ...card, instanceId: `reveal-${index}` }));
    return <div className="reveal-screen">
        <div className="reveal-header visible"><p className="reveal-archetype">{hero.archetype}</p><h2 className="reveal-name">{hero.name}</h2><p className="reveal-title">{hero.title}</p></div>
        <div className="reveal-appearances">
            <figure><figcaption>Your portrait</figcaption><div className="reveal-portrait visible"><img src={hero.portraitUrl || '/assets/characters/neon.webp'} alt={hero.name} className="reveal-portrait-img" /></div></figure>
            <figure><figcaption>Battle character</figcaption><img className="reveal-battle-actor" src={battleActor.fallbackImageUrl} alt={`${hero.archetype} battle appearance`} /></figure>
        </div>
        <p className="reveal-appearance-note">{appearance.version===2 ? 'Your portrait and battle character are personalized from your photo.' : `Your portrait is personalized. Your battle character uses the shared ${hero.archetype} appearance shown here.`}</p>
        <button className="reveal-back" onClick={cancelUgc}>Back to menu</button>
        <div className="reveal-traits visible">{hero.traits.map(trait => <span key={trait} className="reveal-trait">{trait}</span>)}</div>
        <button className="reveal-cta visible" onClick={startGeneratedRun}>Begin your journey</button>
        <p className="reveal-hero-label">Your starting deck · inspect any card</p>
        <div className="reveal-cards visible">{cards.map(card => <div className="reveal-card-slot" key={card.instanceId}><CardItem card={card} isDraggable={false} onInspect={() => setSelected(card)} /></div>)}</div>
        <button className="reveal-cta visible" onClick={startGeneratedRun}>Start run with this deck</button>
        {selected && <CardInspector card={selected} onClose={() => setSelected(null)} />}
    </div>;
}

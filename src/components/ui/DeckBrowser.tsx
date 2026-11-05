import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { InspectionDialog } from './CardInspector';
export function DeckBrowser() {
    const deck = useGameStore(state => state.masterDeck);
    const [open, setOpen] = useState(false);
    return <><button className="deck-browser-trigger" onClick={() => setOpen(true)} aria-label={`View deck, ${deck.length} cards`}>Deck · {deck.length}</button>
        {open && <InspectionDialog title={`Your deck · ${deck.length}`} onClose={() => setOpen(false)}>
            <p>Your full run deck, including cards currently in your hand, draw pile, discard pile, or exhausted for this battle.</p>
            <div className="deck-browser-list">{deck.map(card => <article key={card.instanceId}><h3>{card.name} · {card.cost} energy</h3><p>{card.description}</p></article>)}</div>
        </InspectionDialog>}
    </>;
}

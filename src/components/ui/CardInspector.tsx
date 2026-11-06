import { ReactNode, useLayoutEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../core/models';
import './CardInspector.css';
import { STATUS_HELP } from '../../core/cardText';
import { STATUS_REGISTRY } from '../../data/statusEffects';
import { StatusIcon } from './StatusIcon';

export function InspectionDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const heading = useId();
    useLayoutEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        const element = dialog.current!;
        element.showModal();
        return () => { element.close(); if (previous?.isConnected) previous.focus(); else document.querySelector<HTMLElement>('.deck-browser-trigger')?.focus(); };
    }, []);
    return createPortal(<dialog ref={dialog} className="inspection-dialog" aria-labelledby={heading}
        onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => event.stopPropagation()}>
        <header><h2 id={heading}>{title}</h2><button autoFocus onClick={onClose} aria-label="Close inspection">Close</button></header>
        {children}
    </dialog>, document.body);
}

export function CardInspector({ card, onClose, children }: { card: Card; onClose: () => void; children?: ReactNode }) {
    const art = card.imageUrl || (card.imageId ? `/assets/cards/${card.imageId}.webp` : undefined);
    return <InspectionDialog title={card.name} onClose={onClose}>
        {art && <img className="inspection-art" src={art} alt="" onError={event => { event.currentTarget.hidden = true; }} />}
        <p className="inspection-meta">{card.type} · {card.cost} energy · {card.target === 'Enemy' ? 'One enemy' : card.target === 'AllEnemies' ? 'All enemies' : card.target === 'Self' ? 'Self' : 'No target selection'}</p>
        <p className="inspection-description">{card.description}</p>
        <details><summary>Rules on this card</summary>
        <p className="inspection-meta">Values shown are before status modifiers.</p>
        {card.effects.some(effect => effect.type === 'Draw') && <p>Your hand holds up to 10 cards. Extra drawn cards go to your discard pile. If your draw pile is empty, your discard pile is shuffled into it.</p>}
        {card.effects.some(effect => effect.type === 'Block') && <p>Block absorbs damage and resets at the start of your next turn.</p>}
        {[...new Set(card.effects.map(effect => effect.statusId).filter((id): id is string => !!id))].map(id => <p className="effect-description" key={id}><StatusIcon id={id}/><span><strong>{STATUS_REGISTRY[id]?.name ?? id}:</strong> {STATUS_HELP[id] ?? 'Special effect.'}</span></p>)}
        {card.isHeroCard && <p>Signature card: created for your hero. Random event removal cannot remove it.</p>}
        {card.type === 'Power' && !card.exhausts && <p>Power: removed from play after use for the rest of this battle. It returns to your deck for the next battle.</p>}
        {card.exhausts && <p>Exhaust: removed from play for the rest of this battle.</p>}
        </details>
        {children}
    </InspectionDialog>;
}

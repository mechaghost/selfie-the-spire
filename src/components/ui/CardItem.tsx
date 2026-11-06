import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../core/models';
import { useGameStore } from '../../store/gameStore';
import './CardItem.css';
import { canDropUntargeted } from '../../core/arenaDrag';
import { targetAtPoint } from '../../core/targeting';

interface CardItemProps {
    card: Card;
    style?: React.CSSProperties;
    canPlay?: boolean;
    isDraggable?: boolean;
    onInspect?: () => void;
}

export function CardItem({ card, style, canPlay = true, isDraggable = true, onInspect }: CardItemProps) {
    const { dragState, setDragState, resetDragState, playCard } = useGameStore(state => ({
        dragState: state.dragState,
        setDragState: state.setDragState,
        resetDragState: state.resetDragState,
        playCard: state.playCard
    }));

    const cardRef = useRef<HTMLDivElement>(null);
    const gesture = useRef<{ id: number; x: number; y: number; moved: boolean; scrolling: boolean; sideHand: boolean; hand: HTMLElement | null; scroll: number } | null>(null);
    const suppressClick = useRef(false);
    const origin = useRef({ width: 190, height: 270, x: 0, y: 0 });
    const isTargetingMode = card.target === 'Enemy';
    const isThisActive = dragState.isActive && dragState.cardId === card.instanceId;

    const canInteract = () => {
        const state = useGameStore.getState();
        return canPlay && isDraggable && state.inCombat && state.isPlayerTurn && !state.isResolving && state.actionQueue.length === 0 && !state.combatResult;
    };
    useEffect(() => () => {
        gesture.current?.hand?.classList.remove('is-hand-scrolling');
        if (useGameStore.getState().dragState.cardId === card.instanceId) resetDragState();
    }, [card.instanceId, resetDragState]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        suppressClick.current = false;
        if (!isDraggable || !event.isPrimary || event.button !== 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const hand = event.currentTarget.closest('.deck-table')?.getBoundingClientRect();
        const arena = document.querySelector('.battle-arena-content')?.getBoundingClientRect();
        const scroller = event.currentTarget.closest<HTMLElement>('.hand-container');
        const sideHand = !!hand && !!arena && hand.left >= arena.right - 1;
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false,
            scrolling: false, sideHand, hand: scroller, scroll: (sideHand ? scroller?.scrollTop : scroller?.scrollLeft) ?? 0 };
        origin.current = { width: rect.width, height: rect.height, x: event.clientX - rect.left, y: event.clientY - rect.top };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const pending = gesture.current;
        if (!pending || pending.id !== event.pointerId) return;
        const dx = event.clientX - pending.x, dy = event.clientY - pending.y;
        const scrollHand = () => {
            if (!pending.hand) return;
            pending.hand.classList.add('is-hand-scrolling');
            if (pending.sideHand) pending.hand.scrollTop = pending.scroll - dy;
            else pending.hand.scrollLeft = pending.scroll - dx;
        };
        if (pending.scrolling) { scrollHand(); return; }
        if (!pending.moved) {
            if (Math.hypot(dx, dy) <= 8) return;
            suppressClick.current = true;
            // The short-screen hand scrolls vertically. Drag left into the arena.
            // A bottom hand scrolls horizontally. Lift a card out of that hand.
            if (event.pointerType === 'touch' && (pending.sideHand ? Math.abs(dy) > Math.abs(dx) : Math.abs(dx) > Math.abs(dy))) {
                pending.scrolling = true;
                scrollHand();
                return;
            }
            if (!canInteract()) return;
            pending.moved = true;
            const state = useGameStore.getState();
            document.querySelectorAll('.actor-target:not(:disabled), .entity-avatar').forEach(element => {
                const id = element.getAttribute('data-entity-id');
                if (id) state.setEntityBounds(id, element.getBoundingClientRect());
            });
            setDragState({ isActive: true, cardId: card.instanceId, targetType: card.target,
                isTouch: event.pointerType === 'touch', startX: pending.x, startY: pending.y,
                currentX: event.clientX, currentY: event.clientY });
        } else if (useGameStore.getState().dragState.cardId === card.instanceId) {
            setDragState({ currentX: event.clientX, currentY: event.clientY });
        }
    };
    const cancelGesture = () => {
        gesture.current?.hand?.classList.remove('is-hand-scrolling');
        gesture.current = null;
        if (useGameStore.getState().dragState.cardId === card.instanceId) resetDragState();
    };
    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const pending = gesture.current;
        pending?.hand?.classList.remove('is-hand-scrolling');
        gesture.current = null;
        if (!pending || pending.id !== event.pointerId || !pending.moved) return;
        const state = useGameStore.getState();
        if (!state.dragState.isActive || state.dragState.cardId !== card.instanceId) return;
        const target = isTargetingMode
            ? targetAtPoint(state.entityBounds, state.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.id), event.clientX, event.clientY)
            : undefined;
        if (canInteract() && (isTargetingMode ? target : canDropUntargeted(event.clientX, event.clientY))) {
            playCard(card.instanceId, target ?? undefined);
        }
        resetDragState();
    };

    const cardClasses = [
        'card', canPlay ? 'playable' : 'unplayable', `type-${card.type.toLowerCase()}`,
        card.isHeroCard ? 'hero-card' : '', isThisActive ? 'is-drag-source' : '',
    ].filter(Boolean).join(' ');
    const contents = <>
        <div className="card-cost">{card.cost}</div>
        <div className="card-name">{card.name}</div>
        {(card.imageUrl || card.imageId) ? <div className="card-artwork-wrap">
            <img src={card.imageUrl || `/assets/cards/${card.imageId}.webp`} className="card-artwork" alt={card.name} draggable={false} />
            <div className="card-type-badge">{card.type}</div>
        </div> : <div className="card-artwork-placeholder" />}
        <div className="card-desc">{card.description}</div>
    </>;

    return <>
        <div ref={cardRef} className={cardClasses} style={style}
            role={onInspect ? 'button' : undefined} tabIndex={onInspect ? 0 : undefined}
            aria-label={onInspect ? `Inspect ${card.name}, ${card.cost} energy` : undefined}
            onClick={event => {
                if (!onInspect) return;
                event.stopPropagation();
                if (!suppressClick.current) { cardRef.current?.focus(); onInspect(); }
                suppressClick.current = false;
            }}
            onKeyDown={event => { if (onInspect && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onInspect(); } }}
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
            onPointerCancel={cancelGesture} onLostPointerCapture={cancelGesture}
            onDragStart={event => event.preventDefault()}>
            {contents}
        </div>
        {isThisActive && createPortal(<div className={`card card-drag-preview type-${card.type.toLowerCase()} ${card.isHeroCard ? 'hero-card' : ''}`}
            aria-hidden="true" style={{ left: dragState.currentX - origin.current.x, top: dragState.currentY - origin.current.y,
                width: origin.current.width, height: origin.current.height }}>{contents}</div>, document.body)}
    </>;
}

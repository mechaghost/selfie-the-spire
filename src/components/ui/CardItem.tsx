import React, { useRef, useCallback } from 'react';
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
    const isMouseDragging = useRef(false);
    const touchGesture = useRef<{id:number; armed:boolean}|null>(null);
    const gesture = useRef({ x: 0, y: 0, moved: false });

    const canInteract = () => {
        const state = useGameStore.getState();
        return state.inCombat && state.isPlayerTurn && !state.isResolving && state.actionQueue.length === 0 && !state.combatResult;
    };
    const isTargetingMode = card.target === 'Enemy';
    const isThisActive = dragState.isActive && dragState.cardId === card.instanceId;
    const isBeingTouched = isThisActive && dragState.isTouch;
    const isAnyMouseDrag = dragState.isActive && !dragState.isTouch;

    // --- Shared: recalculate enemy bounds ---
    const refreshEnemyBounds = useCallback(() => {
        if (card.target === 'Enemy') {
            const state = useGameStore.getState();
            document.querySelectorAll('.actor-target:not(:disabled), .entity-avatar').forEach(el => {
                const id = el.getAttribute('data-entity-id');
                if (id) {
                    state.setEntityBounds(id, el.getBoundingClientRect());
                }
            });
        }
    }, [card.target]);

    // ==========================================
    // MOUSE: Enemy-target → arrow targeting mode
    // MOUSE: Self/AoE → card-drag mode
    // ==========================================

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!canPlay || !isDraggable || !canInteract() || e.button !== 0) return;
        e.preventDefault();

        gesture.current = { x: e.clientX, y: e.clientY, moved: false };
        isMouseDragging.current = true;
        refreshEnemyBounds();

        const rect = cardRef.current!.getBoundingClientRect();

        // Enemy cards: start from card center (arrow origin)
        // Self/AoE cards: start from mouse position (so card follows with zero offset)
        const sx = isTargetingMode ? rect.left + rect.width / 2 : e.clientX;
        const sy = isTargetingMode ? rect.top : e.clientY;

        setDragState({
            isActive: true,
            cardId: card.instanceId,
            targetType: card.target,
            isTouch: false,
            startX: sx,
            startY: sy,
            currentX: e.clientX,
            currentY: e.clientY
        });

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isMouseDragging.current) return;
            if (Math.hypot(ev.clientX - gesture.current.x, ev.clientY - gesture.current.y) > 8) gesture.current.moved = true;
            const state = useGameStore.getState();
            if (state.dragState.isActive) {
                state.setDragState({
                    currentX: ev.clientX,
                    currentY: ev.clientY
                });
            }
        };

        const handleMouseUp = (ev: MouseEvent) => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            isMouseDragging.current = false;

            const state = useGameStore.getState();
            if (!state.dragState.isActive) return;
            if (!gesture.current.moved) { state.resetDragState(); return; }

            if (isTargetingMode) {
                const id = targetAtPoint(state.entityBounds,state.enemies.filter(enemy=>enemy.hp>0).map(enemy=>enemy.id),ev.clientX,ev.clientY);
                if(id) { playCard(card.instanceId,id);return; }
            } else {
                // Self/AllEnemies: release above the hand area to play
                if (canDropUntargeted(ev.clientX,ev.clientY)) {
                    playCard(card.instanceId);
                    return;
                }
            }

            state.resetDragState();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [canPlay, isDraggable, card.instanceId, card.target, isTargetingMode, refreshEnemyBounds, setDragState, playCard, resetDragState]);

    // ==========================================
    // TOUCH: Same split behavior
    // ==========================================

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!canPlay || !isDraggable || !canInteract() || e.touches.length !== 1) return;
        const touch = e.touches[0];
        gesture.current = { x: touch.clientX, y: touch.clientY, moved: false };
        touchGesture.current = {id:touch.identifier,armed:false};
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const pending = touchGesture.current;
        if (!pending) return;
        const touch = Array.from(e.touches).find(touch=>touch.identifier===pending.id);
        if (!touch) return;
        if (!pending.armed) {
            const {x,y}=gesture.current;
            const dx=touch.clientX-x,dy=touch.clientY-y;
            if (Math.hypot(dx,dy)<=8) return;
            gesture.current.moved = true;
            // The hand scrolls sideways; a deliberate lift starts a card drag.
            if (dy>=0 || -dy<=Math.abs(dx)) { touchGesture.current=null; return; }
            if (!canInteract()) { touchGesture.current=null; return; }
            pending.armed = true;
            refreshEnemyBounds();
            const rect=cardRef.current!.getBoundingClientRect();
            setDragState({isActive:true,isTouch:true,cardId:card.instanceId,targetType:card.target,
                startX:isTargetingMode ? rect.left+rect.width/2 : x,
                startY:isTargetingMode ? rect.top : y,currentX:touch.clientX,currentY:touch.clientY});
            return;
        }
        if (isBeingTouched) setDragState({currentX:touch.clientX,currentY:touch.clientY});
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const pending = touchGesture.current;
        if (!pending) return;
        const touch = Array.from(e.changedTouches).find(touch=>touch.identifier===pending.id);
        if (!touch) return;
        touchGesture.current = null;
        const state = useGameStore.getState();
        if (!pending.armed || !state.dragState.isActive || state.dragState.cardId!==card.instanceId) return;
        if (isTargetingMode) {
            const id = targetAtPoint(state.entityBounds,state.enemies.filter(enemy=>enemy.hp>0).map(enemy=>enemy.id),touch.clientX,touch.clientY);
            if(id) { playCard(card.instanceId,id);return; }
        } else if (canDropUntargeted(touch.clientX,touch.clientY)) {
            playCard(card.instanceId);
            return;
        }
        resetDragState();
    };

    // --- Prevent native drag (we use pointer events now) ---
    const handleDragStart = (e: React.DragEvent) => e.preventDefault();

    // --- Compute styles ---
    const combinedStyle: React.CSSProperties = { ...style };

    // Non-targeting drag: card follows cursor/finger (mouse or touch)
    const isDragMoving = gesture.current.moved && isThisActive && !isTargetingMode && (isAnyMouseDrag || isBeingTouched);

    if (isDragMoving) {
        const dx = dragState.currentX - dragState.startX;
        const dy = dragState.currentY - dragState.startY;
        (combinedStyle as any)['--drag-dx'] = `${dx}px`;
        (combinedStyle as any)['--drag-dy'] = `${dy}px`;
        combinedStyle.transition = 'none';
        combinedStyle.zIndex = 9999;
        combinedStyle.pointerEvents = 'none';
    } else if (isAnyMouseDrag && !isThisActive) {
        // Other cards: transparent to pointer events during any drag
        combinedStyle.pointerEvents = 'none';
    }

    const cardClasses = [
        'card',
        canPlay ? 'playable' : 'unplayable',
        `type-${card.type.toLowerCase()}`,
        card.isHeroCard ? 'hero-card' : '',
        isDragMoving ? 'is-drag-moving' : '',
        isThisActive && isTargetingMode ? 'is-targeting' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={cardRef}
            className={cardClasses}
            role={onInspect ? 'button' : undefined}
            tabIndex={onInspect ? 0 : undefined}
            aria-label={onInspect ? `Inspect ${card.name}, ${card.cost} energy` : undefined}
            onClick={event => { if (onInspect) { event.stopPropagation(); if (!gesture.current.moved) { cardRef.current?.focus(); onInspect(); } gesture.current.moved = false; } }}
            onKeyDown={event => { if (onInspect && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onInspect(); } }}
            onTouchCancel={() => { touchGesture.current=null; resetDragState(); }}
            onPointerDown={() => { gesture.current.moved = false; }}
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={combinedStyle}
        >
            <div className="card-cost">{card.cost}</div>
            <div className="card-name">{card.name}</div>
            {(card.imageUrl || card.imageId) ? (
                <div className="card-artwork-wrap">
                    <img src={card.imageUrl || `/assets/cards/${card.imageId}.webp`} className="card-artwork" alt={card.name} />
                    <div className="card-type-badge">{card.type}</div>
                </div>
            ) : (
                <div className="card-artwork-placeholder" />
            )}
            <div className="card-desc">{card.description}</div>
        </div>
    );
}

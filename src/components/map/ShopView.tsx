import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../../core/models';
import { Store, Coins, Flame, LogOut, ShoppingCart } from 'lucide-react';
import { eightiesIcon } from '../ui/EightiesIcons';
import './ShopView.css';
import { CardInspector, InspectionDialog } from '../ui/CardInspector';

interface ConfirmState {
    type: 'buy' | 'remove';
    card: Card;
    price: number;
}

export function ShopView() {
    const {
        player,
        shopCards,
        shopPrices,
        cardRemovalCost,
        masterDeck,
        buyCard,
        removeCard,
        dismissNodeEvent,
    } = useGameStore();

    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [showRemovalPicker, setShowRemovalPicker] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 1800);
    }, []);

    const handleCardClick = (card: Card) => {
        const price = shopPrices[card.instanceId];
        if (price == null) return;
        setConfirmState({ type: 'buy', card, price });
    };

    const handleConfirmBuy = () => {
        if (!confirmState || confirmState.type !== 'buy') return;
        buyCard(confirmState.card.instanceId, confirmState.price);
        setConfirmState(null);
        showToast('Card added to your deck.');
    };

    const handleRemovalClick = () => {
        if (player.gold < cardRemovalCost) return;
        setShowRemovalPicker(true);
    };

    const handleRemoveCard = (card: Card) => {
        setConfirmState({ type: 'remove', card, price: cardRemovalCost });
    };

    const handleConfirmRemove = () => {
        if (!confirmState || confirmState.type !== 'remove') return;
        removeCard(confirmState.card.instanceId);
        setConfirmState(null);
        setShowRemovalPicker(false);
        showToast('Card removed from your deck.');
    };

    const canAffordRemoval = player.gold >= cardRemovalCost;

    return (
        <div className="shop-container">
            <div className="shop-scanlines" />

            {/* --- Header --- */}
            <div className="shop-header">
                <h1 className="shop-neon-sign">
                    <Store size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    The Neon Bazaar
                </h1>
                <p className="shop-tagline">Cash talks. Everything else walks.</p>
                <div className="shop-gold-display">
                    <Coins size={20} className="shop-gold-icon" />
                    <span>{player.gold}g</span>
                </div>
            </div>

            {/* --- Cards for sale --- */}
            <div className="shop-section">
                <h2 className="shop-section-title">
                    <ShoppingCart size={16} />
                    Cards for Sale
                </h2>

                {shopCards.length > 0 ? (
                    <div className="shop-cards-row">
                        {shopCards.map(card => {
                            const price = shopPrices[card.instanceId] ?? 0;
                            const canAfford = player.gold >= price;
                            return (
                                <div
                                    key={card.instanceId}
                                    className={`shop-card-slot ${!canAfford ? 'shop-card-slot--broke' : ''}`}
                                    role="button" tabIndex={0} aria-label={`Inspect ${card.name}, ${price} gold`}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(card); } }}
                                    onClick={() => handleCardClick(card)}
                                >
                                    <div className={`shop-card-preview type-${card.type.toLowerCase()} ${!canAfford ? 'shop-card-preview--broke' : ''}`}>
                                        <div className="shop-card-cost">{card.cost}</div>
                                        <div className="shop-card-name">{card.name}</div>
                                        {(card.imageUrl || card.imageId) ? (
                                            <div className="shop-card-artwork-wrap">
                                                <img
                                                    src={card.imageUrl || `/assets/cards/${card.imageId}.webp`}
                                                    className="shop-card-artwork"
                                                    alt={card.name}
                                                />
                                                <div className="shop-card-type-badge">{card.type}</div>
                                            </div>
                                        ) : (
                                            <div className="shop-card-artwork-wrap" style={{ background: 'rgba(255,255,255,0.03)' }} />
                                        )}
                                        <div className="shop-card-desc">{card.description}</div>
                                    </div>

                                    <div className={`shop-price-tag ${!canAfford ? 'shop-price-tag--broke' : ''}`}>
                                        <Coins size={14} className="shop-price-icon" />
                                        {price}g
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="shop-broke-hint">Sold out. You cleaned me out, champ.</p>
                )}
            </div>

            {/* --- Card removal --- */}
            <div className="shop-removal">
                <h2 className="shop-section-title">
                    <Flame size={16} />
                    Services
                </h2>

                <div
                    className={`shop-removal-offer ${!canAffordRemoval ? 'shop-removal-offer--broke' : ''}`}
                    role="button" tabIndex={0} aria-disabled={!canAffordRemoval}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRemovalClick(); } }}
                    onClick={handleRemovalClick}
                >
                    <div className="shop-removal-info">
                        <div className="shop-removal-title">
                            <Flame size={16} />
                            Torch a Card
                        </div>
                        <div className="shop-removal-desc">
                            {canAffordRemoval
                                ? 'Choose one card to permanently remove.'
                                : "Not enough gold for card removal."}
                        </div>
                    </div>
                    <div className={`shop-price-tag ${!canAffordRemoval ? 'shop-price-tag--broke' : ''}`}>
                        <Coins size={14} className="shop-price-icon" />
                        {cardRemovalCost}g
                    </div>
                </div>
            </div>

            {/* --- Decorative 80s icon --- */}
            <div style={{ textAlign: 'center', padding: '0.5rem', opacity: 0.15 }}>
                <img src={eightiesIcon(1)} alt="" style={{ width: 32, height: 32 }} />
            </div>

            {/* --- Leave button --- */}
            <div className="shop-footer">
                <button className="shop-leave-btn" onClick={dismissNodeEvent}>
                    <LogOut size={18} />
                    Return to map
                </button>
            </div>

            {/* --- Card removal picker overlay --- */}
            {showRemovalPicker && (
                <InspectionDialog title="Pick a Card to Torch" onClose={() => setShowRemovalPicker(false)}>
                    <div className="shop-removal-overlay-header">
                        <p className="shop-removal-overlay-sub">
                            Choose a card to permanently remove from your deck ({cardRemovalCost}g)
                        </p>
                    </div>

                    <div className="shop-removal-grid">
                        {masterDeck.map(card => (
                            <div
                                key={card.instanceId}
                                className="shop-removal-card-slot"
                                role="button" tabIndex={0} aria-label={`Torch ${card.name}`}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRemoveCard(card); } }}
                                onClick={() => handleRemoveCard(card)}
                            >
                                <div className={`shop-card-preview type-${card.type.toLowerCase()} ${card.isHeroCard ? 'hero-card' : ''}`}>
                                    <div className="shop-card-cost">{card.cost}</div>
                                    <div className="shop-card-name">{card.name}</div>
                                    {(card.imageUrl || card.imageId) ? (
                                        <div className="shop-card-artwork-wrap">
                                            <img
                                                src={card.imageUrl || `/assets/cards/${card.imageId}.webp`}
                                                className="shop-card-artwork"
                                                alt={card.name}
                                            />
                                            <div className="shop-card-type-badge">{card.type}</div>
                                        </div>
                                    ) : (
                                        <div className="shop-card-artwork-wrap" style={{ background: 'rgba(255,255,255,0.03)' }} />
                                    )}
                                    <div className="shop-card-desc">{card.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="shop-removal-cancel"
                        onClick={() => setShowRemovalPicker(false)}
                    >
                        Cancel removal
                    </button>
                </InspectionDialog>
            )}

            {/* --- Confirm dialog --- */}
            {confirmState && (
                <CardInspector card={confirmState.card} onClose={() => setConfirmState(null)}>
                    <p>{confirmState.type === 'buy' ? 'Add to your deck' : 'Permanently remove from your deck'} · {confirmState.price} gold</p>
                    <button className="inspection-action" disabled={player.gold < confirmState.price}
                        onClick={confirmState.type === 'buy' ? handleConfirmBuy : handleConfirmRemove}>
                        {player.gold < confirmState.price ? `Need ${confirmState.price - player.gold} more gold` : confirmState.type === 'buy' ? 'Buy card' : 'Torch card'}
                    </button>
                </CardInspector>
            )}

            {/* --- Toast --- */}
            {toast && <div className="shop-toast" role="status">{toast}</div>}
        </div>
    );
}

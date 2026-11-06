import {useGameStore} from '../store/gameStore';
import {createCardInstance} from '../data/cards';
import {createEnemyInstance} from '../data/enemies';

/** Stress layout with ten real deck instances; keep save ownership invariants intact. */
export async function populateFullHandReview() {
    const store=useGameStore;
    const deck=Array.from({length:12},(_,i)=>createCardInstance(i%2?'haymaker':'finesse'));
    store.setState({masterDeck:deck});
    store.getState().startCombat(['alley_rat','vending_golem','fire_escape_spider']
        .map((id,i)=>createEnemyInstance(id,`review-${i}`,store.getState().rng)));
    // Initial draws are queued. Let them finish before assigning the review piles.
    if (store.getState().isResolving || store.getState().actionQueue.length) {
        await new Promise<void>(resolve => {
            const unsubscribe = store.subscribe(state => {
                if (!state.isResolving && !state.actionQueue.length) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }
    // Another review screen may have replaced this encounter while it initialized.
    if (store.getState().masterDeck !== deck || !store.getState().inCombat) return;
    store.setState({hand:deck.slice(0,10),drawPile:deck.slice(10),discardPile:[],exhaustPile:[]});
}

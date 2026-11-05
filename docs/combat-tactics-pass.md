# Victory spacing and tactical combat

Implemented locally, November 5, 2026. Not deployed in this pass.

## Changes

- Reward screen: compact result header, larger cards, two columns with centered third card on phones, a separated action row, safe vertical scrolling on short screens. Desktop retains three columns.
- New starter decks replace one Jab with Cheap Shot and one Dodge with Torch It. The 12-card deck introduces Weak and Burn alongside Vulnerable, area attacks and draw. Existing saved decks remain intact.
- Enemy Block expires at the start of the enemy turn, rather than immediately after it is gained. Blocking enemies now demand a real choice between breaking defense, using Burn, and attacking another enemy.
- Enemies avoid repeating the same effect sequence when their current phase has alternatives. Openers and low-health phase priority are preserved. Seeded selection remains deterministic; old replays may diverge after the update.
- Voltage's two-hit attack now resolves both hits. Enemy attack-and-defense badges show Block; attack-and-debuff badges show the debuff cue. Enemy inspection also supports keyboard activation.

## Verification

TypeScript and production Vite build passed. Existing action guard, copy contract and save/generation tests passed. New combat-tactics regression tests cover every enemy's hit count, repeat avoidance, determinism, opener/phase priority, Block expiration, and actual attack absorption.

Browser checks: 390×844 rewards fit onscreen; 320×568 rewards scroll with no horizontal clipping and card inspection works; 844×390 controls remain reachable and skipping awards gold and returns to the map. No browser errors observed. Physical touch devices and full-run balance have not been verified.

## Next gameplay iteration

1. Play complete runs and measure damage taken, card picks and fight length before tuning numbers. Working enemy defense increases difficulty.
2. Add distinct enemy move names and short tactical descriptions, then a few authored setup/payoff sequences with clearly telegraphed big attacks.
3. Offer coherent reward choices for multi-hit/Strength, Burn/defense and Weak/draw builds. Keep a useful skip option rather than making every card an automatic pick.
4. Introduce a small relic system only with explicit action-queue hooks, persistence tests and readable triggers. Preserve the generic effect pipeline for generated cards.

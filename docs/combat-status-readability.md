# Combat status readability

Actual BattleArena enemy Block/effect counters used 11px text. They now use 14px with compact `◆5 ✦4` notation, preserving the four-line intent panel. Player HUD now exposes active-effect count as a fourth line, with explicit 18px line height and no border inflation beyond its 72px layout allocation. Hero inspection receives the same visible focus outline as enemy controls.

Actor accessible labels include each effect's name and amount, while the inspection dialog retains full effect descriptions. This avoids repeating long rules paragraphs on each target's accessible name. Dead enemies retain their concise defeated label.

Added a development-only Status HUD fixture with ten cards, three enemies, player Block 8, enemy Block 5, and Weak 2 / Burn 3 / Strength 1 / Vulnerable 2 on all actors. It waits for initial draws and rejects stale fixture completion after the deck changes.

Verified in actual CombatView at 320×568: Block/effect text computes to 14px, enemy counters fit without wrapping, player and enemy HUDs remain visible above the hand, player inspection exposes all four full descriptions, and closing restores focus to the player HUD. No browser warnings/errors captured. Evidence: `tests/.e2e-out/status-hud-320.png`. TypeScript passes.

This is browser verification, not screen-reader/device certification. The current compact counter is not the specification's eventual three distinct status icons plus overflow presentation; that work remains open. No art approval or release gate is granted here. Local only.

## Recognizable status summaries

The arena now uses the same status symbols as the existing effect registry instead of only showing an aggregate sparkle count. It shows at most three icons, with a readable `+N` for remaining effects. Narrow HUDs reduce the visible icon count to preserve Block and the existing 72px HUD envelope. The hero uses its existing fourth line; enemies share their existing Block line. No additional target or nested button is introduced: the containing character's inspection control exposes all names, stack counts and descriptions, and its accessible name includes every status. During card targeting the existing target action remains authoritative; cancel targeting to inspect.

Browser verification on the actual Status HUD fixture (three enemies, ten cards, four effects each): 320×568 shows one enemy icon plus `+3`; 390×844 and 844×390 show three plus `+1`. The narrower hero at 390px shows two plus `+2`. Rows remain 18px high and within HUD bounds. Rat inspection includes all four rules and stack counts; Escape returns focus to Rat. Landscape document width equals viewport width (844px), and no console warnings/errors were observed. TypeScript passes. Captures: `tests/.e2e-out/status-icons-320.png`, `status-icons-390.png`, `status-icons-landscape.png`.

This is local browser evidence, not physical touch or screen-reader certification. Registry symbols still use platform emoji; a consistent custom icon art pass remains desirable before final visual approval. This change does not claim completion of the full layout/art/device release matrix.

# Combat status readability

Actual BattleArena enemy Block/effect counters used 11px text. They now use 14px with compact `◆5 ✦4` notation, preserving the four-line intent panel. Player HUD now exposes active-effect count as a fourth line, with explicit 18px line height and no border inflation beyond its 72px layout allocation. Hero inspection receives the same visible focus outline as enemy controls.

Actor accessible labels include each effect's name and amount, while the inspection dialog retains full effect descriptions. This avoids repeating long rules paragraphs on each target's accessible name. Dead enemies retain their concise defeated label.

Added a development-only Status HUD fixture with ten cards, three enemies, player Block 8, enemy Block 5, and Weak 2 / Burn 3 / Strength 1 / Vulnerable 2 on all actors. It waits for initial draws and rejects stale fixture completion after the deck changes.

Verified in actual CombatView at 320×568: Block/effect text computes to 14px, enemy counters fit without wrapping, player and enemy HUDs remain visible above the hand, player inspection exposes all four full descriptions, and closing restores focus to the player HUD. No browser warnings/errors captured. Evidence: `tests/.e2e-out/status-hud-320.png`. TypeScript passes.

This is browser verification, not screen-reader/device certification. The current compact counter is not the specification's eventual three distinct status icons plus overflow presentation; that work remains open. No art approval or release gate is granted here. Local only.

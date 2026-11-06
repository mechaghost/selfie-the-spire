# Shared HUD for the game and layout study

The five-district capture review found that the development study used simplified status text, lacked the hero's backing surface and omitted the current-preview marker. It could establish composition but not faithfully exercise production HUD content.

`src/components/combat/ActorHUD.tsx` now provides HeroHUDContents and EnemyHUDContents to both BattleArena and ArenaLayoutStudy. This extracts the existing live markup without changing interaction ownership, gameplay state, layout bounds or intent calculation. The study imports production HUD styling and removes its conflicting typography rules. Its four sample statuses now exercise the same icons and overflow counter, and its two-hit attack preview uses the actual intent calculation with source/target statuses (7 × 2 rather than the unmodified 6 × 2).

Browser checks at 320×568 and 390×844 show all four rows fitting the reserved 72px height. At 320px, measured hero width is 70.39px and enemy HUD width 68.13px; HP, intent, Block and overflow are 14px. Names retain the existing 12px style. Backings match production: hero #091525dd, enemies #091525ed. No browser warnings/errors. Evidence: `tests/.e2e-out/shared-hud-320.jpg`, `shared-hud-390.jpg`.

TypeScript, intent/Block parity and copy contracts were checked, and the arena-enabled production bundle builds. The change remains local. The historical 120-capture matrix remains tied to its recorded revision; it has not been relabeled as a new capture set. Fixture chrome, interaction behavior and short-landscape hand placement still differ from the real combat screen, so the study is not a substitute for production UI/device verification.

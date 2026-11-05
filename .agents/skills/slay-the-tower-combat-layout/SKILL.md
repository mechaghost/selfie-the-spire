---
description: Layout and interaction constraints for the Neo Miami 2D combat arena.
---

# Combat layout

The approved `docs/2d-combat-implementation.md` supersedes the former portrait-card entity layout. Characters and monsters stand on shared ground; only playable actions are cards. React owns readable HUD and target buttons; the scene owns decorative art and motion. Neither renderer callbacks nor visual card cleanup can change game state.

Reserve header, controls, safe areas and a bounded horizontal hand before computing the arena. Preserve the larger action cards. Never scale an entire desktop screen down to portrait. Prove 320×568 and 844×390 with three enemies, a boss variant, long names, status overflow and ten cards before art scale lock.

Use one pure layout and projection for sprites, DOM targets, drag and the targeting arrow. Keep enemy slots stable after deaths. Targets must be nonoverlapping and at least 44×44 CSS pixels. Critical HP, intent and controls remain at least 14px. Compact screens may use an ordered intent/target strip paired with visible actors on shared ground. Limit status icons to three plus an inspectable overflow control.

Tap/keyboard inspection and explicit selection are required; drag is optional. Motion must honor reduced-motion preferences. The renderer must have a usable DOM fallback and may not block authoritative combat. Follow the implementation specification's timing, lifecycle and release gates. Prototype silhouettes do not constitute final character art or a portfolio release.

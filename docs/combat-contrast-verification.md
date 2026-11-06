# Combat HUD contrast and target edges

`node scripts/audit_combat_contrast.mjs` reads the production CSS and status-icon colors and writes `docs/combat-contrast-audit.json`. All 22 checks pass; the lowest audited ratio is 6.36:1. Text must meet 4.5:1 and essential graphical indicators 3:1.

The audit composites each translucent HUD surface over white, the brightest possible SDR scene pixel. Every audited opaque foreground channel is brighter than that maximum backing, so this is a conservative bound for all five district palettes and all their background motion frames. It does not rely on sampling just a dark screenshot. This covers the specified HUD colors, not every screen, antialiased edge pixel, disabled/dead actor opacity, display condition or parent filter.

Target borders previously used translucent gold directly over scenery and could not have a useful scene-independent contrast guarantee. Selectable targets now use opaque gold with a 2px dark inset edge. Keyboard focus/hover uses a 2px gold outline and 4px dark inset edge, leaving an adjacent dark stroke behind the gold. Bounds, targeting logic and sprite artwork are unchanged. Target-edge contrast is measured against that adjacent dark stroke, not an assumed dark district background.

In the actual combat screen's local Status HUD fixture at 320×568, inspected Haymaker, chose Play, and tabbed from Rat to Golem. Computed styles confirmed solid gold borders, 2px inset edges on selectable targets and a 4px inset edge plus gold outline on the focused Golem, all at opacity 1. Screenshot: `tests/.e2e-out/combat-contrast-target-320.jpg`. Escape returned to inspection with Play focused; closing inspection showed unchanged 3/3 energy, 72/80 HP and the same ten cards. No browser warnings/errors.

This is local source-color and browser evidence, not complete accessibility certification. Physical devices, actual screen-reader verification and player comprehension remain open release gates.

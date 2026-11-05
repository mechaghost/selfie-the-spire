# Mobile view audit — November 5, 2026

## Coverage

Local browser viewport review, using isolated development fixtures and the current UI. No production deployment or real-device certification.

- **390×844:** visually inspected capture, waiting, error, reveal, map, combat, full hand, rewards, shop, rest, mystery, victory and defeat. Main menu was also checked in the immediately preceding menu review.
- **320×568:** opened all 14 fixtures (the 13 screens plus a ten-card hand). DOM checks found no page-level horizontal overflow or broken loaded images. Visual checks focused on combat, rewards, capture, reveal and dialogs; DOM width checks alone do not prove no clipped internal content.
- **844×390:** visually inspected combat, rewards, waiting, rest, map, reveal, mystery, victory and defeat. Rechecked combat, waiting and map after corrections.
- **Long content:** scrolled the ten-card hand to its final row and a thirteen-card reveal to its final card. A start action is now available below the revealed deck.

## Fixed findings

| Finding | Correction | Evidence |
| --- | --- | --- |
| Third enemy wrapped behind controls at 320px | Narrow enemy row and compact player portrait; reserve space above controls | Three enemies and all health bars visible above controls in final 320px screenshot |
| Landscape inherited desktop cards, hiding the battle | Dedicated short-landscape stage, compact entities and scrollable hand | Final 844×390 screenshot shows separate battlefield, controls and cards |
| Rewards extended outside narrow viewport; top clipped in landscape | Border-box panel, wrapping rewards and safe vertical alignment | At 320px, scrolled to third reward and selected it successfully |
| Nine-floor map collapsed in landscape | Route has a minimum height and its own scrolling; automatically reveals available choices | Landscape first-floor nodes visible and clickable; entered a battle through one |
| Reveal cards were cramped | Larger card dimensions; two columns on narrow phones, three on regular phones | Thirteen-card reveal scrolled through to final card |
| Start action required scrolling back through revealed deck | Added Start run with this deck below the cards | Clicked successfully after reviewing the deck |
| Small action targets | At least 44px height for key photo, result, dialog and navigation buttons | Browser layout inspection; not a complete all-target accessibility certification |
| Inline End run confirmation crowded phone topbar | Native confirmation dialog with explicit loss explanation | 320px dialog fits; Keep playing returns to combat |
| Waiting artwork overlapped landscape text | Compact artwork and horizontal waiting layout | Landscape screenshot verified |
| Removal picker duplicated its heading and floating Cancel covered cards | Single heading; Cancel follows the grid inside dialog | Removal confirmed at 320px before minor heading/Cancel cleanup; cleanup type-checked |
| Landscape touch handler conflicted with scrolling layout | Skip drag initialization in compact landscape; keep tap-to-inspect | Code reviewed; physical touch gesture verification pending |
| Hover lift clipped cards in scrolling hands | Disable lift in short-screen scroll layouts | Final portrait and landscape captures |

## Interaction checks

- Haymaker inspection → Play card → Rat: HP changed 13→5 and energy 3→1.
- End-run confirmation → Keep playing returned to combat.
- Reward inspection → Add to deck returned to map.
- Shop removal picker → Jab inspection → Torch card: success message and gold 99→24.
- Landscape route selection opened floor-one combat.
- Ten-card hand scrolled 289px to its end (598px content in a 309px pane).
- Thirteen-card reveal scrolled to its end; bottom start button entered the run.

## Automated checks

Passed TypeScript, production Vite build, `git diff --check`, and all three regression scripts:

```sh
node tests/action-guards.mjs
node tests/copy-contracts.mjs
node tests/save-and-generation.mjs
```

## Evidence

- `tests/.e2e-out/mobile-audit-combat-320.png`
- `tests/.e2e-out/mobile-audit-combat-landscape.png`

The small “Review screens” control in screenshots is development-only. These artifacts are gitignored.

## Remaining validation

Test on physical iOS Safari and Android Chrome: touch drag/drop and scroll arbitration, camera permission/denial, real photo decoding, browser toolbar resizing, notch/home-indicator behavior, background/return, rotation during an active card gesture, reduced-motion preference and frame pacing. This pass did not run a real AI generation or complete a full run on a physical phone. It also did not perform a complete screen-reader or 200% text-zoom audit.

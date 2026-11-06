---
name: slay-the-tower-combat-layout
description: Layout and interaction constraints for the Neo Miami 2D combat arena.
---

# Combat layout

Do not use GitHub Actions for this project: do not create, enable, dispatch, or wait for Actions workflows, and do not make them a release gate. Run builds and regression tests locally, deploy through Railway, and verify the live domain. This is an explicit user requirement; only a later explicit user instruction can change it.

The approved `docs/2d-combat-implementation.md` supersedes the former portrait-card entity layout. Characters and monsters stand on shared ground; only playable actions are cards. React owns readable HUD and target buttons; the scene owns decorative art and motion. Neither renderer callbacks nor visual card cleanup can change game state.

Reserve header, controls, safe areas and a bounded horizontal hand before computing the arena. Preserve the larger action cards. Never scale an entire desktop screen down to portrait. Prove 320×568 and 844×390 with three enemies, a boss variant, long names, status overflow and ten cards before art scale lock.

Use one pure layout and projection for sprites, DOM targets, drag and the targeting arrow. Keep enemy slots stable after deaths. Targets must be nonoverlapping and at least 44×44 CSS pixels. Critical HP, intent and controls remain at least 14px. Compact screens may use an ordered intent/target strip paired with visible actors on shared ground. Limit status icons to three plus an inspectable overflow control.

Dragging cards into the arena is core gameplay and must work with mouse and touch. Preserve the visible dragged card, targeting arrow, valid-target feedback, and canceled/invalid-drop behavior. Tap/keyboard inspection and explicit selection remain accessible alternatives; passing tap-only tests does not verify dragging. Motion must honor reduced-motion preferences. The renderer must have a usable DOM fallback and may not block authoritative combat. Follow the implementation specification's timing, lifecycle and release gates. Prototype silhouettes do not constitute final character art or a portfolio release.

After changes to card inspection or targeting, verify that Play card is fully visible when the dialog opens on short landscape screens. Test with a direct tap so auto-scroll cannot mask a clipped control. When a keyboard player chooses Play card, focus the first available target before paint. Inspect status text against actual turn order when expiry can change an enemy's damage preview.

Use the [first-turn playtest protocol](../../../docs/first-turn-playtest.md) for comprehension reviews. Synthetic sessions use fresh browser contexts and receive prompts without the answers. Record first actions and errors separately from scripted checks. Keep simulated input, physical-device performance, and spoken screen-reader evidence distinct. Use the [release runbook](../../../docs/arena-release-runbook.md) for production verification.

Before a layout release, run `node tests/drag-live.cjs` locally and against the live domain using `E2E_BASE`. Verify hand scrolling separately from card dragging, including after phone rotation, and verify the portrait landscape prompt.

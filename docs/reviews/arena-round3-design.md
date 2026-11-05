# Arena review — round 3: final game-design and deckbuilder verdict

Reviewed draft 3 of `docs/2d-combat-implementation.md` on November 5, 2026. This is an AI role-based planning review. No renderer implementation, playtest or production validation is implied.

## Game designer verdict

**Plan-ready for staged implementation, beginning with W0a/W0b and the W1 stress composition.**

- **D1 closed in plan:** Three-monster/boss stress cases, maximum envelopes, real HUD and ten-card hand precede renderer/art lock; compact layout is specified and must be proven on a touch device.
- **D2 closed in plan:** Reachable roster inventory and explicit controlled-preview, full-run-beta and portfolio-release tiers prevent showcase quality from being mistaken for complete-game coverage.
- **D3 closed in plan:** First-time-player comprehension tasks, repeated-error revision and limits of the small study are explicit.
- **D7 closed in plan:** The contradictory W7 paragraph has been replaced. Mandatory animation baseline and exception review are named, and static fallback is clearly error recovery rather than completion evidence.

No material new design blocker found. Location variety, full-body staging and art consistency remain acceptance goals rather than demonstrated outcomes. The W1 layout and W4 finished-encounter gates must remain real stop/go decisions; a code-complete renderer cannot waive them.

## Slay the Spire-style deckbuilder specialist verdict

**Plan-ready as a presentation migration with preserved tactical clarity, contingent on the corrected baseline.**

- **D4 closed in plan:** Effect-derived intent components, executing-versus-next-intent boundaries and current-preview semantics are explicit.
- **D5 closed in plan:** One coordinator owns impact timing; old waits are replaced, not stacked. Pacing targets include enemy turns and multi-hit/retaliation fixtures, with exact rules parity across playback modes.
- **D6 closed in plan:** The composite showcase is developer-only. A legal unchanged production encounter and unchanged mechanical meaning of screen position are separate requirements.
- **D8 closed in plan:** `previewKind`, persistent non-color qualification, accessible labels and a Weak-expiry decision task address false forecast precision without adding a prediction engine.

W0a now explicitly fixes card finalization/ownership and checkpoint/RNG correctness before W0b freezes the parity baseline. This avoids preserving animation-dependent pile behavior as a supposed rule. Those prerequisite fixes need their own characterization and tests; this review does not assert that they already work.

## Final status

All eight design/deckbuilder findings from rounds 1–2 are addressed in the final specification. **No remaining material planning blocker was identified from these two perspectives.** Approval is limited to starting the specified implementation stages. Runtime readiness, complete-run balance, real-device interaction, authored animation quality and novice comprehension remain unverified and must satisfy the recorded acceptance gates before portfolio release.

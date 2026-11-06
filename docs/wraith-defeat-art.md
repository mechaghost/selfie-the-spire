# Neon Wraith defeat pose

Added the original generated `art-source/battle/actors/neon-wraith-defeat-v1.png` and lossless runtime WebP. Reference: existing Wraith idle artwork. Source1199×1312RGBA, alpha0–255, alpha≥128 bounds(193,439)–(939,1311). The bowed mask, dim tubes and coiled cloth communicate loss of power. Foot anchor[.5,.99], no scale adjustment. The 280ms single-frame clip holds its final pose; the existing scene fade and command timing remain unchanged.

Browser review:390×844 and320×568, three enemies and ten cards, defeat sampled40ms into its fade. The disabled target reads “Wraith, defeated,” its HUD shows0/40 and Defeated, and the other slots remain fixed. No warnings/errors. Screenshots in `tests/.e2e-out/wraith-defeat-390.jpg` and `wraith-defeat-320.jpg`. This is a frozen pose review, not full-speed battle comprehension or real-device certification.

Checks:758,268 transformed-alpha samples with zero confirmed clipping/HUD conflicts;550 inventory combinations remain below5MB transfer and64MiB estimated decoded RGBA.92 packaged assets157,067,834→24,820,176bytes. Clip tests verify Wraith hit recovery and held defeat at0,140,279,280 and10000ms, including reduced motion. Texture checks and TypeScript pass.

Still a prototype pending motion/art approval. Wraith now has attack, hit and defeat poses; cast and an authored idle loop remain outstanding. No live rollout in this commit.

## Prompt

Edit target: exact Neon Wraith sprite reference. Produce its final DEFEAT frame for an original Neo Miami 2D combat game. Same portrait canvas dimensions and character scale; preserve turquoise angular neon mask, bracketed tubes, two purple skeletal arms, striped purple cloth, no legs. Monster's power has gone out: coral eyes dark, neon tubes dim but visibly teal glass. Mask bowed down screen-left, shoulders slumped, both claws hanging limply inward. Upper body sinks and folds into its coiled ribbon-tail at lower center, a compact crumpled defeated shape. Lowest cloth tips at same bottom baseline as reference. Keep head/mask same physical size as idle; pose should occupy bottom two thirds of canvas, with transparent negative space above. All artwork stays inside canvas, no wide trailing ribbons. Preserve hand-painted inked style and original costume details. Transparent background, no floor or shadow, no text, particles, fog, detached debris or new objects. Not a corpse with human legs, no blood or gore. Exactly one collapsed spectral monster.

## Scene event integration

`tests/renderer-streaming.mjs` now exercises the actual Wraith manifest through the production BattleScene impact subscription and frame-selection code with a controlled clock and GPU doubles. Damage selects hit;139ms retains hit;140ms begins authored idle recovery;220ms clears reaction state. A later Burn hit restarts it. Defeat interrupts immediately and remains the chosen texture after its duration, including reduced motion. A living reduced-motion actor skips reaction art. Disposal unsubscribes and releases all texture leases; a subsequent impact does not repopulate reactions. The complete streaming suite passes. This establishes event/frame arbitration, not real GPU frame rate or human comprehension of full-speed combat.

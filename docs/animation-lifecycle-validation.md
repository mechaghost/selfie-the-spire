# Authored animation lifecycle validation

The existing clip sampler supports looping idle frames, but the manifest validator previously accepted looping attacks/reactions/defeats and permanently held action poses. Those configurations violate the implementation plan's finite-action and terminal-defeat rules.

`validateActorVisual` now requires idle clips to loop with static-idle fallback; attacks, casts, hits, guards and celebrations to be finite and return to idle; and defeat to be finite with its last frame held. Unknown clip names are rejected. Existing registered manifests pass. No gameplay queue timing or shipped pose sequence changes.

`tests/clip-playback.mjs` exercises idle frame boundaries/wraparound, finite completion for each action/reaction category, long-after-completion defeat holding, reduced-motion static idle and immediate final defeat, and invalid manifest rejection. `tests/renderer-streaming.mjs` uses the real BattleScene with controlled Pixi dependencies to verify that an idle loop selects an alternate texture, returns to base at the cycle boundary and suppresses cycling in reduced motion. Actor-motion tests and TypeScript also pass.

These checks establish safe support for upcoming authored idle sequences. They do not create that artwork or approve animation smoothness. Existing cutouts and procedural idle movement remain pending the authored-idle art gate; no asset approval status changed. Local only.

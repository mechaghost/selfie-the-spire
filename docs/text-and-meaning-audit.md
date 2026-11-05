# Text and meaning audit

Reviewed November 5, 2026. Local implementation, not deployed.

## Editorial direction

Keep Neo Miami personality in names, scene setting, and short flavor lines. Put literal meaning in controls, costs, instructions, and consequences. A player should not have to interpret slang to decide whether an action spends gold, replaces a card, ends a run, or sends a photo.

Use these terms consistently: **hero** for the character; **signature card** for the generated hero-specific card; **archetype deck** for the fixed themed cards; **run** for the whole climb; **battle** for one combat; **Block**, **HP**, **energy**, and **gold** for mechanics. “Exhaust” lasts one battle; “remove from your deck” lasts the run. “Upgrade” must show the actual changed effect or energy cost.

## Coverage

Read the landing page and social metadata; capture, generation, error and reveal screens; route labels; combat instructions and intents; card inspection and full-deck views; reward, shop, rest and mystery screens; both defeat presentations and victory. Compared all 27 local card definitions, all 50 server archetype cards, five mystery events and their choices, seven statuses, enemy intent definitions, generation assembly/fallbacks, and store effect resolution. Dynamic AI prose cannot be exhaustively enumerated; new returned card descriptions are now built from their actual effect payload.

This is a source/meaning audit with automated checks, not a new visual-layout or live-provider test. Earlier screen verification is in `portfolio-ux-checks.md`.

## Findings and changes

| Context | Problem | Resolution |
| --- | --- | --- |
| Landing | “80’s Magic” hid the generation mechanism; “custom card deck” implied every card was newly generated. | Explicit AI-generated hero and signature card, alongside an archetype deck. |
| Marketing | “Fifty powers” could mean 50 Power-type cards. “Infinite possibilities” is unverifiable. | “Fifty archetype cards” (count checked); replaced infinity claim. |
| Social preview | Still promised hand-painted cards after the page copy changed. | “Illustrated card deck.” |
| Capture | “Reads your soul” obscured what to do; “Upload” described a transmission that had not happened yet. | Face-centering/crop guidance and “Choose photo”; transmission disclosure still tied to Use this photo. |
| Waiting | Vague waiting instruction and ambiguous Cancel destination. | Names portrait/signature-card work, states client’s two-minute wait limit, labels home destination. Cancellation does not promise server-side deletion. |
| Camera | Permission was presented as the only reason for waiting/failure. | “Starting camera… Allow access if prompted”; retry/photo alternative on failure. |
| Network error | Browser’s technical fetch error could reach the player. | Actionable connection/retry wording. Existing server rejection and quota explanations retained. |
| Map | Internal `Unknown` type conflicted with Mystery legend; Floor 0 sounded like a gameplay floor. | Accessible Mystery/Fight names; Street level at the start. |
| Quit | Yes/No did not name either outcome. | End run / Keep playing; exit control names lost progress. |
| Card target | `None` was displayed as Self, including random enemy attacks. | “No target selection.” Individual effect text describes recipients. |
| Upgrades | First-number replacement changed healing/status text when Block was upgraded; Ricochet implied all hits increased. | Effect-derived descriptions preserve effect order and actual amounts. Tests cover Rally, Regen, Entangle and Ricochet. |
| Cost upgrades | Preview showed only unchanged effect text. | After-upgrade energy cost is explicit. |
| Discard | Surf implied player-selected discard. | Explicit random card from hand. |
| Exhaust | Mending and Overload omitted Exhaust in their card text. | Both fixed; all authored exhaust cards checked. |
| Generated cards | Model description could disagree with validated mechanics or omit exhaust. | Build newly received descriptions from effects and exhaust flag. Existing persisted cards are not migrated. |
| Statuses | Burn/Regen lacked exact timing and stack meaning; internal `thorns` leaked into intents. | Contextual rules disclosure, display names, per-stack behavior and start-of-turn timing. |
| Power | Familiar genre convention suggests one-time play, but engine recycles non-exhaust Powers. | Inspector explicitly says these can be drawn again; balance semantics unchanged. |
| Enemy intent | Multi-hit attacks were described as one hit; attack/debuff descriptions omitted the debuff. | Describe every queued effect with display names; identify base values and modifier caveat. |
| Draw | “Draw 3” did not explain a full hand or empty draw pile. | Contextual 10-card cap/discard/reshuffle explanation. |
| Deck | Could be mistaken for remaining draw pile. | Explicitly describes full run deck and battle piles. |
| Rewards | “Prime loot” and “Pre-sharpened” obscured upgraded status; Skip could imply losing gold. | Upgraded rewards, choose one, and explicit gold retained on skip. |
| Shop | “I’m Out,” “scratch,” and generic success quips obscured navigation/transaction results. | Return to map, explicit affordability and added/removed-card messages. Flavor remains in shop name/tagline. |
| Rest | Heal 0 HP looked broken; mutual exclusivity unclear. | Full-health explanation and choose healing OR upgrade. |
| Mystery trade | Promised a different card; removal is random and replacement can match. | Both random operations and possible same card type stated. |
| Mystery removal | Did not disclose signature-card protection. | “Non-signature card” in choice description and inspector explanation. |
| Mystery damage | Promised fixed HP loss despite 1-HP floor. Outcome also overstated actual loss. | Nonlethal limit in choice; actual loss in result. |
| Max HP | Outcome could overstate loss near minimum and leave final health unclear. | Minimum stated and actual final HP displayed. |
| Replay/end states | Earlier pass clarified starter hero vs custom hero; combat defeat still said New Run. | Combat defeat now also says New starter run. |

## Follow-up resolution

The follow-up implements these decisions:

- **Upgrade eligibility:** `canUpgradeCard` is shared by the rest picker, store commitment guard and upgrade function. Zero-cost cards without Damage or Block effects cannot consume an upgrade. Already upgraded cards remain ineligible.
- **Power convention:** Powers now exhaust after play even when an older card lacks an exhaust flag. They cannot be drawn again during that battle; the master deck is unchanged for future battles. This deliberately reduces repeatable stat stacking and warrants balance playtesting.
- **Generation fallback:** the public generation route returns 503 when Gemini is not configured. It no longer returns an unmarked preset. The error screen provides a starter-hero action. No image is sent to a provider in this failure path.
- **Photo explanation:** an expandable disclosure names Google Gemini, distinguishes original photos from browser-saved generated artwork, and explains cancellation. Server generation errors/retry logs no longer print provider error contents. No provider retention or deletion guarantee is claimed.
- **Fictional traits:** the analysis prompt now explicitly requests fictional character traits inspired by styling/pose. It no longer requests real-person identification or personality inference.
- **Saved-card text:** all eight persisted card lists are refreshed from effects on load, preserving IDs and effect values. Historical plays are not retroactively changed; Power exhaustion applies to future plays.
- **Intent previews:** attack numbers and combat resolution share modifier order and rounding. Multi-hit attacks show each hit (for example `3 × 2`), and the duplicate AttackDebuff badge is removed. Inspection describes current damage before Block. This is a current-state preview, not a prediction of the entire enemy phase: status decay, earlier enemies and queued effects may still change the eventual hit.

## Remaining external validation

- Complete a live generation with an explicitly chosen test photo. Local tests do not establish model latency, output quality, or provider availability.
- Verify the deployed account’s provider retention/data-use settings before publishing any retention guarantee. Source code cannot establish those account-specific facts.
- Playtest a full run after the one-use Power change and visually check longer migrated descriptions on real devices.
- Deploy and smoke-test the production domain; these changes remain local.

## Verification

- `node tests/copy-contracts.mjs`: 27 base + 50 archetype definitions, upgrade edge cases, random discard, exhaust flags, and the marketing card count.
- `node tests/action-guards.mjs`: combat/reward/rest/event regression coverage, no-op upgrades and Power exhaustion.
- `node tests/save-and-generation.mjs`: migration of all eight saved card lists; missing-provider HTTP 503 with no mock hero or provider request.
- `npx tsc --noEmit -p server/tsconfig.json`: server type check.
- `npx tsc --noEmit`, `npx vite build`, `git diff --check`.

The copy contract checks prevent specific semantic regressions; they do not certify arbitrary model outputs, every screen width, or every live combat modifier combination.

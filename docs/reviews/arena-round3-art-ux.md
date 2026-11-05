# Arena review — round 3: final art and UX/UI specification review

Reviewed draft 3, including the revised release tiers, clip contract, binding Round 1 decisions and Round 2 refinements. AI role-based review; no renderer, final artwork or physical-device experience was tested.

**Verdict: plan-ready for W0 and the W1 composition spike. No remaining material specification blocker from these two review lenses. Not approved for production art lock or release until the stated empirical gates pass.**

## Art director / 2D artist lens

| ID | Final disposition |
|---|---|
| A1 | Resolved in specification. Initial inventory exists; W0b must complete reachability, owner, provenance, fallback and tier coverage before scale-up. |
| A2 | Resolved in specification. Style sheet and export/anchor/mirroring rules have an explicit spike-driven lock point. |
| A3 | Resolved in specification. Authored archetype appearance is the guaranteed first-release behavior; the exact preview and honest personalization copy prevent silent substitution. |
| A4 | Resolved. The earlier ambiguous W7 paragraph is replaced by controlled-preview, full-run-beta and portfolio tiers. Static-only display is explicitly degraded recovery. |
| A5 | Resolved. Loop/completion fields and binding playback defaults define finite clips, defeat interruption, optional fallback and mandatory-clip rejection. |

Material evidence still required: a scale lineup and authored animation sample, all-five-location lighting checks, alpha/atlas-edge inspection, and the finished-encounter motion gate. The document specifies these correctly; it cannot establish that the assets look professional before they exist.

## UX/UI lens

| ID | Final disposition |
|---|---|
| U1 | Resolved in specification. Native modal closes before arena targeting; focus, cancellation, event suppression and immediate target commit are defined. |
| U2 | Resolved in specification. W1 stress cases cover three monsters, boss, long labels, status overflow, 10 cards and the smallest portrait/landscape sizes before art scale lock. |
| U3 | Resolved in specification. Stable slots, paired highlighting and qualified current-preview intent preserve actor association; the new preview marker must still be comprehension-tested. |
| U4 | Resolved in specification. Loading/degraded/unavailable states use independent local visuals and semantic controls; input readiness and retry ownership are explicit. |
| U5 | Resolved. One sequential target-control set, shared pointer mapping, focused-target-death behavior and one concise live region are explicit. |
| U6 | Resolved. Contrast targets, stable backings, district/frame checks and grayscale/reduced-motion verification are explicit. |

Material evidence still required: real touch targeting at 320×568 and 844×390; screen-reader/keyboard tests; actual contrast measurements; and the planned first-time-player tasks. In particular, an ordered target strip must remain clearly connected to the visible monsters and must not feel like the actors have reverted to cards.

## Final recommendation

Begin the prerequisite correctness work and a deliberately small art/layout prototype. Keep final roster production gated on W1/W4, and keep portfolio-release approval separate from specification approval. No additional feature or framework is required to address the findings from these two lenses.

# Golem attack sequence

Built-in image generation created two original poses from the existing idle/contact references. Sources: `art-source/battle/actors/vending-golem-windup-v1.png` and `art-source/battle/actors/vending-golem-recovery-v1.png`. Lossless runtime WebPs use the same names under `public/assets/battle/actors/`.

The first wind-up candidate raised the opposite arm and was rejected before integration. The accepted pose retracts the same screen-left fist that extends in the contact frame. Recovery lowers and partly retracts that fist. Both retain the worn vending-machine body, glass/can display and lower-slot eyes.

Wind-up source 1254×1254, alpha >=128 bounds (84,87)–(1210,1175), foot anchor [.5,.937]. Recovery source 1126×1397, bounds (20,134)–(1110,1270), anchor [.5,.909], scale1099/1136 to align visible body height with the idle. Both have alpha0–255.

Timeline: wind-up 80ms, contact160ms, recovery80ms, idle at320ms; damage beat remains140ms. Existing contact art stays in its atlas, and missing atlas frames stream as loose poses through the existing loader.

Verification:78 packaged assets validated;588,240 bounds samples passed; clip boundaries/reduced-motion tests and renderer streaming/atlas failure/disposal tests passed. Browser390×844, three monsters and ten cards: inspected0ms,140ms and260ms; same punching arm, ground alignment and clear HUD; no warnings/errors. Evidence:`tests/.e2e-out/golem-windup-mobile.png` and `tests/.e2e-out/golem-recovery-mobile.png`.

Golem is legacy/development-only in the current encounter ledger, but is explicitly part of W4's stress encounter. No production pools changed. Status stays review; authored idle and complete animation polish/encounter review remain open. Local only.

## Accepted wind-up prompt

Precise pose correction for the exact Vending Golem shown. Image1 is its attack contact. Create the immediately PRECEDING wind-up with the SAME punching arm: the fist that extends toward screen LEFT in image1 must be clenched and retracted back at the LEFT edge of the vending machine, elbow bent, not reaching forward. The arm on screen RIGHT must stay DOWN, bent at waist level, NOT raised. Do not swap arms. Torso slightly tilts back toward screen RIGHT, knees bend, feet planted. Both arms and two legs only. Same cracked glass vending machine body, can rows, turquoise/coral worn armor, amber eyes in lower slot, selector panel. Match proportions and same three-quarter camera. Single full body with complete uncut silhouette on transparent background, no floor/effects/text. Similar near-square canvas, soles94percent height. Preserve linework and warm-left/cyan-right lighting. Clear preparation for a LEFT punch, not a guard with raised right fist.

## Recovery prompt

Create the post-punch RECOVERY keypose of the EXACT Vending Golem in the provided attack image. Keep same arm continuity: screen-LEFT fist has just punched left and is now partly retracted, left elbow bent but fist still forward and lowered to lower chest height; screen-RIGHT fist remains tucked near waist. Torso leaning forward slightly from momentum, knees braced, feet planted same wide stance. Preserve exact worn turquoise/coral vending machine body, cracked glass with two rows cans, selector panel, lower dispensing slot angry amber eyes, cream pistons and all limb proportions. Same three-quarter side perspective, facing LEFT. Do not change into another machine or swap arms. Same illustrated painterly linework, warm-left/cyan-right light. Single full-body transparent game sprite with no floor, scenery, effects, text, card frame, or clipped parts. Near-square canvas around1240x1270, soles94percent image height. Distinct from fully extended contact and from upright idle, settling after a heavy punch.


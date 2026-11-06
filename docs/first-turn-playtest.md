# First-turn mobile playtest

Use five separate sessions. Start each session in a fresh browser context so the fixture cannot overwrite a saved run. For synthetic sessions, give each tester the prompts in order and keep the expected answers out of their instructions. Use browser viewports to exercise portrait, landscape, touch and keyboard. Report the browser and input method. Treat agent and tool latency separately from player time.

Start the local Vite development server. Open `/?review&arena`, open **Review screens · local fixtures**, and select **First-turn playtest**. The launcher hides for the session. Reload to reopen it. The fixture uses the Street Ambush lineup with controlled intents and a hand of Jabs. The rightmost enemy, Stray Voltage, shows 6 current damage with one turn of Weak remaining. Weak expires when the player ends the turn, so its attack deals 8. The other enemies deal 3 and 4. Neither production build includes the fixture.

## Prompts

Read the tasks in order. Start a timer for each task. Let players explain what they see and avoid pointing at controls or correcting them mid-task. Record the first answer or action, any self-correction, the elapsed time, and whether they needed help.

1. Show me which fighter you control.
2. Which opponent currently threatens the most damage?
3. Find the active effect on that opponent. Could the damage you see change before the attack? Tell me what helped you decide.
4. Play one Jab on the leftmost opponent.
5. End your turn and tell me what happened to your health.

## Record

Use one row per participant and task.

| Participant | Phone and browser | Task | First answer or action | Time | Error or self-correction | Help needed |
|---|---|---|---|---|---|---|

Expect the player to identify the hero, associate the 6 preview with Stray Voltage, discover that an effect can change the preview, land a Jab on Graffiti Imp, and end the turn. The fixture starts the player at 72 HP and ends this sequence at 57 HP. If two or more sessions show the same confusion, revise the interface and run that task again with fresh sessions. Synthetic sessions provide usability findings under browser simulation. Physical-device performance and spoken screen-reader behavior require separate checks.

## Synthetic review results

Three initial 320 × 568 Chromium sessions used visual touch, tactical touch, and keyboard with accessibility labels. All identified Street Runner and Voltage, hit the leftmost Imp with Jab, and ended at 57 HP. All three could discover Weak by inspecting Voltage, but the detail did not explain when it expired. The keyboard tester tried to navigate while focus briefly returned to Jab and opened End Run by mistake. The fixture launcher also covered part of the hand or targeting controls.

The revised inspection gives the expiry timing, keyboard focus moves directly to the first target after Play card, and the launcher hides during the session. Two fresh touch sessions, WebKit at 390 × 844 and Chromium at 844 × 390, explained the 3 + 4 + 8 damage from the revised UI. The attack and Weak icons still require inspection to learn their meaning. The landscape tester initially missed Play card because the art pushed it below the fold, then completed the turn after scrolling. Short landscape layouts now place smaller art next to the card details.

Browser replays in Chromium and WebKit at 320 × 568, 390 × 844, and 844 × 390 verified the expiry text, one Jab reducing Imp from 15 to 9 HP, and 57 HP after End Turn. The compact keyboard replay verified immediate target focus. The landscape replay checked that Jab's Play card button was visible and could be tapped without scrolling.

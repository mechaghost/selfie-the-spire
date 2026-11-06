# First-turn mobile playtest

Run five separate sessions with first-time players. Use the same phone viewport and reset the fixture between participants. Give each participant a fresh browser context so the fixture cannot overwrite their own saved run.

Start the local Vite development server. Open `/?review&arena`, open **Review screens · local fixtures**, and select **First-turn playtest** before handing over the device. The fixture uses the Street Ambush lineup with controlled intents and a hand of Jabs. The rightmost enemy, Stray Voltage, shows 6 current damage with one turn of Weak remaining. Weak expires when the player ends the turn, so its attack deals 8. The other enemies deal 3 and 4. Neither production build includes the fixture.

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

Expect the player to identify the hero, associate the 6 preview with Stray Voltage, discover that an effect can change the preview, land a Jab on Graffiti Imp, and end the turn. The fixture starts the player at 72 HP and ends this sequence at 57 HP. If two or more participants confuse the same target or intent, revise the interface and run that task again with fresh participants. This is a formative sample. The scripted browser walkthrough verifies the fixture only.

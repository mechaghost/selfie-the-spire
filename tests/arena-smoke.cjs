// Run against a VITE_COMBAT_ARENA=1 production build.
// E2E_BASE=http://localhost:4173 PW_CHROMIUM=/path/to/chrome node tests/arena-smoke.cjs
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const { chromium } = require('playwright-core');

const base = process.env.E2E_BASE || 'http://localhost:4173';
const output = join(__dirname, '.e2e-out');
const attacks = /^Inspect (Jab|Cheap Shot|Torch It|Haymaker|Tremor|Shiv Toss), (\d+) energy$/;
const seed = '72b23907-f7cf-4c98-95e8-5e64155244f8';

async function waitForDecision(page) {
    await page.waitForFunction(() => document.querySelector(
        '.end-turn-button:not(:disabled), dialog.combat-result-backdrop[open]'
    ));
}

async function tabTo(page, control, label) {
    await control.waitFor();
    for (let attempt = 0; attempt < 40; attempt++) {
        if (await control.evaluate(element => document.activeElement === element)) return;
        await page.keyboard.press('Tab');
    }
    assert.fail(`Could not reach ${label} with Tab`);
}

async function playFight(page, viewport, input, reducedMotion) {
    const captureId = `${viewport.width}-${input}-${reducedMotion}`;
    const activate = async (control, label) => {
        if (input === 'touch') return control.tap();
        await tabTo(page, control, label);
        await page.keyboard.press('Enter');
    };
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(runSeed => {
        const randomUUID = crypto.randomUUID.bind(crypto);
        let first = true;
        Object.defineProperty(crypto, 'randomUUID', { value: () => {
            if (!first) return randomUUID();
            first = false;
            return runSeed;
        } });
    }, seed);

    await page.goto(base);
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), reducedMotion === 'reduce');
    await activate(page.getByRole('button', { name: /Play a starter run/ }), 'starter run');
    await activate(page.locator('.map-node.available.type-combat').first(), 'first fight');
    await page.locator('.battle-arena canvas').waitFor();
    assert.equal(await page.evaluate(() => typeof window.__gameStore), 'undefined');
    const targets = page.locator('.actor-target:not([disabled])');
    assert.deepEqual(await targets.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label').split(',')[0])),
        ['Inspect Rat', 'Inspect Rat', 'Inspect Rat']);

    const victory = page.getByRole('heading', { name: 'VICTORY', exact: true });
    const defeat = page.getByRole('heading', { name: 'DEFEAT', exact: true });
    const endTurn = page.getByRole('button', { name: 'End Turn', exact: true });
    const handAttacks = page.locator('.hand-container').getByRole('button', { name: attacks });
    const targetPrompt = page.getByRole('region', { name: 'Choose card target' });
    if (input === 'keyboard') {
        await waitForDecision(page);
        const jab = page.locator('.hand-container').getByRole('button', { name: 'Inspect Jab, 1 energy' }).first();
        await tabTo(page, jab, 'Jab');
        const jabElement = await jab.elementHandle();
        await page.keyboard.press('Enter');
        const play = page.getByRole('button', { name: 'Play card', exact: true });
        await tabTo(page, play, 'Play card');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.activeElement.matches('[data-combat-target]:not(:disabled)'));
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.activeElement.matches('[data-play-card]'));
        await page.keyboard.press('Escape');
        await page.waitForFunction(element => document.activeElement === element, jabElement);
    }

    let plays = 0;
    let enemyTurns = 0;
    while (enemyTurns < 9) {
        await waitForDecision(page);
        if (await victory.isVisible()) break;
        assert.equal(await defeat.isVisible(), false, 'starter lost the Rat Pack fight');
        let energy = 3;
        for (let played = 0; played < 5; played++) {
            if (await victory.isVisible()) break;
            const labels = await handAttacks.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
            const affordable = labels
                .map((label, index) => ({ index, cost: Number(label.match(attacks)[2]) }))
                .filter(card => card.cost <= energy)
                .sort((a, b) => b.cost - a.cost);
            if (!affordable.length) break;
            const { index, cost } = affordable[0];
            await activate(handAttacks.nth(index), labels[index]);
            await activate(page.getByRole('button', { name: 'Play card', exact: true }), 'Play card');
            if (await targetPrompt.isVisible()) await activate(targets.first(), 'first living enemy');
            if (plays === 0) {
                const impact = page.locator('.combat-impact.impact-damage').first();
                await impact.waitFor();
                if (reducedMotion === 'reduce') {
                    assert.equal(await impact.evaluate(element => getComputedStyle(element).animationName), 'none');
                }
                await page.screenshot({ path: join(output, `full-speed-impact-${captureId}.png`) });
            }
            plays++;
            energy -= cost;
            await waitForDecision(page);
        }
        if (await victory.isVisible()) break;
        await activate(endTurn, 'End Turn');
        if (enemyTurns === 0) {
            const cue = page.locator('.table-controls .turn-phase-banner.enemy-turn');
            await cue.waitFor();
            const [banner, arena] = await Promise.all([cue.boundingBox(), page.locator('.battle-arena').boundingBox()]);
            assert.ok(banner.y >= arena.y + arena.height, 'enemy turn cue covers the arena');
        }
        enemyTurns++;
    }

    await victory.waitFor();
    assert.ok(plays > 0 && enemyTurns > 0);
    const rewards = page.locator('.reward-card-slot');
    assert.equal(await rewards.count(), 3);
    const rewardChoices = await rewards.getByRole('button').evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
    await page.locator('.combat-result-card').evaluate(async element => {
        await Promise.all(element.getAnimations({ subtree: true }).filter(animation => animation.effect.getTiming().iterations !== Infinity)
            .map(animation => animation.finished.catch(() => {})));
    });
    const bounds = await page.locator('.combat-result-card').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width, 'reward dialog exceeds viewport width');
    await page.screenshot({ path: join(output, `full-speed-victory-${captureId}.png`) });
    await activate(rewards.first().getByRole('button'), 'first reward card');
    await activate(page.getByRole('button', { name: 'Add to deck' }), 'Add to deck');

    const map = page.locator('main.city-street-map');
    const currentStop = page.locator('.map-node.current');
    await map.waitFor();
    const stop = await currentStop.getAttribute('aria-label');
    assert.match(stop, /stop 1.*Ocean Drive/);
    await page.reload();
    await map.waitFor();
    assert.equal(await currentStop.getAttribute('aria-label'), stop);
    const save = await page.evaluate(() => Object.values(localStorage).map(raw => {
        try { return JSON.parse(raw); } catch { return null; }
    }).find(value => Array.isArray(value?.masterDeck)));
    assert.equal(save.masterDeck.length, 13);
    assert.ok(save.player.gold > 99);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}×${viewport.height} (${input}, ${reducedMotion}): ${plays} attacks, ${enemyTurns} enemy turns, reward and map restored on reload`);
    return {
        plays, enemyTurns, rewardChoices, stop,
        hp: save.player.hp,
        gold: save.player.gold,
        deck: save.masterDeck.map(card => card.id),
        rng: save.rngSnapshot,
    };
}

async function main() {
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch({
        executablePath: process.env.PW_CHROMIUM,
        args: ['--enable-unsafe-swiftshader'],
    });
    try {
        const cases = [
            { viewport: { width: 320, height: 568 }, input: 'touch' },
            { viewport: { width: 844, height: 390 }, input: 'touch' },
            { viewport: { width: 320, height: 568 }, input: 'keyboard' },
            { viewport: { width: 320, height: 568 }, input: 'touch', reducedMotion: 'reduce' },
        ];
        let portraitBaseline;
        for (const { viewport, input, reducedMotion = 'no-preference' } of cases) {
            const page = await browser.newPage({ viewport, isMobile: true, hasTouch: input === 'touch', reducedMotion });
            try {
                const result = await playFight(page, viewport, input, reducedMotion);
                if (!portraitBaseline) portraitBaseline = result;
                if (reducedMotion === 'reduce') {
                    assert.deepEqual(result, portraitBaseline, 'Reduced motion changed the fight or saved outcome');
                    console.log('PASS normal and reduced motion produce identical portrait combat and reward outcomes');
                }
            } finally {
                await page.close();
            }
        }
    } finally {
        await browser.close();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

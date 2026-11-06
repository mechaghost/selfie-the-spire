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

async function playFight(page, viewport) {
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
    await page.getByRole('button', { name: /Play a starter run/ }).tap();
    await page.locator('.map-node.available.type-combat').first().tap();
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
            await handAttacks.nth(index).tap();
            await page.getByRole('button', { name: 'Play card', exact: true }).tap();
            if (await targetPrompt.isVisible()) await targets.first().tap();
            if (plays === 0) {
                await page.locator('.combat-impact.impact-damage').first().waitFor();
                await page.screenshot({ path: join(output, `full-speed-impact-${viewport.width}.png`) });
            }
            plays++;
            energy -= cost;
            await waitForDecision(page);
        }
        if (await victory.isVisible()) break;
        await endTurn.tap();
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
    await page.locator('.combat-result-card').evaluate(async element => {
        await Promise.all(element.getAnimations({ subtree: true }).filter(animation => animation.effect.getTiming().iterations !== Infinity)
            .map(animation => animation.finished.catch(() => {})));
    });
    const bounds = await page.locator('.combat-result-card').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width, 'reward dialog exceeds viewport width');
    await page.screenshot({ path: join(output, `full-speed-victory-${viewport.width}.png`) });
    await rewards.first().getByRole('button').tap();
    await page.getByRole('button', { name: 'Add to deck' }).tap();

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
    console.log(`PASS ${viewport.width}×${viewport.height}: ${plays} attacks, ${enemyTurns} enemy turns, reward and map restored on reload`);
}

async function main() {
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch({
        executablePath: process.env.PW_CHROMIUM,
        args: ['--enable-unsafe-swiftshader'],
    });
    try {
        for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
            const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
            try {
                await playFight(page, viewport);
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

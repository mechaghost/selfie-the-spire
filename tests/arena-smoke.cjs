// Run against a VITE_COMBAT_ARENA=1 production build.
// E2E_BASE=http://localhost:4173 PW_CHROMIUM=/path/to/chrome node tests/arena-smoke.cjs
// E2E_BROWSER=webkit node tests/arena-smoke.cjs
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const { chromium, webkit } = require('playwright-core');

const base = process.env.E2E_BASE || 'http://localhost:4173';
const useWebKit = process.env.E2E_BROWSER === 'webkit';
const output = useWebKit ? join(__dirname, '.e2e-out', 'webkit') : join(__dirname, '.e2e-out');
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
        // macOS WebKit uses Option-Tab to include buttons in sequential focus.
        await page.keyboard.press(useWebKit && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
    }
    assert.fail(`Could not reach ${label} with Tab`);
}

async function verifyTargetingAfterRotation(page, viewport, targetPrompt, targets) {
    await targetPrompt.waitFor();
    const before = await targets.evaluateAll(elements => elements.map(element => ({
        id: element.dataset.combatTarget,
        label: element.getAttribute('aria-label'),
    })));
    const energy = await page.locator('.energy-current').textContent();
    const portrait = await targets.first().boundingBox();
    for (const size of [{ width: 844, height: 390 }, viewport]) {
        await page.setViewportSize(size);
        await page.waitForFunction(({ expectedWidth, portraitX, landscape }) => {
            const arena = document.querySelector('.battle-arena')?.getBoundingClientRect();
            const targets = [...document.querySelectorAll('.actor-target.is-selectable:not(:disabled)')];
            const boxes = targets.map(target => target.getBoundingClientRect());
            return innerWidth === expectedWidth && arena && boxes.length === 3 &&
                (Math.abs(boxes[0].left - portraitX) > 1) === landscape &&
                boxes.every((box, index) => box.width >= 44 && box.height >= 44 &&
                    box.left >= arena.left && box.right <= arena.right &&
                    box.top >= arena.top && box.bottom <= arena.bottom &&
                    boxes.slice(0, index).every(other => other.right <= box.left || box.right <= other.left ||
                        other.bottom <= box.top || box.bottom <= other.top));
        }, { expectedWidth: size.width, portraitX: portrait.x, landscape: size.width > size.height });
        assert.equal(await targetPrompt.isVisible(), true);
        assert.equal(await page.locator('.energy-current').textContent(), energy);
        assert.deepEqual(await targets.evaluateAll(elements => elements.map(element => ({
            id: element.dataset.combatTarget,
            label: element.getAttribute('aria-label'),
        }))), before);
    }
}

async function playFight(page, { viewport, input, reducedMotion = 'no-preference', loseGraphics, rotate }) {
    const scenario = loseGraphics ? `graphics-loss-${loseGraphics}` : rotate ? 'rotation' : reducedMotion;
    const captureId = `${viewport.width}-${input}-${scenario}`;
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
    const stage = page.locator('.battle-stage-visual');
    const canvas = stage.locator('canvas');
    await page.locator('.battle-stage-visual[data-stage-status="ready"] canvas').waitFor();
    assert.equal(await page.evaluate(() => typeof window.__gameStore), 'undefined');
    const targets = page.locator('.actor-target:not([disabled])');
    assert.deepEqual(await targets.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label').split(',').slice(0, 2).join(','))),
        ['Inspect Rat, slot 1', 'Inspect Rat, slot 2', 'Inspect Rat, slot 3']);

    const victory = page.getByRole('heading', { name: 'VICTORY', exact: true });
    const announcement = page.locator('.combat-announcement[role="status"]');
    await announcement.filter({ hasText: /^Your turn\. \d+ of \d+ HP\.$/ }).waitFor();
    assert.match(await announcement.ariaSnapshot(), /status: Your turn\./);
    const defeat = page.getByRole('heading', { name: 'DEFEAT', exact: true });
    const endTurn = page.getByRole('button', { name: 'End Turn', exact: true });
    const handAttacks = page.locator('.hand-container').getByRole('button', { name: attacks });
    const targetPrompt = page.getByRole('region', { name: 'Choose card target' });
    if (viewport.width > viewport.height) {
        const hand = page.locator('.hand-container');
        await hand.locator('.card').last().waitFor({ state: 'attached' });
        const edges = await hand.evaluate(async element => {
            await Promise.all(element.getAnimations({ subtree: true })
                .filter(animation => animation.effect.getTiming().iterations !== Infinity)
                .map(animation => animation.finished.catch(() => {})));
            element.scrollTo({ left: element.scrollWidth, behavior: 'instant' });
            const { left, right } = element.getBoundingClientRect();
            const card = element.querySelector('.card-slot:last-child .card').getBoundingClientRect();
            const measured = { left, right, cardLeft: card.left, cardRight: card.right, width: card.width, height: card.height };
            element.scrollTo({ left: 0, behavior: 'instant' });
            return measured;
        });
        assert.equal(edges.width, 152);
        assert.equal(edges.height, 220);
        assert.ok(edges.cardLeft >= edges.left && edges.cardRight <= edges.right,
            `Landscape hand clips the last card at its scroll limit: ${JSON.stringify(edges)}`);
    }
    if (input === 'keyboard') {
        await waitForDecision(page);
        const jab = page.locator('.hand-container').getByRole('button', { name: 'Inspect Jab, 1 energy' }).first();
        await tabTo(page, jab, 'Jab');
        const jabElement = await jab.elementHandle();
        await page.keyboard.press('Enter');
        const play = page.getByRole('button', { name: 'Play card', exact: true });
        await tabTo(page, play, 'Play card');
        await page.keyboard.press('Enter');
        assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-combat-target]:not(:disabled)')), true,
            'Play card moves focus directly to the first available arena target');
        await tabTo(page, page.getByRole('button', { name: 'Use target list' }), 'target list toggle');
        await page.keyboard.press('Enter');
        const list = page.locator('.combat-target-list');
        await list.waitFor();
        assert.deepEqual((await list.getByRole('button').allTextContents()).map(label => label.split(' · ')[0]),
            ['1. Rat', '2. Rat', '3. Rat']);
        await tabTo(page, page.getByRole('button', { name: 'Use arena targets' }), 'arena target toggle');
        await page.keyboard.press('Enter');
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
            const playCard = page.getByRole('button', { name: 'Play card', exact: true });
            if (plays === 0 && viewport.width > viewport.height) {
                assert.ok(await playCard.evaluate(button => {
                    const buttonRect = button.getBoundingClientRect();
                    const dialogRect = button.closest('dialog').getBoundingClientRect();
                    return buttonRect.top >= dialogRect.top && buttonRect.bottom <= dialogRect.bottom;
                }), 'Play card is fully visible when the landscape inspection opens');
            }
            await activate(playCard, 'Play card');
            if (plays === 0 && rotate) await verifyTargetingAfterRotation(page, viewport, targetPrompt, targets);
            const interrupt = plays === 0 && loseGraphics;
            if (interrupt) {
                await targetPrompt.waitFor();
                await canvas.evaluate((element, phase) => {
                    const gl = element.getContext('webgl2') ?? element.getContext('webgl');
                    const extension = gl?.getExtension('WEBGL_lose_context');
                    if (!extension) throw new Error('The active renderer does not support WEBGL_lose_context');
                    if (phase === 'targeting') {
                        extension.loseContext();
                        return;
                    }
                    const stageElement = element.closest('.battle-stage-visual');
                    const target = document.querySelector('[data-combat-target]:not(:disabled)');
                    const feedback = document.querySelector('.combat-feedback');
                    const observer = new MutationObserver(() => {
                        if (!feedback.querySelector('.impact-damage')) return;
                        stageElement.dataset.statusAtImpact = stageElement.dataset.stageStatus;
                        observer.disconnect();
                    });
                    observer.observe(feedback, { childList: true });
                    target.addEventListener('click', () => setTimeout(() => {
                        stageElement.dataset.energyAtLoss = document.querySelector('.energy-current').textContent;
                        stageElement.dataset.targetAtLoss = target.getAttribute('aria-label');
                        extension.loseContext();
                    }, 0), { once: true });
                }, loseGraphics);
            }
            if (interrupt && loseGraphics === 'targeting') {
                await stage.locator('.battle-dom-fallback').waitFor();
                assert.equal(await targetPrompt.isVisible(), true, 'graphics loss dismissed the card target prompt');
                assert.equal(await page.locator('.energy-current').textContent(), String(energy), 'graphics loss spent energy');
            }
            if (await targetPrompt.isVisible()) await activate(targets.first(), 'first living enemy');
            if (interrupt && loseGraphics === 'resolution') {
                await stage.locator('.battle-dom-fallback').waitFor();
                assert.equal(await stage.getAttribute('data-energy-at-loss'), String(energy - cost));
                assert.match(await stage.getAttribute('data-target-at-loss'), /14 of 14 HP/);
            }
            if (plays === 0) {
                const impact = page.locator('.combat-impact.impact-damage').first();
                await impact.waitFor();
                if (interrupt && loseGraphics === 'resolution') {
                    assert.equal(await stage.getAttribute('data-status-at-impact'), 'degraded');
                }
                if (reducedMotion === 'reduce') {
                    assert.equal(await impact.evaluate(element => getComputedStyle(element).animationName), 'none');
                }
                await page.screenshot({ path: join(output, `full-speed-impact-${captureId}.png`) });
            }
            plays++;
            energy -= cost;
            await waitForDecision(page);
            if (plays === 1 && loseGraphics) {
                const afterHit = await targets.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label')));
                assert.match(afterHit[0], /8 of 14 HP/);
                await activate(page.getByRole('button', { name: 'Retry graphics' }), 'Retry graphics');
                await page.locator('.battle-stage-visual[data-stage-status="ready"] canvas').waitFor();
                assert.deepEqual(await targets.evaluateAll(elements => elements.map(element => element.getAttribute('aria-label'))), afterHit);
            }
        }
        if (await victory.isVisible()) break;
        await activate(endTurn, 'End Turn');
        if (enemyTurns === 0) {
            await announcement.filter({ hasText: 'Enemy turn.' }).waitFor();
            const cue = page.locator('.table-controls .turn-phase-banner.enemy-turn');
            await cue.waitFor();
            const [banner, arena] = await Promise.all([cue.boundingBox(), page.locator('.battle-arena').boundingBox()]);
            assert.ok(banner.y >= arena.y + arena.height, 'enemy turn cue covers the arena');
        }
        enemyTurns++;
    }

    await victory.waitFor();
    assert.equal(await announcement.textContent(), 'Victory. Rewards available.');
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
    console.log(`PASS ${viewport.width}×${viewport.height} (${input}, ${scenario}): ${plays} attacks, ${enemyTurns} enemy turns, reward and map restored on reload`);
    return {
        plays, enemyTurns, rewardChoices, stop,
        hp: save.player.hp,
        gold: save.player.gold,
        deck: save.masterDeck.map(card => card.id),
        rng: save.rngSnapshot,
    };
}

async function verifyLocalSelfie(page) {
    const remoteRequests = [];
    const thirdPartyRequests = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = new URL(base).origin;
    await page.route(/^https?:/, route => {
        const url = route.request().url();
        if (new URL(url).origin === origin) return route.continue();
        thirdPartyRequests.push(url);
        return route.abort();
    });
    await page.goto(base);
    const fonts = await page.evaluate(async () => {
        const faces = await Promise.all(['400 16px "Bebas Neue"', '400 16px "Space Mono"', '700 16px "Space Mono"']
            .map(font => document.fonts.load(font, 'Ocean Drive')));
        return faces.map(group => group.some(face => face.status === 'loaded'));
    });
    assert.deepEqual(fonts, [true, true, true]);
    await page.getByRole('button', { name: /Put me in the game/ }).tap();
    page.on('request', request => {
        if (['fetch', 'xhr'].includes(request.resourceType()) || request.method() !== 'GET') {
            remoteRequests.push(request.url());
        }
    });
    await page.locator('input[type=file]').setInputFiles(join(__dirname, 'fixtures', 'bob_ross.jpg'));
    const cropPreview = page.getByRole('img', { name: 'Photo crop preview' });
    await cropPreview.waitFor();
    const cropImage = () => cropPreview.evaluate(canvas => canvas.toDataURL('image/jpeg', 0.8));
    const centered = await cropImage();
    await page.getByRole('slider', { name: 'Zoom' }).press('End');
    const zoomed = await cropImage();
    assert.notEqual(zoomed, centered);
    await page.getByRole('slider', { name: 'Left to right' }).press('End');
    const adjusted = await cropImage();
    assert.notEqual(adjusted, zoomed);
    await page.getByRole('button', { name: 'Use this photo' }).tap();
    const preview = page.locator('.reveal-battle-actor');
    await preview.waitFor();
    assert.equal(await page.locator('.reveal-portrait-img').getAttribute('src'), adjusted);
    const sprite = await preview.evaluate(async image => {
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return {
            url: image.src,
            size: [canvas.width, canvas.height],
            alpha: [context.getImageData(0, 0, 1, 1).data[3], context.getImageData(138, 69, 1, 1).data[3]],
        };
    });
    assert.match(sprite.url, /^data:image\/png;base64,/);
    assert.deepEqual(sprite.size, [256, 384]);
    assert.deepEqual(sprite.alpha, [0, 255]);
    await page.getByRole('button', { name: 'Begin your journey' }).tap();
    await page.locator('main.city-street-map').waitFor();
    await page.reload();
    await page.locator('main.city-street-map').waitFor();
    const restored = await page.evaluate(() => Object.values(localStorage)
        .map(raw => { try { return JSON.parse(raw); } catch { return null; } })
        .find(value => Array.isArray(value?.masterDeck))?.player?.combatAppearance?.idleImageUrl);
    assert.equal(restored, sprite.url);
    await page.locator('.map-node.available.type-combat').first().tap();
    const stage = page.locator('.battle-stage-visual');
    const canvas = stage.locator('canvas');
    await stage.and(page.locator('[data-stage-status="ready"]')).locator('canvas').waitFor();
    await canvas.evaluate(element => {
        const gl = element.getContext('webgl2') ?? element.getContext('webgl');
        const extension = gl?.getExtension('WEBGL_lose_context');
        if (!extension) throw new Error('The active renderer does not support WEBGL_lose_context');
        extension.loseContext();
    });
    const fallbackImages = stage.locator('.battle-dom-fallback .battle-fallback-actor img');
    await fallbackImages.first().waitFor();
    const renderedSprites = await fallbackImages.evaluateAll(images => Promise.all(images.map(async image => {
        await image.decode();
        return image.src;
    })));
    assert.ok(renderedSprites.includes(sprite.url), 'Combat fallback must render the exact selfie sprite from the preview');
    assert.deepEqual(remoteRequests, []);
    assert.deepEqual(thirdPartyRequests, []);
    assert.deepEqual(errors, []);
    console.log('PASS 320×568: photo picker, transparent preview, same sprite after reload and WebGL loss, no API calls');
}

async function verifyMissingActorRecovery(page) {
    const missing = '**/assets/battle/actors/street-runner-idle-v1.webp';
    await page.route(missing, route => route.abort('failed'));
    await page.goto(base);
    await page.getByRole('button', { name: /Play a starter run/ }).tap();
    await page.locator('.map-node.available.type-combat').first().tap();

    const stage = page.locator('.battle-stage-visual');
    const silhouette = stage.locator('.battle-fallback-actor').first().locator('svg');
    const retry = page.getByRole('button', { name: 'Retry graphics' });
    await stage.and(page.locator('[data-stage-status="degraded"]')).waitFor();
    await silhouette.waitFor();
    await retry.waitFor();

    const checkpoint = () => page.evaluate(() => JSON.parse(localStorage.getItem('stt_run')));
    const before = await checkpoint();
    await page.getByRole('button', { name: 'End Turn', exact: true }).tap();
    await page.waitForFunction(previous => {
        const save = JSON.parse(localStorage.getItem('stt_run'));
        return save.isPlayerTurn && JSON.stringify(save.rngSnapshot) !== JSON.stringify(previous);
    }, before.rngSnapshot);
    const afterTurn = await checkpoint();

    await page.unroute(missing);
    await retry.tap();
    await stage.and(page.locator('[data-stage-status="ready"]')).locator('canvas').waitFor();
    assert.deepEqual(await checkpoint(), afterTurn, 'Graphics retry preserves the completed turn');
    console.log('PASS 320×568: failed hero image uses a playable silhouette, and retry restores graphics without changing the run');
}

async function main() {
    await mkdir(output, { recursive: true });
    const browser = await (useWebKit ? webkit.launch() : chromium.launch({
        executablePath: process.env.PW_CHROMIUM,
        args: ['--enable-unsafe-swiftshader'],
    }));
    try {
        const selfiePage = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
        try {
            await verifyLocalSelfie(selfiePage);
        } finally {
            await selfiePage.close();
        }
        const recoveryPage = await browser.newPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
        try {
            await verifyMissingActorRecovery(recoveryPage);
        } finally {
            await recoveryPage.close();
        }
        const cases = [
            { viewport: { width: 320, height: 568 }, input: 'touch' },
            { viewport: { width: 844, height: 390 }, input: 'touch' },
            { viewport: { width: 320, height: 568 }, input: 'keyboard' },
            { viewport: { width: 320, height: 568 }, input: 'touch', reducedMotion: 'reduce' },
            { viewport: { width: 320, height: 568 }, input: 'touch', loseGraphics: 'targeting' },
            { viewport: { width: 320, height: 568 }, input: 'touch', loseGraphics: 'resolution' },
            { viewport: { width: 320, height: 568 }, input: 'touch', rotate: true },
        ];
        let portraitBaseline;
        for (const testCase of cases) {
            const { viewport, input, reducedMotion = 'no-preference', loseGraphics, rotate } = testCase;
            const page = await browser.newPage({ viewport, isMobile: true, hasTouch: input === 'touch', reducedMotion });
            try {
                const result = await playFight(page, testCase);
                if (!portraitBaseline) portraitBaseline = result;
                if (reducedMotion === 'reduce') {
                    assert.deepEqual(result, portraitBaseline, 'Reduced motion changed the fight or saved outcome');
                    console.log('PASS normal and reduced motion produce identical portrait combat and reward outcomes');
                }
                if (loseGraphics) assert.deepEqual(result, portraitBaseline, 'Graphics loss or retry changed the fight or saved outcome');
                if (rotate) assert.deepEqual(result, portraitBaseline, 'Rotation changed the fight or saved outcome');
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

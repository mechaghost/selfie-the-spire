import { Hono } from 'hono';
import {GenerationTimeout,withGenerationBudget} from '../services/generationBudget.js';
import { moderateSelfie, analyzeSelfie, generateCharacterArt, generateHeroCardMechanics, generateHeroCardArt, generateCombatCharacterArt } from '../services/gemini.js';
import { ensureCombatMattingReady } from '../services/removeCombatBackground.js';
import { generateCharacterFromAnalysis } from '../services/generator.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in base64 chars

export const characterRoute = new Hono();

characterRoute.post('/generate-character', async (c) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return c.json({ error: 'Hero creation is unavailable right now. You can play a starter hero without a photo.' }, 503);
        }
        const body = await c.req.json();

        if (!body.image || typeof body.image !== 'string') {
            return c.json({ error: 'Missing image field' }, 400);
        }
        if (body.image.length > MAX_IMAGE_SIZE) {
            return c.json({ error: 'Image too large (max 5MB)' }, 413);
        }
        if (!body.image.startsWith('data:image/')) {
            return c.json({ error: 'Invalid image format' }, 400);
        }

        // Generate only with a configured provider; never disguise a preset as a generated hero.
        return await withGenerationBudget(c.req.raw.signal,async signal=>{
            // Validate deployment model readiness before spending on generation.
            const personalCombat=process.env.ENABLE_PERSONALIZED_COMBAT==='1';
            if(personalCombat)await ensureCombatMattingReady();
            signal.throwIfAborted();
            // Step 1: Moderate the selfie
            const moderation = await moderateSelfie(body.image,signal);
            signal.throwIfAborted();
            if (!moderation.valid) {
                return c.json({ error: moderation.reason || 'Please upload a clear photo of your face' }, 422);
            }

            // Step 2: Analyze for archetype
            const analysis = await analyzeSelfie(body.image,signal);
            signal.throwIfAborted();

            // Card art depends on mechanics, not on the portrait or combat extraction.
            const mechanicsPromise = generateHeroCardMechanics(analysis,signal);
            const cardArtPromise = mechanicsPromise.then(mechanics => generateHeroCardArt(
                body.image, mechanics.name, mechanics.description, mechanics.type, analysis.archetype, signal,
            ));
            const [portraitUrl, heroMechanics, combatCutout, heroCardArtUrl] = await Promise.all([
                generateCharacterArt(body.image, analysis.archetype,signal),
                mechanicsPromise,
                personalCombat ? generateCombatCharacterArt(body.image,analysis.archetype,signal) : Promise.resolve(undefined),
                cardArtPromise,
            ]);

            // Step 5: Assemble result with hero card
            const result = generateCharacterFromAnalysis(analysis, portraitUrl, {
                ...heroMechanics,
                imageUrl: heroCardArtUrl,
            });

            if(combatCutout) {
                return c.json({...result,character:{...result.character,combatAppearance:{version:2,actorVisualId:`hero-${analysis.archetype}`,idleImageUrl:combatCutout}}});
            }
            return c.json(result);
        });
    } catch (err: any) {
        if(err instanceof GenerationTimeout)return c.json({error:'Creating your hero took too long. Please try again.'},504);
        if(c.req.raw.signal.aborted)return c.json({error:'Character creation was cancelled.'},408);
        console.error('Character generation failed');
        return c.json({ error: 'Character generation failed. Please try again.' }, 500);
    }
});

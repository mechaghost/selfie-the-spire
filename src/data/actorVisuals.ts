import { ActorVisual, CombatAppearance, validateActorVisual } from '../core/battleVisualModels';
import { enemies } from './enemies';
export const HERO_ARCHETYPES = ['neon','chrome','volt','concrete','smoke'] as const;
function placeholder(id: string, hero: boolean): ActorVisual {
    return { id, fallbackImageUrl:`/assets/battle/fallbacks/${hero ? 'hero' : 'monster'}.svg`, footAnchor:[.5, .97],
        facing:hero ? 'right' : 'left', mirrorAllowed:true,visualHeight:192,clips:{},productionStatus:'placeholder',
        provenance:'Original inline vector silhouette authored for renderer fallback; not final production art.' };
}
export const ACTOR_VISUALS: Record<string, ActorVisual> = Object.fromEntries([
    ...HERO_ARCHETYPES.map(id => [`hero-${id}`,placeholder(`hero-${id}`,true)] as const),
    ...Object.keys(enemies).map(id => [id,placeholder(id,false)] as const),
]);
for (const [id, file, footY] of [
    ['hero-neon', 'street-runner-idle-v1.png', .99],
    ['hero-chrome', 'chrome-idle-v1.png', .99],
    ['hero-volt', 'volt-idle-v1.png', .99],
    ['hero-concrete', 'concrete-idle-v1.png', .99],
    ['hero-smoke', 'smoke-idle-v1.png', .99],
    ['stray_voltage', 'stray-voltage-idle-v1.png', 0.96],
    ['dumpster_crawler', 'dumpster-crawler-idle-v1.png', 0.96],
    ['graffiti_imp', 'graffiti-imp-idle-v1.png', 0.99],
    ['smoke_specter', 'smoke-specter-idle-v1.png', .99],
    ['taxi_ghost', 'taxi-ghost-idle-v1.png', .99],
    ['manhole_mimic', 'manhole-mimic-idle-v1.png', .99],
    ['neon_junkie', 'neon-junkie-idle-v1.png', .99],
    ['boombox_brute', 'boombox-brute-idle-v1.png', 0.99],
    ['neon_wraith', 'neon-wraith-idle-v1.png', 0.99],
    ['sewer_slime', 'sewer-slime-idle-v1.png', 0.94],
    ['payphone_phantom', 'payphone-phantom-idle-v1.png', 0.99],
    ['neon_sentinel', 'neon-sentinel-idle-v1.png', 0.99],
    ['chrome_phantom', 'chrome-phantom-idle-v1.png', 0.99],
    ['voltage_king', 'voltage-king-idle-v1.png', 0.99],
    ['circuit_breaker', 'circuit-breaker-idle-v1.png', 0.93],
    ['neon_yakuza', 'neon-yakuza-idle-v1.png', 0.99],
    ['chrome_bouncer', 'chrome-bouncer-idle-v1.png', 0.99],
    ['the_billboard', 'the-billboard-idle-v1.png', .99],
    ['subway_wyrm', 'subway-wyrm-idle-v1.png', .99],
    ['dj_phantom', 'dj-phantom-idle-v1.png', .99],
    ['alley_rat', 'alley-rat-idle-v1.png', .94],
    ['vending_golem', 'vending-golem-idle-v1.png', .94],
    ['fire_escape_spider', 'fire-escape-spider-idle-v1.png', .94],
] as const) {
    ACTOR_VISUALS[id] = { ...ACTOR_VISUALS[id], fallbackImageUrl:`/assets/battle/actors/${file}`, footAnchor:[.5,footY],
        productionStatus:'review', provenance:'Original AI-generated Neo Miami monster using built-in image generation; see docs/battle-art-prompts.md. Idle cutout only; animation approval pending.' };
}
ACTOR_VISUALS['hero-neon'].keyPoses = {attack:{imageUrl:'/assets/battle/actors/street-runner-attack-v1.png',footAnchor:[.5,.97]}};
ACTOR_VISUALS.alley_rat.keyPoses = {attack:{imageUrl:'/assets/battle/actors/alley-rat-attack-v1.png',footAnchor:[.5,.93]}};
Object.values(ACTOR_VISUALS).forEach(validateActorVisual);
export function resolveAppearance(value: CombatAppearance | undefined, archetype = 'neon'): ActorVisual {
    if (value?.version === 1 && ACTOR_VISUALS[value.actorVisualId]?.id?.startsWith('hero-')) return ACTOR_VISUALS[value.actorVisualId];
    return ACTOR_VISUALS[`hero-${archetype}`] ?? ACTOR_VISUALS['hero-neon'];
}

export function appearanceForArchetype(archetype:string):CombatAppearance {
    return {version:1,actorVisualId:resolveAppearance(undefined,archetype).id};
}
export function normalizeAppearance(value:CombatAppearance|undefined):CombatAppearance {
    return {version:1,actorVisualId:resolveAppearance(value).id};
}

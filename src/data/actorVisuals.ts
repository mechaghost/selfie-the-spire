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
    ['alley_rat', 'alley-rat-idle-v1.png', .94],
    ['vending_golem', 'vending-golem-idle-v1.png', .94],
    ['fire_escape_spider', 'fire-escape-spider-idle-v1.png', .94],
] as const) {
    ACTOR_VISUALS[id] = { ...ACTOR_VISUALS[id], fallbackImageUrl:`/assets/battle/actors/${file}`, footAnchor:[.5,footY],
        productionStatus:'review', provenance:'Original AI-generated Neo Miami monster using built-in image generation; see docs/battle-art-prompts.md. Idle cutout only; animation approval pending.' };
}
Object.values(ACTOR_VISUALS).forEach(validateActorVisual);
export function resolveAppearance(value: CombatAppearance | undefined, archetype = 'neon'): ActorVisual {
    if (value?.version === 1 && ACTOR_VISUALS[value.actorVisualId]?.id.startsWith('hero-')) return ACTOR_VISUALS[value.actorVisualId];
    return ACTOR_VISUALS[`hero-${archetype}`] ?? ACTOR_VISUALS['hero-neon'];
}

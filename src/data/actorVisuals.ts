import { ActorVisual, CombatAppearance, isPersonalizedCutout, validateActorVisual } from '../core/battleVisualModels';
import { enemies } from './enemies';
import { GOLEM_ATLAS_FRAMES } from './actorAtlasFrames';
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
    ['hero-neon', 'street-runner-idle-v1.webp', .99],
    ['hero-chrome', 'chrome-idle-v1.webp', .99],
    ['hero-volt', 'volt-idle-v1.webp', .99],
    ['hero-concrete', 'concrete-idle-v1.webp', .99],
    ['hero-smoke', 'smoke-idle-v1.webp', .99],
    ['stray_voltage', 'stray-voltage-idle-v1.webp', 0.96],
    ['dumpster_crawler', 'dumpster-crawler-idle-v1.webp', 0.96],
    ['graffiti_imp', 'graffiti-imp-idle-v1.webp', 0.99],
    ['smoke_specter', 'smoke-specter-idle-v1.webp', .99],
    ['taxi_ghost', 'taxi-ghost-idle-v1.webp', .99],
    ['manhole_mimic', 'manhole-mimic-idle-v1.webp', .99],
    ['neon_junkie', 'neon-junkie-idle-v1.webp', .99],
    ['boombox_brute', 'boombox-brute-idle-v1.webp', 0.99],
    ['neon_wraith', 'neon-wraith-idle-v1.webp', 0.99],
    ['sewer_slime', 'sewer-slime-idle-v1.webp', 0.94],
    ['payphone_phantom', 'payphone-phantom-idle-v1.webp', 0.99],
    ['neon_sentinel', 'neon-sentinel-idle-v1.webp', 0.99],
    ['chrome_phantom', 'chrome-phantom-idle-v1.webp', 0.99],
    ['voltage_king', 'voltage-king-idle-v1.webp', 0.99],
    ['circuit_breaker', 'circuit-breaker-idle-v1.webp', 0.93],
    ['neon_yakuza', 'neon-yakuza-idle-v1.webp', 0.99],
    ['chrome_bouncer', 'chrome-bouncer-idle-v1.webp', 0.99],
    ['the_billboard', 'the-billboard-idle-v1.webp', .99],
    ['subway_wyrm', 'subway-wyrm-idle-v1.webp', .99],
    ['dj_phantom', 'dj-phantom-idle-v1.webp', .99],
    ['alley_rat', 'alley-rat-idle-v1.webp', .94],
    ['vending_golem', 'vending-golem-idle-v1.webp', .94],
    ['fire_escape_spider', 'fire-escape-spider-idle-v1.webp', .94],
] as const) {
    ACTOR_VISUALS[id] = { ...ACTOR_VISUALS[id], fallbackImageUrl:`/assets/battle/actors/${file}`, footAnchor:[.5,footY],
        productionStatus:'review', provenance:'Original AI-generated Neo Miami monster using built-in image generation; see docs/battle-art-prompts.md. Idle cutout only; animation approval pending.' };
}
ACTOR_VISUALS['hero-neon'].keyPoses = {attack:{imageUrl:'/assets/battle/actors/street-runner-attack-v1.webp',footAnchor:[.5,.97]}};
ACTOR_VISUALS.alley_rat.keyPoses = {attack:{imageUrl:'/assets/battle/actors/alley-rat-attack-v1.webp',footAnchor:[.5,.93]}};
ACTOR_VISUALS.vending_golem.keyPoses = {attack:{imageUrl:'/assets/battle/actors/vending-golem-attack-v1.webp',footAnchor:[.5,.94]}};
ACTOR_VISUALS.fire_escape_spider.keyPoses = {attack:{imageUrl:'/assets/battle/actors/fire-escape-spider-attack-v1.webp',footAnchor:[.5,.94]}};
ACTOR_VISUALS['hero-neon'].keyPoses!.hit = {imageUrl:'/assets/battle/actors/street-runner-hit-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.guard = {imageUrl:'/assets/battle/actors/street-runner-guard-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.defeat = {imageUrl:'/assets/battle/actors/street-runner-defeat-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.celebrate = {imageUrl:'/assets/battle/actors/street-runner-celebrate-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.alley_rat.keyPoses!.hit = {imageUrl:'/assets/battle/actors/alley-rat-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.alley_rat.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/alley-rat-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.keyPoses!.hit = {imageUrl:'/assets/battle/actors/vending-golem-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/vending-golem-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.hit = {imageUrl:'/assets/battle/actors/fire-escape-spider-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/fire-escape-spider-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.atlasUrl='/assets/battle/actors/vending-golem-poses-v1.webp';
ACTOR_VISUALS.vending_golem.keyPoses!.guard={imageUrl:'/assets/battle/actors/vending-golem-guard-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.cast={imageUrl:'/assets/battle/actors/fire-escape-spider-cast-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.atlasFrames=GOLEM_ATLAS_FRAMES;
for(const archetype of ['chrome','volt','concrete','smoke']) {
    ACTOR_VISUALS[`hero-${archetype}`].keyPoses={attack:{imageUrl:`/assets/battle/actors/${archetype}-attack-v1.webp`,footAnchor:[.5,.98]}};
}
ACTOR_VISUALS.taxi_ghost.keyPoses={attack:{imageUrl:'/assets/battle/actors/taxi-ghost-attack-v1.webp',footAnchor:[.5,.99]}};
ACTOR_VISUALS.smoke_specter.keyPoses={attack:{imageUrl:'/assets/battle/actors/smoke-specter-attack-v1.webp',footAnchor:[.5,.99]}};
ACTOR_VISUALS.graffiti_imp.keyPoses={attack:{imageUrl:'/assets/battle/actors/graffiti-imp-attack-v1.webp',footAnchor:[.5,.947]}};
// Explicit key-pose timelines; these do not represent approved multi-frame animation art.
for(const id of [...HERO_ARCHETYPES.map(id=>`hero-${id}`),'alley_rat','vending_golem','fire_escape_spider','smoke_specter','taxi_ghost','graffiti_imp']) {
    ACTOR_VISUALS[id].clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
}
Object.values(ACTOR_VISUALS).forEach(validateActorVisual);
export function resolveAppearance(value: CombatAppearance | undefined, archetype = 'neon'): ActorVisual {
    const base=value && (value.version===1 || value.version===2) && ACTOR_VISUALS[value.actorVisualId]?.id?.startsWith('hero-')
        ? ACTOR_VISUALS[value.actorVisualId] : ACTOR_VISUALS[`hero-${archetype}`] ?? ACTOR_VISUALS['hero-neon'];
    if(value?.version===2 && isPersonalizedCutout(value.idleImageUrl)) {
        // Do not borrow another person's attack or reaction artwork. The personal
        // cutout uses procedural movement until identity-matched poses are available.
        return {...base,id:`${base.id}-personalized`,fallbackImageUrl:value.idleImageUrl,
            atlasUrl:undefined,atlasFrames:undefined,keyPoses:undefined,clips:{},footAnchor:[.5,.99],
            productionStatus:'review',provenance:'Personalized generated combat cutout; matching pose generation pending.'};
    }
    return base;
}

export function appearanceForArchetype(archetype:string):CombatAppearance {
    return {version:1,actorVisualId:resolveAppearance(undefined,archetype).id};
}
export function normalizeAppearance(value:CombatAppearance|undefined,archetype='neon'):CombatAppearance {
    const fallback=appearanceForArchetype(archetype);
    const actorVisualId=value && ACTOR_VISUALS[value.actorVisualId]?.id?.startsWith('hero-') ? value.actorVisualId : fallback.actorVisualId;
    if(value?.version===2 && isPersonalizedCutout(value.idleImageUrl))return {version:2,actorVisualId,idleImageUrl:value.idleImageUrl};
    return {version:1,actorVisualId};
}

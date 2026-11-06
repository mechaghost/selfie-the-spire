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
ACTOR_VISUALS.alley_rat.keyPoses = {attack:{imageUrl:'/assets/battle/actors/alley-rat-attack-v1.webp',footAnchor:[.5,.93],scale:1536/1774}};
ACTOR_VISUALS.vending_golem.keyPoses = {attack:{imageUrl:'/assets/battle/actors/vending-golem-attack-v1.webp',footAnchor:[.5,.94]}};
ACTOR_VISUALS.fire_escape_spider.keyPoses = {attack:{imageUrl:'/assets/battle/actors/fire-escape-spider-attack-v1.webp',footAnchor:[.5,.94]}};
ACTOR_VISUALS['hero-neon'].keyPoses!.hit = {imageUrl:'/assets/battle/actors/street-runner-hit-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.guard = {imageUrl:'/assets/battle/actors/street-runner-guard-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.defeat = {imageUrl:'/assets/battle/actors/street-runner-defeat-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.celebrate = {imageUrl:'/assets/battle/actors/street-runner-celebrate-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.cast = {imageUrl:'/assets/battle/actors/street-runner-cast-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].keyPoses!.blink={imageUrl:'/assets/battle/actors/street-runner-blink-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS['hero-neon'].clips.idle={frames:['idle','blink'],durationsMs:[4200,100],loop:true,completion:'idle'};
ACTOR_VISUALS.alley_rat.keyPoses!.hit = {imageUrl:'/assets/battle/actors/alley-rat-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.alley_rat.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/alley-rat-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.alley_rat.keyPoses!.blink={imageUrl:'/assets/battle/actors/alley-rat-blink-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.alley_rat.clips.idle={frames:['idle','blink'],durationsMs:[3500,100],loop:true,completion:'idle'};
ACTOR_VISUALS.vending_golem.keyPoses!.hit = {imageUrl:'/assets/battle/actors/vending-golem-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/vending-golem-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.hit = {imageUrl:'/assets/battle/actors/fire-escape-spider-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.defeat = {imageUrl:'/assets/battle/actors/fire-escape-spider-defeat-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.atlasUrl='/assets/battle/actors/vending-golem-poses-v1.webp';
ACTOR_VISUALS.vending_golem.keyPoses!.guard={imageUrl:'/assets/battle/actors/vending-golem-guard-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.keyPoses!.cast={imageUrl:'/assets/battle/actors/vending-golem-cast-v1.webp',footAnchor:[.5,.959]};
ACTOR_VISUALS.vending_golem.keyPoses!.blink={imageUrl:'/assets/battle/actors/vending-golem-blink-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.vending_golem.clips.idle={frames:['idle','blink'],durationsMs:[3900,110],loop:true,completion:'idle'};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.cast={imageUrl:'/assets/battle/actors/fire-escape-spider-cast-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.guard={imageUrl:'/assets/battle/actors/fire-escape-spider-guard-v1.webp',footAnchor:[.5,.913]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.blink={imageUrl:'/assets/battle/actors/fire-escape-spider-blink-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.fire_escape_spider.clips.idle={frames:['idle','blink'],durationsMs:[4700,100],loop:true,completion:'idle'};
ACTOR_VISUALS.vending_golem.atlasFrames=GOLEM_ATLAS_FRAMES;
for(const archetype of ['chrome','volt','concrete','smoke']) {
    ACTOR_VISUALS[`hero-${archetype}`].keyPoses={attack:{imageUrl:`/assets/battle/actors/${archetype}-attack-v1.webp`,footAnchor:[.5,.98]}};
}
ACTOR_VISUALS.taxi_ghost.keyPoses={attack:{imageUrl:'/assets/battle/actors/taxi-ghost-attack-v1.webp',footAnchor:[.5,.99]}};
ACTOR_VISUALS.taxi_ghost.keyPoses.hit={imageUrl:'/assets/battle/actors/taxi-ghost-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.taxi_ghost.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.taxi_ghost.keyPoses.defeat={imageUrl:'/assets/battle/actors/taxi-ghost-defeat-v1.webp',footAnchor:[.5,.988]};
ACTOR_VISUALS.taxi_ghost.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.smoke_specter.keyPoses={attack:{imageUrl:'/assets/battle/actors/smoke-specter-attack-v1.webp',footAnchor:[.5,.99]}};
ACTOR_VISUALS.smoke_specter.keyPoses.hit={imageUrl:'/assets/battle/actors/smoke-specter-hit-v1.webp',footAnchor:[.5,.991]};
ACTOR_VISUALS.smoke_specter.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.smoke_specter.keyPoses.defeat={imageUrl:'/assets/battle/actors/smoke-specter-defeat-v1.webp',footAnchor:[.5,.998]};
ACTOR_VISUALS.smoke_specter.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.graffiti_imp.keyPoses={attack:{imageUrl:'/assets/battle/actors/graffiti-imp-attack-v1.webp',footAnchor:[.5,.947]}};
ACTOR_VISUALS.graffiti_imp.keyPoses.hit={imageUrl:'/assets/battle/actors/graffiti-imp-hit-v1.webp',footAnchor:[.5,.988]};
ACTOR_VISUALS.graffiti_imp.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.graffiti_imp.keyPoses.cast={imageUrl:'/assets/battle/actors/graffiti-imp-cast-v1.webp',footAnchor:[.5,.988]};
ACTOR_VISUALS.graffiti_imp.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.graffiti_imp.keyPoses.defeat={imageUrl:'/assets/battle/actors/graffiti-imp-defeat-v1.webp',footAnchor:[.5,.999],scale:.84};
ACTOR_VISUALS.graffiti_imp.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.neon_junkie.keyPoses={attack:{imageUrl:'/assets/battle/actors/neon-junkie-attack-v1.webp',footAnchor:[.5,.979]}};
ACTOR_VISUALS.neon_junkie.keyPoses.hit={imageUrl:'/assets/battle/actors/neon-junkie-hit-v1.webp',footAnchor:[.5,.992]};
ACTOR_VISUALS.neon_junkie.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_junkie.keyPoses.cast={imageUrl:'/assets/battle/actors/neon-junkie-cast-v1.webp',footAnchor:[.5,.990]};
ACTOR_VISUALS.neon_junkie.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_junkie.keyPoses.defeat={imageUrl:'/assets/battle/actors/neon-junkie-defeat-v1.webp',footAnchor:[.5,.983]};
ACTOR_VISUALS.neon_junkie.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.stray_voltage.keyPoses={attack:{imageUrl:'/assets/battle/actors/stray-voltage-attack-v1.webp',footAnchor:[.5,.92]}};
ACTOR_VISUALS.stray_voltage.keyPoses.hit={imageUrl:'/assets/battle/actors/stray-voltage-hit-v1.webp',footAnchor:[.5,.912]};
ACTOR_VISUALS.stray_voltage.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.stray_voltage.keyPoses.defeat={imageUrl:'/assets/battle/actors/stray-voltage-defeat-v1.webp',footAnchor:[.5,.962]};
ACTOR_VISUALS.stray_voltage.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.dumpster_crawler.keyPoses={attack:{imageUrl:'/assets/battle/actors/dumpster-crawler-attack-v1.webp',footAnchor:[.5,.91]}};
ACTOR_VISUALS.dumpster_crawler.keyPoses.hit={imageUrl:'/assets/battle/actors/dumpster-crawler-hit-v1.webp',footAnchor:[.5,.956]};
ACTOR_VISUALS.dumpster_crawler.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.dumpster_crawler.keyPoses.defeat={imageUrl:'/assets/battle/actors/dumpster-crawler-defeat-v1.webp',footAnchor:[.5,.991]};
ACTOR_VISUALS.dumpster_crawler.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.boombox_brute.keyPoses={attack:{imageUrl:'/assets/battle/actors/boombox-brute-attack-v1.webp',footAnchor:[.5,.982]}};
ACTOR_VISUALS.boombox_brute.keyPoses.hit={imageUrl:'/assets/battle/actors/boombox-brute-hit-v1.webp',footAnchor:[.5,.989]};
ACTOR_VISUALS.boombox_brute.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.boombox_brute.keyPoses.defeat={imageUrl:'/assets/battle/actors/boombox-brute-defeat-v1.webp',footAnchor:[.5,.995]};
ACTOR_VISUALS.boombox_brute.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.manhole_mimic.keyPoses={attack:{imageUrl:'/assets/battle/actors/manhole-mimic-attack-v1.webp',footAnchor:[.5,.97]}};
ACTOR_VISUALS.manhole_mimic.keyPoses.hit={imageUrl:'/assets/battle/actors/manhole-mimic-hit-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.manhole_mimic.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.manhole_mimic.keyPoses.defeat={imageUrl:'/assets/battle/actors/manhole-mimic-defeat-v1.webp',footAnchor:[.5,.994]};
ACTOR_VISUALS.manhole_mimic.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.neon_sentinel.keyPoses={attack:{imageUrl:'/assets/battle/actors/neon-sentinel-attack-v1.webp',footAnchor:[.5,.931]}};
ACTOR_VISUALS.neon_sentinel.keyPoses.hit={imageUrl:'/assets/battle/actors/neon-sentinel-hit-v1.webp',footAnchor:[.5,.992]};
ACTOR_VISUALS.neon_sentinel.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_sentinel.keyPoses.guard={imageUrl:'/assets/battle/actors/neon-sentinel-guard-v1.webp',footAnchor:[.5,.985]};
ACTOR_VISUALS.neon_sentinel.clips.guard={frames:['guard','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_sentinel.keyPoses.cast={imageUrl:'/assets/battle/actors/neon-sentinel-cast-v1.webp',footAnchor:[.5,.986]};
ACTOR_VISUALS.neon_sentinel.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_sentinel.keyPoses.defeat={imageUrl:'/assets/battle/actors/neon-sentinel-defeat-v1.webp',footAnchor:[.5,.976]};
ACTOR_VISUALS.neon_sentinel.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.neon_sentinel.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.chrome_phantom.keyPoses={attack:{imageUrl:'/assets/battle/actors/chrome-phantom-attack-v1.webp',footAnchor:[.5,.945]}};
ACTOR_VISUALS.chrome_phantom.keyPoses.hit={imageUrl:'/assets/battle/actors/chrome-phantom-hit-v1.webp',footAnchor:[.5,.970]};
ACTOR_VISUALS.chrome_phantom.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.chrome_phantom.keyPoses.defeat={imageUrl:'/assets/battle/actors/chrome-phantom-defeat-v1.webp',footAnchor:[.5,.945]};
ACTOR_VISUALS.chrome_phantom.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.chrome_phantom.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.voltage_king.keyPoses={attack:{imageUrl:'/assets/battle/actors/voltage-king-attack-v1.webp',footAnchor:[.5,.960]}};
ACTOR_VISUALS.voltage_king.keyPoses.hit={imageUrl:'/assets/battle/actors/voltage-king-hit-v1.webp',footAnchor:[.5,.979]};
ACTOR_VISUALS.voltage_king.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.voltage_king.keyPoses.defeat={imageUrl:'/assets/battle/actors/voltage-king-defeat-v1.webp',footAnchor:[.5,.961]};
ACTOR_VISUALS.voltage_king.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.voltage_king.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.circuit_breaker.keyPoses={attack:{imageUrl:'/assets/battle/actors/circuit-breaker-attack-v1.webp',footAnchor:[.5,.927]}};
ACTOR_VISUALS.circuit_breaker.keyPoses.hit={imageUrl:'/assets/battle/actors/circuit-breaker-hit-v1.webp',footAnchor:[.5,.925]};
ACTOR_VISUALS.circuit_breaker.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.circuit_breaker.keyPoses.defeat={imageUrl:'/assets/battle/actors/circuit-breaker-defeat-v1.webp',footAnchor:[.5,.955]};
ACTOR_VISUALS.circuit_breaker.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.circuit_breaker.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_yakuza.keyPoses={attack:{imageUrl:'/assets/battle/actors/neon-yakuza-attack-v1.webp',footAnchor:[.5,.986]}};
ACTOR_VISUALS.neon_yakuza.keyPoses.hit={imageUrl:'/assets/battle/actors/neon-yakuza-hit-v1.webp',footAnchor:[.5,.985]};
ACTOR_VISUALS.neon_yakuza.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_yakuza.keyPoses.defeat={imageUrl:'/assets/battle/actors/neon-yakuza-defeat-v1.webp',footAnchor:[.5,.989]};
ACTOR_VISUALS.neon_yakuza.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.neon_yakuza.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.chrome_bouncer.keyPoses={attack:{imageUrl:'/assets/battle/actors/chrome-bouncer-attack-v1.webp',footAnchor:[.5,.976]}};
ACTOR_VISUALS.chrome_bouncer.keyPoses.hit={imageUrl:'/assets/battle/actors/chrome-bouncer-hit-v1.webp',footAnchor:[.5,.990]};
ACTOR_VISUALS.chrome_bouncer.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.chrome_bouncer.keyPoses.defeat={imageUrl:'/assets/battle/actors/chrome-bouncer-defeat-v1.webp',footAnchor:[.5,.992]};
ACTOR_VISUALS.chrome_bouncer.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.chrome_bouncer.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.dj_phantom.keyPoses={attack:{imageUrl:'/assets/battle/actors/dj-phantom-attack-v1.webp',footAnchor:[.5,.998]}};
ACTOR_VISUALS.dj_phantom.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.dj_phantom.keyPoses.hit={imageUrl:'/assets/battle/actors/dj-phantom-hit-v1.webp',footAnchor:[.5,.996],scale:1290/1401};
ACTOR_VISUALS.dj_phantom.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.dj_phantom.keyPoses.defeat={imageUrl:'/assets/battle/actors/dj-phantom-defeat-v1.webp',footAnchor:[.5,.994]};
ACTOR_VISUALS.dj_phantom.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.dj_phantom.keyPoses.cast={imageUrl:'/assets/battle/actors/dj-phantom-cast-v1.webp',footAnchor:[.5,.98],scale:1290/1375};
ACTOR_VISUALS.dj_phantom.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.dj_phantom.keyPoses.blink={imageUrl:'/assets/battle/actors/dj-phantom-blink-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.dj_phantom.clips.idle={frames:['idle','blink'],durationsMs:[4900,100],loop:true,completion:'idle'};
ACTOR_VISUALS.subway_wyrm.keyPoses={attack:{imageUrl:'/assets/battle/actors/subway-wyrm-attack-v1.webp',footAnchor:[.5,.988]}};
ACTOR_VISUALS.subway_wyrm.clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.subway_wyrm.keyPoses.hit={imageUrl:'/assets/battle/actors/subway-wyrm-hit-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.subway_wyrm.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.subway_wyrm.keyPoses.defeat={imageUrl:'/assets/battle/actors/subway-wyrm-defeat-v1.webp',footAnchor:[.5,.944]};
ACTOR_VISUALS.subway_wyrm.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.subway_wyrm.keyPoses.guard={imageUrl:'/assets/battle/actors/subway-wyrm-guard-v1.webp',footAnchor:[.5,.982]};
ACTOR_VISUALS.subway_wyrm.clips.guard={frames:['guard','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.subway_wyrm.keyPoses.cast={imageUrl:'/assets/battle/actors/subway-wyrm-cast-v1.webp',footAnchor:[.5,.993]};
ACTOR_VISUALS.subway_wyrm.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.subway_wyrm.keyPoses.blink={imageUrl:'/assets/battle/actors/subway-wyrm-blink-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.subway_wyrm.clips.idle={frames:['idle','blink'],durationsMs:[6100,120],loop:true,completion:'idle'};
ACTOR_VISUALS.the_billboard.keyPoses={attack:{imageUrl:'/assets/battle/actors/the-billboard-attack-v1.webp',footAnchor:[.5,.952]}};
ACTOR_VISUALS.the_billboard.keyPoses.hit={imageUrl:'/assets/battle/actors/the-billboard-hit-v1.webp',footAnchor:[.5,.973]};
ACTOR_VISUALS.the_billboard.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.the_billboard.keyPoses.guard={imageUrl:'/assets/battle/actors/the-billboard-guard-v1.webp',footAnchor:[.5,.987]};
ACTOR_VISUALS.the_billboard.clips.guard={frames:['guard','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.the_billboard.keyPoses.cast={imageUrl:'/assets/battle/actors/the-billboard-cast-v1.webp',footAnchor:[.5,.976]};
ACTOR_VISUALS.the_billboard.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.the_billboard.keyPoses.defeat={imageUrl:'/assets/battle/actors/the-billboard-defeat-v1.webp',footAnchor:[.5,.973]};
ACTOR_VISUALS.the_billboard.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.the_billboard.keyPoses.blink={imageUrl:'/assets/battle/actors/the-billboard-blink-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.the_billboard.clips.idle={frames:['idle','blink'],durationsMs:[5800,120],loop:true,completion:'idle'};
ACTOR_VISUALS.sewer_slime.keyPoses={attack:{imageUrl:'/assets/battle/actors/sewer-slime-attack-v1.webp',footAnchor:[.5,.93]}};
ACTOR_VISUALS.sewer_slime.keyPoses.hit={imageUrl:'/assets/battle/actors/sewer-slime-hit-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.sewer_slime.clips.hit={frames:['hit','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.sewer_slime.keyPoses.defeat={imageUrl:'/assets/battle/actors/sewer-slime-defeat-v1.webp',footAnchor:[.5,.955]};
ACTOR_VISUALS.sewer_slime.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.sewer_slime.keyPoses.guard={imageUrl:'/assets/battle/actors/sewer-slime-guard-v1.webp',footAnchor:[.5,.875]};
ACTOR_VISUALS.sewer_slime.clips.guard={frames:['guard','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.sewer_slime.keyPoses.cast={imageUrl:'/assets/battle/actors/sewer-slime-cast-v1.webp',footAnchor:[.5,.876]};
ACTOR_VISUALS.sewer_slime.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.sewer_slime.keyPoses.blink={imageUrl:'/assets/battle/actors/sewer-slime-blink-v1.webp',footAnchor:[.5,.94]};
ACTOR_VISUALS.sewer_slime.clips.idle={frames:['idle','blink'],durationsMs:[5400,100],loop:true,completion:'idle'};
ACTOR_VISUALS.neon_wraith.keyPoses={attack:{imageUrl:'/assets/battle/actors/neon-wraith-attack-v2.webp',footAnchor:[.5,.99]}};
ACTOR_VISUALS.neon_wraith.keyPoses.hit={imageUrl:'/assets/battle/actors/neon-wraith-hit-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.neon_wraith.clips.hit={frames:['hit','idle'],durationsMs:[140,80],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_wraith.keyPoses.defeat={imageUrl:'/assets/battle/actors/neon-wraith-defeat-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.neon_wraith.clips.defeat={frames:['defeat'],durationsMs:[280],loop:false,completion:'hold'};
ACTOR_VISUALS.neon_wraith.keyPoses.cast={imageUrl:'/assets/battle/actors/neon-wraith-cast-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.neon_wraith.clips.cast={frames:['cast','idle'],durationsMs:[160,60],loop:false,completion:'idle'};
ACTOR_VISUALS.neon_wraith.keyPoses.blink={imageUrl:'/assets/battle/actors/neon-wraith-blink-v1.webp',footAnchor:[.5,.99]};
ACTOR_VISUALS.neon_wraith.clips.idle={frames:['idle','blink'],durationsMs:[5100,100],loop:true,completion:'idle'};
// Explicit key-pose timelines; these do not represent approved multi-frame animation art.
for(const id of [...HERO_ARCHETYPES.map(id=>`hero-${id}`),'alley_rat','vending_golem','fire_escape_spider','smoke_specter','taxi_ghost','graffiti_imp','neon_junkie','stray_voltage','dumpster_crawler','boombox_brute','manhole_mimic','the_billboard','sewer_slime','neon_wraith']) {
    ACTOR_VISUALS[id].clips.attack={frames:['idle','attack','idle'],durationsMs:[80,160,80],loop:false,completion:'idle'};
}
ACTOR_VISUALS['hero-neon'].keyPoses!.windup={imageUrl:'/assets/battle/actors/street-runner-windup-v1.webp',footAnchor:[.5,.974],scale:1422/1478};
ACTOR_VISUALS['hero-neon'].keyPoses!.recovery={imageUrl:'/assets/battle/actors/street-runner-recovery-v1.webp',footAnchor:[.5,.974],scale:1422/1478};
ACTOR_VISUALS['hero-neon'].clips.attack={frames:['windup','attack','recovery'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.alley_rat.keyPoses!.windup={imageUrl:'/assets/battle/actors/alley-rat-windup-v1.webp',footAnchor:[.5,.908]};
ACTOR_VISUALS.alley_rat.keyPoses!.recovery={imageUrl:'/assets/battle/actors/alley-rat-recovery-v1.webp',footAnchor:[.5,.851]};
ACTOR_VISUALS.alley_rat.clips.attack={frames:['windup','attack','recovery'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.vending_golem.keyPoses!.windup={imageUrl:'/assets/battle/actors/vending-golem-windup-v1.webp',footAnchor:[.5,.937]};
ACTOR_VISUALS.vending_golem.keyPoses!.recovery={imageUrl:'/assets/battle/actors/vending-golem-recovery-v1.webp',footAnchor:[.5,.909],scale:1099/1136};
ACTOR_VISUALS.vending_golem.clips.attack={frames:['windup','attack','recovery'],durationsMs:[80,160,80],loop:false,completion:'idle'};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.windup={imageUrl:'/assets/battle/actors/fire-escape-spider-windup-v1.webp',footAnchor:[.5,.954]};
ACTOR_VISUALS.fire_escape_spider.keyPoses!.recovery={imageUrl:'/assets/battle/actors/fire-escape-spider-recovery-v1.webp',footAnchor:[.5,.910]};
ACTOR_VISUALS.fire_escape_spider.clips.attack={frames:['windup','attack','recovery'],durationsMs:[80,160,80],loop:false,completion:'idle'};
Object.values(ACTOR_VISUALS).forEach(validateActorVisual);
export function resolveAppearance(value: CombatAppearance | undefined, archetype = 'neon'): ActorVisual {
    const base=value && (value.version===1 || value.version===2) && ACTOR_VISUALS[value.actorVisualId]?.id?.startsWith('hero-')
        ? ACTOR_VISUALS[value.actorVisualId] : ACTOR_VISUALS[`hero-${archetype}`] ?? ACTOR_VISUALS['hero-neon'];
    if(value?.version===2 && isPersonalizedCutout(value.idleImageUrl)) {
        // Do not borrow another person's attack or reaction artwork. The personal
        // cutout uses procedural movement until identity-matched poses are available.
        return {...base,id:`${base.id}-personalized`,fallbackImageUrl:value.idleImageUrl,
            atlasUrl:undefined,atlasFrames:undefined,keyPoses:undefined,clips:{},footAnchor:[.5,.99],
            productionStatus:'review',provenance:'Personalized combat sprite; procedural motion.'};
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

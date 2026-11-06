import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
await build({stdin:{contents:`export {useGameStore} from './src/store/gameStore';export * from './src/data/actorVisuals';export {validateActorVisual,isPersonalizedCutout} from './src/core/battleVisualModels';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/combat-appearance.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
const memory=new Map();globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
const {useGameStore:store,appearanceForArchetype,resolveAppearance,normalizeAppearance,validateActorVisual,isPersonalizedCutout}=await import('./.e2e-out/combat-appearance.mjs');
for(const archetype of ['neon','chrome','volt','concrete','smoke']){
 store.getState().initializeRun('appearance');
 const card=store.getState().masterDeck[0];
 const hero={id:'fixture',name:'Fixture',archetype,title:'Test',portraitUrl:'/assets/characters/neon.webp',maxHp:80,maxEnergy:3,startingGold:99,traits:[]};
 const preview=resolveAppearance(appearanceForArchetype(archetype));
 store.setState({ugcPhase:'reveal',generatedCharacter:hero,generatedCards:[card]});store.getState().startGeneratedRun();
 const player=store.getState().player;
 assert.equal(resolveAppearance(player.combatAppearance).fallbackImageUrl,preview.fallbackImageUrl,'preview equals combat actor');
 assert.equal(player.portraitUrl,hero.portraitUrl);assert.equal(player.spriteUrl,undefined);assert.notEqual(preview.fallbackImageUrl,hero.portraitUrl);
 const saved=JSON.parse(memory.get('stt_run'));assert.equal(saved.player.combatAppearance.actorVisualId,`hero-${archetype}`);
 const reload=await import(`./.e2e-out/combat-appearance.mjs?${archetype}`);assert.deepEqual(reload.useGameStore.getState().player.combatAppearance,player.combatAppearance);
 assert.deepEqual(reload.useGameStore.getState().rng.snapshot(),store.getState().rng.snapshot(),'appearance never advances RNG');
}
const legacy=JSON.parse(memory.get('stt_run'));delete legacy.player.combatAppearance;legacy.player.spriteUrl=legacy.player.portraitUrl;memory.set('stt_run',JSON.stringify(legacy));
const migrated=await import('./.e2e-out/combat-appearance.mjs?legacy');assert.equal(migrated.useGameStore.getState().player.combatAppearance.actorVisualId,'hero-neon');assert.match(migrated.useGameStore.getState().recoveryNotice,/Street Runner/);assert.equal(migrated.useGameStore.getState().player.portraitUrl,legacy.player.portraitUrl);
for(const actorVisualId of ['__proto__','constructor','https://bad.example/sprite.png','alley_rat']) assert.equal(resolveAppearance({version:1,actorVisualId}).id,'hero-neon');
console.log('PASS: five archetype preview/start/reload parity, portrait separation, unchanged RNG, legacy notice and invalid registry-key fallback');

// Use real local WebP bytes as a transport fixture, not as evidence of selfie likeness.
const idleImageUrl='data:image/webp;base64,'+(await readFile('public/assets/battle/actors/street-runner-idle-v1.webp')).toString('base64');
const personal={version:2,actorVisualId:'hero-volt',idleImageUrl};
store.getState().initializeRun('personal-appearance');
const initialRng=store.getState().rng.snapshot();
const personalVisual=resolveAppearance(personal);
validateActorVisual(personalVisual);
assert.equal(personalVisual.fallbackImageUrl,idleImageUrl);
assert.equal(personalVisual.keyPoses,undefined,'never substitute shared hero poses');
assert.deepEqual(personalVisual.clips,{});
assert.deepEqual(store.getState().rng.snapshot(),initialRng);
store.setState({ugcPhase:'reveal',generatedCharacter:{id:'personal',name:'Fixture',archetype:'volt',title:'Test',portraitUrl:'/assets/characters/volt.webp',combatAppearance:personal,maxHp:80,maxEnergy:3,startingGold:99,traits:[]},generatedCards:[store.getState().masterDeck[0]]});
store.getState().startGeneratedRun();
assert.deepEqual(store.getState().player.combatAppearance,personal);
const personalReload=await import('./.e2e-out/combat-appearance.mjs?personal');
assert.deepEqual(personalReload.useGameStore.getState().player.combatAppearance,personal,'cutout survives real save/load normalization');
assert.equal(resolveAppearance(personalReload.useGameStore.getState().player.combatAppearance).fallbackImageUrl,personalVisual.fallbackImageUrl);
for(const invalid of ['https://bad.example/image.webp','data:image/svg+xml;base64,PHN2Zz4=','data:image/webp;base64,AAAA','data:image/webp;base64,'+'A'.repeat(512_000)]) {
 assert.equal(isPersonalizedCutout(invalid),false);
 assert.deepEqual(normalizeAppearance({...personal,idleImageUrl:invalid}),{version:1,actorVisualId:'hero-volt'});
}
assert.deepEqual(normalizeAppearance(undefined,'smoke'),{version:1,actorVisualId:'hero-smoke'});
console.log('PASS: personal cutout preview/start/reload identity, no shared pose substitution, bounded WebP transport and invalid-image fallback');

const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh1sAAAAASUVORK5CYII=';
const pngAppearance={...personal,idleImageUrl:png};
assert.equal(isPersonalizedCutout(png),true);
assert.equal(isPersonalizedCutout(png.replace('image/png','image/webp')),false);
assert.equal(isPersonalizedCutout('data:image/png;base64,AAAA'),false);
assert.equal(isPersonalizedCutout(png+'A'.repeat(512_000)),false);
store.setState({ugcPhase:'reveal',generatedCharacter:{...store.getState().generatedCharacter,id:'png-fallback',name:'PNG hero',archetype:'volt',portraitUrl:'/portrait.webp',combatAppearance:pngAppearance,maxHp:80,maxEnergy:3,startingGold:99,traits:[]},generatedCards:[store.getState().masterDeck[0]]});
store.getState().startGeneratedRun();
const pngReload=await import('./.e2e-out/combat-appearance.mjs?png');
assert.deepEqual(pngReload.useGameStore.getState().player.combatAppearance,pngAppearance);
assert.equal(resolveAppearance(pngReload.useGameStore.getState().player.combatAppearance).fallbackImageUrl,png);
console.log('PASS: bounded PNG cutout survives start and reload; invalid MIME and oversized images are rejected');

import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export {useGameStore} from './src/store/gameStore';export * from './src/data/actorVisuals';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/combat-appearance.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
const memory=new Map();globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
const {useGameStore:store,appearanceForArchetype,resolveAppearance}=await import('./.e2e-out/combat-appearance.mjs');
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

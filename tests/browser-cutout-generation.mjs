import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,readFile} from 'node:fs/promises';
await mkdir('tests/.e2e-out',{recursive:true});
await build({entryPoints:['src/store/gameStore.ts'],outfile:'tests/.e2e-out/browser-cutout-generation.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'},plugins:[{name:'controlled-cutout',setup(build){
 build.onResolve({filter:/browserCombatCutout$/},()=>({path:'cutout',namespace:'fixture'}));
 build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const prepareBrowserCombatCutout=(source,signal)=>globalThis.cutout(source,signal);'}));
}}]});
const memory=new Map();globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
const {useGameStore:store}=await import('./.e2e-out/browser-cutout-generation.mjs');
const image='data:image/webp;base64,'+(await readFile('public/assets/battle/actors/street-runner-idle-v1.webp')).toString('base64');
const character={id:'pipeline',name:'Personal hero',archetype:'volt',title:'Test',portraitUrl:'/portrait.webp',maxHp:80,maxEnergy:3,startingGold:99,traits:[]};
let payload={character,cards:[],combatArtwork:{version:1,background:'green',imageUrl:'green-fixture'}};
let fetches=0,cuts=0;
globalThis.fetch=async()=>{fetches++;return {ok:true,json:async()=>structuredClone(payload)};};
globalThis.cutout=async(source,signal)=>{cuts++;assert.equal(source,'green-fixture');assert.equal(signal.aborted,false);return image;};
store.getState().startSelfieCapture();await store.getState().submitSelfie('selfie-fixture');
assert.equal(store.getState().ugcPhase,'reveal');
const appearance=store.getState().generatedCharacter.combatAppearance;
assert.deepEqual(appearance,{version:2,actorVisualId:'hero-volt',idleImageUrl:image});
store.getState().startGeneratedRun();assert.deepEqual(store.getState().player.combatAppearance,appearance);
const reloaded=await import('./.e2e-out/browser-cutout-generation.mjs?reload');assert.deepEqual(reloaded.useGameStore.getState().player.combatAppearance,appearance);
assert.equal(reloaded.useGameStore.getState().player.portraitUrl,character.portraitUrl);
// A failed extraction must return to capture with actionable feedback, never reveal opaque artwork.
store.getState().cancelUgc();store.getState().startSelfieCapture();
globalThis.cutout=async()=>{throw new Error('The generated backdrop is not a clean green screen. Please try again.');};
await store.getState().submitSelfie('selfie-fixture');assert.equal(store.getState().ugcPhase,'capture');assert.match(store.getState().ugcError,/clean green/);assert.equal(store.getState().generatedCharacter,null);
// Cancellation can happen after provider success but before asynchronous decoding finishes.
let finishOld,started,oldSignal;
const ready=new Promise(resolve=>started=resolve);
globalThis.cutout=(source,signal)=>{oldSignal=signal;started();return new Promise(resolve=>finishOld=resolve);};
const old=store.getState().submitSelfie('old-selfie');await ready;
const count=fetches;await store.getState().submitSelfie('duplicate');assert.equal(fetches,count,'duplicate submit ignored while processing');
store.getState().cancelUgc();assert.equal(oldSignal.aborted,true);
store.getState().startSelfieCapture();payload.character={...character,id:'new',name:'New hero'};
globalThis.cutout=async()=>image;
await store.getState().submitSelfie('new-selfie');finishOld(image);await old;
assert.equal(store.getState().ugcPhase,'reveal');assert.equal(store.getState().generatedCharacter.id,'new','late cutout cannot overwrite newer generation');
// Reject unsupported wire contracts before attempting removal.
store.getState().cancelUgc();store.getState().startSelfieCapture();payload.combatArtwork.background='gray';
globalThis.cutout=async()=>{throw new Error('must not run');};await store.getState().submitSelfie('selfie');assert.match(store.getState().ugcError,/Unsupported character background/);
assert.equal(cuts,1);
console.log('PASS: cutout result reaches reveal/run/reload, portrait stays separate, extraction errors are visible, duplicate/cancel/late-result guards hold, invalid contracts fail before processing (mocked decoder/provider)');

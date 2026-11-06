import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,readFile} from 'node:fs/promises';

await mkdir('tests/.e2e-out',{recursive:true});
await build({entryPoints:['src/store/gameStore.ts'],outfile:'tests/.e2e-out/browser-cutout-generation.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'},plugins:[{name:'controlled-composer',setup(build){
    build.onResolve({filter:/composeSelfieHero$/},()=>({path:'compose',namespace:'fixture'}));
    build.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const composeSelfieHero=(source,signal)=>globalThis.compose(source,signal);'}));
}}]});
const memory=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
const {useGameStore:store}=await import('./.e2e-out/browser-cutout-generation.mjs');
const sprite='data:image/webp;base64,'+(await readFile('public/assets/battle/actors/street-runner-idle-v1.webp')).toString('base64');
const photo='data:image/jpeg;base64,AAAA';
let fetches=0;
globalThis.fetch=async()=>{fetches++;throw new Error('Photo flow must never fetch');};
globalThis.compose=async(source,signal)=>{
    assert.equal(source,photo);
    assert.equal(signal.aborted,false);
    return sprite;
};
store.getState().initializeRun('starter');
const starterDeck=store.getState().masterDeck.map(card=>card.id);
store.getState().startSelfieCapture();
await store.getState().submitSelfie(photo);
assert.equal(store.getState().ugcPhase,'reveal');
assert.equal(store.getState().selfieDataUrl,null);
const appearance=store.getState().generatedCharacter.combatAppearance;
assert.deepEqual(appearance,{version:2,actorVisualId:'hero-neon',idleImageUrl:sprite});
store.getState().startGeneratedRun();
assert.deepEqual(store.getState().player.combatAppearance,appearance);
assert.deepEqual(store.getState().masterDeck.map(card=>card.id),starterDeck);
const reloaded=await import('./.e2e-out/browser-cutout-generation.mjs?reload');
assert.deepEqual(reloaded.useGameStore.getState().player.combatAppearance,appearance);
assert.equal(reloaded.useGameStore.getState().player.portraitUrl,photo);

store.getState().startSelfieCapture();
globalThis.compose=async()=>{throw new Error('Decode failed');};
await store.getState().submitSelfie(photo);
assert.equal(store.getState().ugcPhase,'capture');
assert.match(store.getState().ugcError,/Try another JPEG or PNG/);
assert.equal(store.getState().selfieDataUrl,null);

let finishOld,started,oldSignal;
const ready=new Promise(resolve=>started=resolve);
globalThis.compose=(_source,signal)=>{
    oldSignal=signal;
    started();
    return new Promise(resolve=>finishOld=resolve);
};
const old=store.getState().submitSelfie(photo);
await ready;
await store.getState().submitSelfie('duplicate');
assert.equal(store.getState().ugcPhase,'generating');
store.getState().initializeRun('cancelled-photo');
assert.equal(oldSignal.aborted,true);
assert.equal(store.getState().ugcPhase,null);
store.getState().startSelfieCapture();
globalThis.compose=async()=>sprite;
const newPhoto='data:image/jpeg;base64,BBBB';
await store.getState().submitSelfie(newPhoto);
finishOld(sprite);
await old;
assert.equal(store.getState().ugcPhase,'reveal');
assert.equal(store.getState().generatedCharacter.portraitUrl,newPhoto,'late composition cannot overwrite a newer photo');

store.getState().cancelUgc();
store.getState().startSelfieCapture();
globalThis.compose=async()=>assert.fail('Invalid input should never reach the compositor');
await store.getState().submitSelfie('https://example.com/photo.jpg');
assert.equal(store.getState().ugcPhase,'capture');
assert.match(store.getState().ugcError,/Try another JPEG or PNG/);
assert.equal(fetches,0);
console.log('PASS: local selfie reaches reveal/run/reload with the starter deck and zero fetches; invalid input, failures, duplicate submissions and cancellation are handled');

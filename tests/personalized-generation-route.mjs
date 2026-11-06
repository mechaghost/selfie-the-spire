import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
await mkdir('server/node_modules/.cache/personal-route',{recursive:true});
await build({entryPoints:['server/src/routes/character.ts'],outfile:'server/node_modules/.cache/personal-route/route.mjs',bundle:true,packages:'external',platform:'node',format:'esm',plugins:[{name:'provider-fixtures',setup(build){
 build.onResolve({filter:/services\/(gemini|removeCombatBackground)\.js$/},args=>({path:args.path,namespace:'fixture'}));
 build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path.includes('removeCombatBackground') ? 'export const ensureCombatMattingReady=()=>globalThis.provider.ready();' : `export const moderateSelfie=()=>globalThis.provider.moderate();export const analyzeSelfie=async()=>({archetype:'volt',name:'STATIC',title:'Test',traits:[]});export const generateCharacterArt=async()=>'/portrait';export const generateHeroCardMechanics=async()=>({name:'Spark',type:'Attack',cost:1,description:'Deal 4 damage.',target:'Enemy',effects:[{type:'Damage',amount:4,target:'Enemy'}],exhausts:false});export const generateHeroCardArt=async()=>'/card';export const generateCombatCharacterArt=()=>globalThis.provider.cutout();`,loader:'js'}));
}}]});
const previous={key:process.env.GEMINI_API_KEY,flag:process.env.ENABLE_PERSONALIZED_COMBAT};
process.env.GEMINI_API_KEY='fixture-only';
const {characterRoute}=await import('../server/node_modules/.cache/personal-route/route.mjs');
const request=()=>characterRoute.request('/generate-character',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:'data:image/jpeg;base64,fixture'})});
let calls=[];
globalThis.provider={ready:async()=>{calls.push('ready');},moderate:async()=>{calls.push('moderate');return {valid:true};},cutout:async()=>{calls.push('cutout');return 'validated-cutout-fixture';}};
try {
 process.env.ENABLE_PERSONALIZED_COMBAT='1';
 let response=await request();assert.equal(response.status,200);
 let body=await response.json();assert.deepEqual(body.character.combatAppearance,{version:2,actorVisualId:'hero-volt',idleImageUrl:'validated-cutout-fixture'});
 assert.deepEqual(calls,['ready','moderate','cutout']);
 calls=[];delete process.env.ENABLE_PERSONALIZED_COMBAT;
 response=await request();body=await response.json();assert.equal(body.character.combatAppearance,undefined);assert.deepEqual(calls,['moderate']);
 process.env.ENABLE_PERSONALIZED_COMBAT='1';calls=[];
 globalThis.provider.ready=async()=>{calls.push('ready');throw new Error('missing model');};
 response=await request();assert.equal(response.status,500);assert.deepEqual(calls,['ready'],'missing model fails before provider calls');
 globalThis.provider.ready=async()=>{};globalThis.provider.cutout=async()=>{throw new Error('extraction failed');};
 response=await request();assert.equal(response.status,500);assert.equal((await response.json()).character,undefined,'never silently return a stock body after personal extraction fails');
 console.log('PASS: personalized route assembly, disabled rollout, model preflight and honest extraction failure (mocked provider, not live selfie validation)');
} finally {
 for(const [name,value] of [['GEMINI_API_KEY',previous.key],['ENABLE_PERSONALIZED_COMBAT',previous.flag]])if(value===undefined)delete process.env[name];else process.env[name]=value;
 delete globalThis.provider;
}

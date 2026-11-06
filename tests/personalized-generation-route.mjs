import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
await mkdir('server/node_modules/.cache/personal-route',{recursive:true});
await build({entryPoints:['server/src/routes/character.ts'],outfile:'server/node_modules/.cache/personal-route/route.mjs',bundle:true,packages:'external',platform:'node',format:'esm',plugins:[{name:'provider-fixtures',setup(build){
 build.onResolve({filter:/services\/gemini\.js$/},args=>({path:args.path,namespace:'fixture'}));
 build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:`export const moderateSelfie=()=>globalThis.provider.moderate();export const analyzeSelfie=async()=>({archetype:'volt',name:'STATIC',title:'Test',traits:[]});export const generateCharacterArt=async()=>globalThis.provider.portrait?.() ?? '/portrait';export const generateHeroCardMechanics=async()=>({name:'Spark',type:'Attack',cost:1,description:'Deal 4 damage.',target:'Enemy',effects:[{type:'Damage',amount:4,target:'Enemy'}],exhausts:false});export const generateHeroCardArt=async()=>globalThis.provider.cardArt?.() ?? '/card';export const generateCombatCharacterArt=(image,archetype,signal)=>globalThis.provider.cutout(signal);`,loader:'js'}));
}}]});
const previous={key:process.env.GEMINI_API_KEY,flag:process.env.ENABLE_PERSONALIZED_COMBAT};
process.env.GEMINI_API_KEY='fixture-only';
const {characterRoute}=await import('../server/node_modules/.cache/personal-route/route.mjs');
const request=(signal)=>characterRoute.request('/generate-character',{method:'POST',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({image:'data:image/jpeg;base64,fixture'})});
let calls=[];
globalThis.provider={moderate:async()=>{calls.push('moderate');return {valid:true};},cutout:async()=>{calls.push('cutout');return 'validated-cutout-fixture';}};
try {
 process.env.ENABLE_PERSONALIZED_COMBAT='1';
 let response=await request();assert.equal(response.status,200);
 let body=await response.json();assert.equal(body.character.combatAppearance,undefined);assert.deepEqual(body.combatArtwork,{version:1,background:'green',imageUrl:'validated-cutout-fixture'});
 assert.deepEqual(calls,['moderate','cutout']);
 calls=[];delete process.env.ENABLE_PERSONALIZED_COMBAT;
 response=await request();body=await response.json();assert.equal(body.character.combatAppearance,undefined);assert.deepEqual(calls,['moderate']);
 process.env.ENABLE_PERSONALIZED_COMBAT='1';calls=[];
 globalThis.provider.cutout=async()=>{throw new Error('extraction failed');};
 response=await request();assert.equal(response.status,500);assert.equal((await response.json()).character,undefined,'never silently return a stock body after personal extraction fails');
 // Controlled dependency gates prove signature art starts while other images are pending.
 let releasePortrait,releaseCutout,markArtStarted;
 const artStarted=new Promise(resolve=>markArtStarted=resolve);
 globalThis.provider.portrait=()=>new Promise(resolve=>releasePortrait=resolve);
 globalThis.provider.cutout=()=>new Promise(resolve=>releaseCutout=resolve);
 globalThis.provider.cardArt=async()=>{markArtStarted();return '/parallel-card';};
 let completed=false;
 const parallelRequest=request().then(response=>{completed=true;return response;});
 let deadline;
 try {
  await Promise.race([artStarted,new Promise((_,reject)=>deadline=setTimeout(()=>reject(new Error('card art waited for unrelated images')),2000))]);
  assert.equal(completed,false,'response waits for all required artwork');
 } finally {clearTimeout(deadline);releasePortrait?.('/parallel-portrait');releaseCutout?.('parallel-cutout');}
 response=await parallelRequest;assert.equal(response.status,200);
 body=await response.json();assert.equal(body.character.portraitUrl,'/parallel-portrait');
 assert.equal(body.combatArtwork.imageUrl,'parallel-cutout');
 assert.equal(body.cards.find(card=>card.isHeroCard).imageUrl,'/parallel-card');
 console.log('PASS: signature artwork starts before pending portrait/cutout jobs finish; response retains all artifacts');
 let notifyCutout,finishCancelledCutout,capturedSignal;
 const cutoutStarted=new Promise(resolve=>notifyCutout=resolve);
 globalThis.provider.portrait=async()=>'/portrait';
 globalThis.provider.cutout=signal=>{capturedSignal=signal;notifyCutout();return new Promise(resolve=>finishCancelledCutout=resolve);};
 const requestAbort=new AbortController();
 const cancelledRequest=request(requestAbort.signal);
 await cutoutStarted;
 requestAbort.abort();
 response=await cancelledRequest;assert.equal(response.status,408);
 assert.equal(capturedSignal.aborted,true,'request cancellation reaches provider signal');
 assert.match((await response.json()).error,/cancelled/);
 finishCancelledCutout('obsolete');
 console.log('PASS: route cancellation reaches provider job and returns no late character');
 console.log('PASS: personalized route assembly, disabled rollout, browser artwork contract and honest generation failure (mocked provider, not live selfie validation)');
} finally {
 for(const [name,value] of [['GEMINI_API_KEY',previous.key],['ENABLE_PERSONALIZED_COMBAT',previous.flag]])if(value===undefined)delete process.env[name];else process.env[name]=value;
 delete globalThis.provider;
}

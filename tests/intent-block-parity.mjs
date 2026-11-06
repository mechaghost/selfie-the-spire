import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:`export {intentView,describeIntent} from './src/core/intentView';export {useGameStore} from './src/store/gameStore';export {enemies} from './src/data/enemies';export {setCombatMotionMode} from './src/core/combatTiming';`,resolveDir:process.cwd()},outfile:'tests/.e2e-out/intent-block-parity.mjs',bundle:true,platform:'node',format:'esm',define:{'import.meta.env':'{}'}});
const {intentView,describeIntent,useGameStore:store,enemies,setCombatMotionMode}=await import('./.e2e-out/intent-block-parity.mjs');
setCombatMotionMode('off');store.getState().initializeRun('intent-block-parity');
let checked=0;
for(const definition of Object.values(enemies))for(const {intent} of definition.aiPatterns){
 const effects=intent.effects.filter(e=>e.type==='Block' && e.target==='Self');
 if(!effects.length)continue;
 for(const dex of [0,2,5]){
  const statuses=dex?[{id:'dexterity',name:'Dexterity',amount:dex}]:[];
  const enemy={id:'preview-target',templateId:definition.id,name:definition.name,hp:100,maxHp:100,block:0,statuses,intent};
  store.setState({inCombat:true,enemies:[enemy],actionQueue:[],isResolving:false});
  for(const effect of effects){store.getState().queueAction({type:'GAIN_BLOCK',payload:{targetId:enemy.id,amount:effect.amount}});store.getState().resolveQueue();}
  assert.equal(intentView(intent,statuses,[]).block,store.getState().enemies[0].block,`${definition.id} Dexterity ${dex}`);checked++;
 }
}
const mixed={type:'AttackDefend',damage:999,block:999,effects:[{type:'Damage',amount:4,target:'Target'},{type:'Block',amount:3,target:'Self'},{type:'Block',amount:2,target:'Self'}]};
const preview=intentView(mixed,[{id:'dexterity',amount:2}],[]);
assert.equal(preview.previewKind,'current');assert.equal(preview.attack,'4');assert.equal(preview.block,9,'Dexterity applies to each Block effect, not the sum');
assert.equal(intentView({type:'Buff',effects:[{type:'Block',amount:3,target:'Target'}]},[],[]).block,0,'enemy HUD does not claim Block granted to player');
store.getState().initializeRun('cleanup');setCombatMotionMode('normal');
console.log(`PASS: ${checked} roster Block previews match authoritative gains; mixed effects ignore decorative metadata`);

let descriptions=0;
for(const definition of Object.values(enemies))for(const {intent} of definition.aiPatterns){
 const text=describeIntent(intent);
 assert.ok(!/undefined|NaN/.test(text),definition.id);
 assert.equal(text.includes('Damage is shown before Block'),intent.effects.some(effect=>effect.type==='Damage'),definition.id);
 if(!intent.effects.some(effect=>effect.type==='Damage'))assert.ok(!/attack|damage|before Block/i.test(text),definition.id);
 descriptions++;
}
assert.equal(describeIntent(enemies.vending_golem.aiPatterns[0].intent),'Current preview: Gains 10 Block. Gains 2 Spikes.');
assert.match(describeIntent({type:'Attack',effects:[{type:'Damage',amount:8,target:'Target'}]},[{id:'weak',amount:1}],[]),/Deals 6 damage to you/);
assert.equal(describeIntent({type:'Buff',effects:[{type:'Heal',amount:4,target:'Target'}]}),'Current preview: Heals you for 4 HP.');
assert.equal(describeIntent({type:'Buff',effects:[{type:'Heal',amount:4,target:'Self'}]}),'Current preview: Heals 4 HP.');
console.log(`PASS: ${descriptions} roster intent descriptions use damage caveats only for damage and preserve effect recipients`);

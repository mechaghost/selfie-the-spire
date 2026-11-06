import assert from 'node:assert/strict';
import { build } from 'esbuild';
await build({ entryPoints:['src/rendering/battleLayout.ts'], outfile:'tests/.e2e-out/battle-layout.mjs',bundle:true,platform:'node',format:'esm' });
const {battleLayout,hitTest} = await import('./.e2e-out/battle-layout.mjs');
const overlaps = (a,b) => a.x < b.x+b.width && a.x+a.width>b.x && a.y < b.y+b.height && a.y+a.height>b.y;
let cases=0;
for(const width of [280,320,390,430,768,844,1440]) for(const height of [140,156,220,250,288,299,300,500]) for(const count of [1,2,3]) {
 const ids=Array.from({length:count},(_,i)=>`e${i}`);
 const layout=battleLayout(width,height,ids);
 for(const slot of layout.enemies) {
  assert.ok(slot.target.width>=44 && slot.target.height>=44);
  assert.ok(slot.art.x>=0 && slot.art.y>=0 && slot.art.x+slot.art.width<=width && slot.art.y+slot.art.height<=height);
  assert.ok(!overlaps(slot.hud,slot.art),'HUD must clear maximum art envelope');
  assert.ok(!overlaps(slot.art,layout.hero.hud),'enemy art must clear hero HUD');
  assert.ok(!overlaps(slot.art,layout.hero.art),'enemy art must clear hero art');
  assert.ok(!overlaps(slot.target,layout.hero.target));
  for(const other of layout.enemies) if(other.id!==slot.id) assert.ok(!overlaps(slot.target,other.target));
  const bounds={left:17,top:41};
  assert.equal(hitTest(layout,17+slot.target.x+slot.target.width/2,41+slot.target.y+30,bounds,new Set(ids)),slot.id);
  assert.equal(hitTest(layout,17+slot.target.x+slot.target.width/2,41+slot.target.y+30,bounds,new Set(ids.filter(id=>id!==slot.id))),null);
 }
 assert.deepEqual(battleLayout(width,height,ids),layout,'dead actor filtering belongs to input, never slot calculation');
 cases++;
}
for(const width of [320,844,1440]) assert.equal(battleLayout(width,220,['boss'],true).enemies.length,1);
assert.throws(()=>battleLayout(200,200,['x']));
assert.throws(()=>battleLayout(320,220,['x','x']));
console.log(`PASS: ${cases} arena layouts; HUD clearance, minimum targets, nonoverlap, projection and dead-target rejection`);

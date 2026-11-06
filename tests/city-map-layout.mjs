import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:"export * from './src/core/cityMapLayout';export {generateMap} from './src/core/mapGenerator';",resolveDir:process.cwd()},outfile:'tests/.e2e-out/city-map-layout.mjs',bundle:true,platform:'node',format:'esm'});
const {cityMapPoint,cityStreetPath,CITY_MAP_HEIGHT,generateMap}=await import('./.e2e-out/city-map-layout.mjs');
let stops=0,edges=0;
for(let seed=0;seed<100;seed++){
 const map=generateMap(`city-layout-${seed}`),before=JSON.stringify(map),nodes=map.nodes.filter(n=>n.type!=='Start');
 for(const node of nodes){
  const p=cityMapPoint(node);stops++;
  assert.ok(p.y>=29&&p.y+29<=CITY_MAP_HEIGHT);
  for(const width of [280,296,366,406,820,1000]){
   const x=p.x/1000*width;assert.ok(x-27>=0&&x+27<=width,'54px stop stays within map');
   for(const other of nodes.filter(n=>n.y===node.y&&n.id!==node.id))assert.ok(Math.abs(x-cityMapPoint(other).x/1000*width)>=54,'same-street targets never overlap');
  }
  for(const id of node.connections){const target=map.nodes.find(n=>n.id===id);assert.ok(target);const path=cityStreetPath(node,target);assert.match(path,/^M [\d.]+ [\d.]+ V [\d.]+ H [\d.]+ V [\d.]+$/);edges++;}
 }
 assert.equal(JSON.stringify(map),before,'projection cannot change routes/encounters or stored coordinates');
 assert.deepEqual(generateMap(`city-layout-${seed}`),map,'seeded graph remains deterministic');
}
console.log(`PASS: ${stops} city stops across six widths, ${edges} orthogonal routes; target bounds and seeded graph preserved`);

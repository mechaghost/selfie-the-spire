// Validate actual CUA browser measurements and screenshots, not synthetic layouts.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(new URL('../server/package.json',import.meta.url))('sharp');
const directory=process.argv[2] || 'tests/.e2e-out/district-matrix';
const capturedRevision=process.argv[3];
assert.match(capturedRevision || '',/^[a-f0-9]{7,40}$/, 'Pass the revision recorded when screenshots were captured as argument 2');
const rows=JSON.parse(readFileSync(join(directory,'measurements.json'),'utf8'));
const districts=['ocean-drive','wynwood','underpass','club-backlot','rooftop'];
const modes=['1 enemy','2 enemies','3 enemies','Boss'];
const sizes=[[320,568],[390,844],[430,932],[844,390],[768,1024],[1440,900]];
const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.x,b.x)>.5 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>.5;
const inside=(a,b)=>a.x>=b.x-.5 && a.y>=b.y-.5 && a.right<=b.right+.5 && a.bottom<=b.bottom+.5;
const captures=[];
assert.equal(rows.length,120);
for(const district of districts)for(const mode of modes)for(const [width,height] of sizes){
    const matches=rows.filter(r=>r.district===district && r.mode===mode && r.width===width && r.height===height);
    assert.equal(matches.length,1,`${district}/${mode}/${width}: missing or duplicate capture`);
    const r=matches[0];
    assert.equal(r.status,'ready',r.file);
    assert.equal(r.canvasCount,1,r.file);
    assert.equal(r.targets.length,mode==='Boss'?1:Number(mode[0]),r.file);
    assert.equal(r.huds.length,r.targets.length+1,r.file);
    for(const [i,t] of r.targets.entries()){
        assert.ok(t.width>=44 && t.height>=44,`${r.file}: target too small`);
        assert.ok(inside(t,r.stage),`${r.file}: target outside stage`);
        for(const other of [...r.targets.slice(i+1),r.hand,r.controls])assert.ok(!overlap(t,other),`${r.file}: target collision`);
    }
    for(const [i,h] of r.huds.entries()){
        assert.ok(inside(h,r.stage),`${r.file}: HUD outside stage`);
        for(const other of [...r.huds.slice(i+1),r.hand,r.controls])assert.ok(!overlap(h,other),`${r.file}: HUD collision`);
    }
    assert.ok(r.hand.bottom<=height+.5,`${r.file}: hand clipped`);
    const bytes=readFileSync(join(directory,r.file));
    const metadata=await sharp(bytes).metadata();
    assert.equal(metadata.format,'jpeg',r.file);
    assert.equal(metadata.width,width,`${r.file}: screenshot width`);
    assert.equal(metadata.height,height,`${r.file}: screenshot height`);
    captures.push({district,mode,width,height,file:r.file,sha256:createHash('sha256').update(bytes).digest('hex')});
}
writeFileSync('docs/district-capture-matrix.json',JSON.stringify({
    scope:'Local IAB, arena-study fixture, idle scene and ten cards. Not production interaction, physical-device, animation-extrema or contrast certification.',
    capturedRevision,captures:captures.length,
    checks:['complete 5×4×6 matrix','ready renderer and one canvas','44px targets within arena','HUDs within arena','no target-target or HUD-HUD collisions','HUD/targets clear hand and controls','hand within viewport','JPEG dimensions and SHA-256'],
    entries:captures
},null,2)+'\n');
console.log(`PASS: ${captures.length} actual browser captures; coverage, geometry and image dimensions verified`);

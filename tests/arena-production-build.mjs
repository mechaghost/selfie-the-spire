import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';

for(const enabled of [false,true]) {
    const output=`tests/.e2e-out/arena-build-${enabled?'on':'off'}`;
    const env={...process.env,VITE_COMBAT_ARENA:enabled?'1':'0'};
    const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',output,'--emptyOutDir'],{env,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr||result.stdout);
    const files=await readdir(`${output}/assets`);
    const javascript=(await Promise.all(files.filter(file=>file.endsWith('.js')).map(file=>readFile(`${output}/assets/${file}`,'utf8')))).join('\n');
    assert.equal(files.some(file=>/^BattleScene-.*\.js$/.test(file)),enabled,'renderer included only in explicit arena build');
    for(const fixture of ['Review screens · local fixtures','Status HUD','First-turn playtest','Combat art and layout review','Actual WebGL context loss observed','Test browser cutout','Browser extracted character fixture'])
        assert.ok(!javascript.includes(fixture),`development fixture leaked into ${enabled?'arena':'legacy'} production: ${fixture}`);
    assert.equal(javascript.includes('actor-hero-hud'),enabled,'semantic arena HUD is included with renderer');
    console.log(`PASS: production arena ${enabled?'enabled':'disabled'}, renderer/HUD inclusion matches flag and fixtures excluded`);
}

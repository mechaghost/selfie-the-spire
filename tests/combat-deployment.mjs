import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const temporary=await mkdtemp(join(tmpdir(),'combat-deployment-'));
const model=resolve('server/models/u2net.onnx');
const corrupt=join(temporary,'bad.onnx');
await writeFile(corrupt,'invalid model');
function run(args,env,waitForListening=false) {
    return new Promise((resolveResult,reject)=>{
        const child=spawn(process.execPath,args,{cwd:resolve('server'),env:{...process.env,GEMINI_API_KEY:'',PORT:'0',...env},stdio:['ignore','pipe','pipe']});
        let output='',listening=false,ready=false;
        const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Startup test timed out'));},30_000);
        const collect=chunk=>{
            output+=chunk;
            ready=output.includes('Personalized combat matting ready');
            if(output.includes('Server running on')){listening=true;if(waitForListening)child.kill('SIGTERM');}
        };
        child.stdout.on('data',collect);child.stderr.on('data',collect);
        child.on('error',error=>{clearTimeout(timer);reject(error);});
        child.on('close',(code)=>{clearTimeout(timer);resolveResult({code,output,listening,ready});});
    });
}
try {
    const disabled={ENABLE_PERSONALIZED_COMBAT:'0',COMBAT_MATTING_MODEL_PATH:corrupt};
    let result=await run(['scripts/prepare-deployment.mjs'],disabled);
    assert.equal(result.code,0);assert.match(result.output,/skipping/);
    result=await run(['scripts/prepare-deployment.mjs'],{ENABLE_PERSONALIZED_COMBAT:'1',COMBAT_MATTING_MODEL_PATH:model});
    assert.equal(result.code,0);assert.match(result.output,/verified/);
    for(const path of [corrupt,join(temporary,'missing.onnx')]) {
        const env={ENABLE_PERSONALIZED_COMBAT:'1',COMBAT_MATTING_MODEL_PATH:path};
        result=await run(['scripts/prepare-deployment.mjs'],env);
        assert.notEqual(result.code,0);assert.match(result.output,/missing or has an invalid checksum/);
        result=await run(['--import','tsx','src/index.ts'],env);
        assert.notEqual(result.code,0);assert.equal(result.listening,false);assert.equal(result.ready,false);
    }
    result=await run(['--import','tsx','src/index.ts'],disabled,true);
    assert.equal(result.listening,true);assert.equal(result.ready,false);
    result=await run(['--import','tsx','src/index.ts'],{ENABLE_PERSONALIZED_COMBAT:'1',COMBAT_MATTING_MODEL_PATH:model},true);
    assert.equal(result.listening,true);assert.equal(result.ready,true);
    assert.ok(result.output.indexOf('matting ready')<result.output.indexOf('Server running on'));
    console.log('PASS: build skips disabled feature, verifies pinned model, rejects missing/corrupt custom model; server listens only after enabled native matting is ready');
} finally {await rm(temporary,{recursive:true,force:true});}

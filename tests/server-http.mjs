import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {resolve} from 'node:path';
const child=spawn(process.execPath,['--import','tsx','src/index.ts'],{cwd:resolve('server'),env:{...process.env,PORT:'0',ENABLE_PERSONALIZED_COMBAT:'0',GEMINI_API_KEY:''},stdio:['ignore','pipe','pipe']});
const exited=once(child,'exit');
try {
    const origin=await new Promise((resolveOrigin,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('HTTP server did not start')),15000);
        let output='';
        child.stdout.on('data',chunk=>{
            output+=chunk;
            const match=output.match(/Server running on http:\/\/localhost:(\d+)/);
            if(match){clearTimeout(timeout);resolveOrigin(`http://127.0.0.1:${match[1]}`);}
        });
        child.once('exit',()=>{clearTimeout(timeout);reject(new Error('Server exited before listening'));});
        child.once('error',reject);
    });
    let response=await fetch(`${origin}/health`);
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{status:'ok'});
    response=await fetch(origin);
    assert.equal(response.status,200);
    const html=await response.text();assert.match(html,/<div id="root">/);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    const script=html.match(/src="(\/assets\/[^" ]+\.js)"/)[1];
    response=await fetch(origin+script);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);
    response=await fetch(origin+script,{method:'HEAD'});assert.equal(response.status,200);assert.equal(await response.text(),'');
    response=await fetch(`${origin}/api/generate-character`,{method:'OPTIONS',headers:{Origin:'http://localhost:5173','Access-Control-Request-Method':'POST'}});
    assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:5173');
    response=await fetch(`${origin}/api/generate-character`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    assert.equal(response.status,503);assert.match((await response.json()).error,/starter hero/);
    console.log('PASS: real server HTTP health, built HTML/JS/HEAD, security headers, CORS preflight and honest unavailable-provider response');
} finally {child.kill('SIGTERM');await exited;}

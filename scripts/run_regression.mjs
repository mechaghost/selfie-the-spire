import {spawnSync} from 'node:child_process';
import {mkdir,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Run in separate processes: several suites deliberately replace clocks and browser globals.
const output='tests/.e2e-out/regression';
await mkdir(output,{recursive:true});
const tests=(await readdir('tests')).filter(name=>name.endsWith('.mjs') && name!=='server-sharp.mjs').sort();
if(!tests.length)throw new Error('No regression suites discovered');
const git=(...args)=>spawnSync('git',args,{encoding:'utf8'}).stdout?.trim();
const report={revision:git('rev-parse','HEAD'),dirty:!!git('status','--porcelain'),platform:process.platform,arch:process.arch,node:process.version,scope:'Node regression suites, including controlled renderer/provider tests; not real-device or live-provider certification.',results:[]};
for(const test of tests){
 const start=performance.now();
 const result=spawnSync(process.execPath,[`tests/${test}`],{encoding:'utf8',timeout:120_000,maxBuffer:32*1024*1024,env:{...process.env,GEMINI_API_KEY:''}});
 const log=[result.stdout??'',result.stderr??'',result.error?.message??''].join('\n');
 const path=`${output}/${test.replace(/\.mjs$/,'.log')}`;
 await writeFile(path,log);
 const passed=result.status===0 && !result.error;
 report.results.push({test:`tests/${test}`,passed,exitCode:result.status,signal:result.signal,seconds:Number(((performance.now()-start)/1000).toFixed(2)),log:path,sha256:createHash('sha256').update(log).digest('hex')});
 console.log(`${passed?'PASS':'FAIL'} ${test}`);
 if(!passed)console.error(log.slice(-6000));
}
report.passed=report.results.filter(result=>result.passed).length;
report.failed=report.results.length-report.passed;
await writeFile(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(`${report.passed}/${report.results.length} suites passed. Evidence: ${output}/report.json`);
process.exitCode=report.failed?1:0;

import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
const customPath=process.env.COMBAT_MATTING_MODEL_PATH;
const path=customPath || new URL('../models/u2net.onnx',import.meta.url);
const expected='8d10d2f3bb75ae3b6d527c77944fc5e7dcd94b29809d47a739a7a728a912b491';
const valid=data=>createHash('sha256').update(data).digest('hex')===expected;
try {if(valid(await readFile(path))){console.log('U2Net model verified');process.exit(0);}} catch {}
if(customPath)throw new Error('Configured combat matting model is missing or has an invalid checksum; supply the pinned U2Net model');
await mkdir(new URL('../models/',import.meta.url),{recursive:true});
const response=await fetch('https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx',{signal:AbortSignal.timeout(120_000)});
if(!response.ok)throw new Error(`Model download failed: ${response.status}`);
const data=Buffer.from(await response.arrayBuffer());
if(!valid(data))throw new Error('Model checksum mismatch');
const temporary=new URL('../models/u2net.onnx.part',import.meta.url);
await writeFile(temporary,data);await rename(temporary,path);
console.log('U2Net model downloaded and verified');

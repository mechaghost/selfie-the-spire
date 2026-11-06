import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const resolveServer=createRequire(new URL('../server/package.json',import.meta.url));
const {default:sharp}=await import(pathToFileURL(resolveServer.resolve('sharp')).href);
export default sharp;

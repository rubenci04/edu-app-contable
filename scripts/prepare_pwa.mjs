import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url));
const hash = createHash('sha256').update(html).digest('hex').slice(0, 12);
const workerPath = new URL('../dist/sw.js', import.meta.url);
const worker = await readFile(workerPath, 'utf8');
if (!worker.includes('__BUILD_HASH__')) throw new Error('Falta el marcador de versión del service worker.');
await writeFile(workerPath, worker.replaceAll('__BUILD_HASH__', hash));

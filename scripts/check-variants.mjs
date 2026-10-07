// Autocomprobación de las consignas variantes de la Orden de compra: node scripts/check-variants.mjs
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'check-variants-'));
const outfile = join(dir, 'check.mjs');
await build({ entryPoints: [fileURLToPath(new URL('./check-variants.ts', import.meta.url))], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'error' });
await import(pathToFileURL(outfile).href);

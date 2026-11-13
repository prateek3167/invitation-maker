import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = new URL('../.cache/worker-cli/', import.meta.url);
await mkdir(directory, { recursive: true });
const output = new URL('worker.mjs', directory);
await build({ entryPoints: [fileURLToPath(new URL('./export-worker.ts', import.meta.url))], outfile: fileURLToPath(output), bundle: true, platform: 'node', packages: 'external', format: 'esm', target: 'node22', logLevel: 'warning' });
await import(output.href);

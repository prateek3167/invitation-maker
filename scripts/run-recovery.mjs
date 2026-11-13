import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = new URL('../.cache/recovery-cli/', import.meta.url);
await mkdir(directory, { recursive: true });
const output = new URL('recovery.mjs', directory);
await build({ entryPoints: [fileURLToPath(new URL('./recovery.ts', import.meta.url))], outfile: fileURLToPath(output), bundle: true, platform: 'node', packages: 'external', format: 'esm', target: 'node22', logLevel: 'warning' });
await import(output.href);

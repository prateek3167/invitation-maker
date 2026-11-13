import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Compile the typed database CLI with the project's build tool. This avoids
// runtime TypeScript loaders that query unavailable Windows account APIs.
const directory = new URL('../.cache/database-cli/', import.meta.url);
await mkdir(directory, { recursive: true });
const output = new URL('migrate.mjs', directory);
await build({ entryPoints: [fileURLToPath(new URL('./migrate.ts', import.meta.url))], outfile: fileURLToPath(output),
  bundle: true, platform: 'node', packages: 'external', format: 'esm', target: 'node22', logLevel: 'warning' });
await import(output.href);

import nextEnv from '@next/env';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
nextEnv.loadEnvConfig(path.join(root, 'apps/web'));
if (process.env.PUBLIC_DEPLOYMENT === 'true') throw new Error('Local mailbox preview is disabled in public deployments.');
const address = process.argv[2]?.toLowerCase();
if (!address) throw new Error('Usage: npm run mail:preview -- your@email.test (local development only)');
const directory = path.resolve(root, process.env.MAIL_CAPTURE_DIRECTORY || '.data/mailbox');
const files = await readdir(directory).catch(() => []);
let found = 0;
for (const file of files.filter(f => f.endsWith('.json')).sort().reverse()) {
  const mail = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
  if (mail.to?.toLowerCase() !== address) continue;
  console.info(`${mail.createdAt}\n${mail.subject}\n${mail.text}\n`); if (++found === 5) break;
}
if (!found) console.info('No captured message matches this address. Request verification/reset from the account page first.');

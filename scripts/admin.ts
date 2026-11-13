import nextEnv from '@next/env';
import path from 'node:path';
import { getDatabase, workspaceRoot } from '../packages/database/client';
import { promoteAdministrator } from '../packages/database/administration';
nextEnv.loadEnvConfig(path.join(workspaceRoot(), 'apps/web'));
const email = process.argv[2];
if (!email || !email.includes('@')) throw new Error('Usage: npm run admin:promote -- verified-user@example.com');
const db = await getDatabase();
try {
  await promoteAdministrator(db, email);
  console.info('Administrator granted. All previous sessions revoked; sign in with your authenticator.');
} finally { const client = db.$client; if ('close' in client) await client.close(); else await client.end(); }

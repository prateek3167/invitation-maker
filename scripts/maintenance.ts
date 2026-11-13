import nextEnv from '@next/env';
import path from 'node:path';
import { getDatabase, workspaceRoot } from '../packages/database/client';
import { maintainStorage } from '../apps/web/lib/server/storage-maintenance';
nextEnv.loadEnvConfig(path.join(workspaceRoot(), 'apps/web'));
if (!process.env.DATABASE_URL && !process.argv.includes('--offline')) throw new Error('Local embedded maintenance requires a stopped web server and --offline. Production uses network PostgreSQL.');
const db = await getDatabase();
try { console.info(JSON.stringify(await maintainStorage(db, process.argv.includes('--apply')))); }
finally { const client = db.$client; if ('close' in client) await client.close(); else await client.end(); }

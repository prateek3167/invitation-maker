import nextEnv from '@next/env';
import path from 'node:path';
import { getDatabase, workspaceRoot } from '../packages/database/client';
import { runExportJob } from '../apps/web/lib/server/export-worker';
nextEnv.loadEnvConfig(path.join(workspaceRoot(), 'apps/web'));
if (!process.env.DATABASE_URL) throw new Error('The standalone worker requires network PostgreSQL. Local embedded development uses the in-process worker.');
let stopping = false;
process.once('SIGINT', () => { stopping = true; }); process.once('SIGTERM', () => { stopping = true; });
const db = await getDatabase();
try { while (!stopping) { if (!await runExportJob(db)) await new Promise(resolve => setTimeout(resolve, 1000)); } }
finally { const client = db.$client; if ('close' in client) await client.close(); else await client.end(); }

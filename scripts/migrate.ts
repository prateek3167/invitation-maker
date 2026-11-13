import nextEnv from '@next/env';
import path from 'node:path';
import { getDatabase, workspaceRoot } from '../packages/database/client';

nextEnv.loadEnvConfig(path.join(workspaceRoot(), 'apps/web'));
const db = await getDatabase();
try {
  console.info(`Database migrations applied and checksums verified (${process.env.DATABASE_URL ? 'configured PostgreSQL' : 'local embedded PostgreSQL'}).`);
} finally {
  const client = db.$client;
  if ('close' in client) await client.close(); else await client.end();
}

import nextEnv from '@next/env';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { workspaceRoot } from '../packages/database/client';
import { PGlite } from '@electric-sql/pglite';
import { backupKey, captureRecovery, decryptSnapshot, encryptSnapshot, restoreRecovery } from '../packages/database/recovery';
import { mediaDirectory } from '../packages/database/media';
import { exportDirectory } from '../apps/web/lib/server/export-worker';
nextEnv.loadEnvConfig(path.join(workspaceRoot(), 'apps/web'));
if (process.env.DATABASE_URL || process.env.PUBLIC_DEPLOYMENT === 'true') throw new Error('This utility is for offline local PGlite only. Production requires managed PostgreSQL/PITR and synchronized private-storage backups.');
if (!process.argv.includes('--offline')) throw new Error('Stop the local web server first, then pass --offline. Never open the same embedded database from two processes.');
const key = backupKey(process.env.BACKUP_ENCRYPTION_KEY), root = workspaceRoot();
if (process.argv[2] === 'create') {
  const dataDir = path.resolve(root, process.env.LOCAL_DATABASE_PATH || '.data/postgres');
  if (!(await stat(path.join(dataDir, 'PG_VERSION'))).isFile()) throw new Error('An existing offline database is required.');
  // Back up the original engine state without applying any pending migrations first.
  const client = new PGlite(dataDir);
  let snapshot: Buffer;
  try { snapshot = await captureRecovery(client, { media: mediaDirectory(), exports: exportDirectory(), authSecret: await readFile(path.join(root, '.data/local-auth-secret'), 'utf8').catch(error => { if (error.code === 'ENOENT') return undefined; throw error; }) }); }
  finally { await client.close(); }
  const directory = path.join(root, '.data/backups'); await mkdir(directory, { recursive: true, mode: 0o700 });
  const destination = path.join(directory, `${Date.now()}-${randomUUID()}.imbackup`);
  await writeFile(destination, encryptSnapshot(snapshot, key), { flag: 'wx', mode: 0o600 }); console.info(`Encrypted local recovery archive: ${destination}`);
} else if (process.argv[2] === 'restore' && process.argv[3] && process.argv[3] !== '--offline') {
  const source = path.resolve(process.argv[3]); if ((await stat(source)).size > 512_000_000) throw new Error('Archive too large');
  const parent = path.join(root, '.data/restores'); await mkdir(parent, { recursive: true, mode: 0o700 });
  const destination = path.join(parent, `recovery-${randomUUID()}`);
  await restoreRecovery(decryptSnapshot(await readFile(source), key), destination); console.info(`Verified recovery in a new directory: ${destination}. Original application data was not replaced.`);
} else throw new Error('Usage: npm run recovery -- create --offline OR restore ARCHIVE --offline');

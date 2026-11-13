import { PGlite } from '@electric-sql/pglite';
import { drizzle as embeddedDrizzle } from 'drizzle-orm/pglite';
import { drizzle as postgresDrizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import * as schema from './schema';

export type Database = ReturnType<typeof embeddedDrizzle<typeof schema>> | ReturnType<typeof postgresDrizzle<typeof schema>>;
export function workspaceRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === 'web' && path.basename(path.dirname(cwd)) === 'apps' ? path.resolve(cwd, '../..') : cwd;
}
async function migrations(): Promise<{ name: string; sql: string; checksum: string }[]> {
  const dir = path.join(workspaceRoot(), 'packages/database/migrations');
  const names = (await readdir(dir)).filter(n => /^\d+.*\.sql$/.test(n)).sort();
  return Promise.all(names.map(async name => { const sql = await readFile(path.join(dir, name), 'utf8'); return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') }; }));
}
export async function migrateEmbedded(client: PGlite): Promise<void> {
  await client.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const migration of await migrations()) {
    await client.transaction(async tx => {
      const existing = await tx.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name=$1', [migration.name]);
      if (existing.rows[0]) { if (existing.rows[0].checksum !== migration.checksum) throw new Error('An applied migration has changed. Restore its original contents.'); return; }
      await tx.exec(migration.sql);
      await tx.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [migration.name, migration.checksum]);
    });
  }
}
export async function createEmbeddedDatabase(dataDir?: string) {
  const client = new PGlite(dataDir);
  try { await migrateEmbedded(client); } catch (error) { await client.close(); throw error; }
  return { db: embeddedDrizzle(client, { schema }), client };
}
async function migratePostgres(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(744318209)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const m of await migrations()) {
      const result = await client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name=$1', [m.name]);
      if (result.rows[0]) { if (result.rows[0].checksum !== m.checksum) throw new Error('An applied migration has changed.'); continue; }
      await client.query(m.sql); await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [m.name, m.checksum]);
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
type State = { promise?: Promise<Database> };
const state = globalThis as typeof globalThis & { invitationDatabase?: State };
export function getDatabase(): Promise<Database> {
  state.invitationDatabase ??= {};
  if (state.invitationDatabase.promise) return state.invitationDatabase.promise;
  const promise = (async () => {
    if (process.env.PUBLIC_DEPLOYMENT === 'true' && !process.env.DATABASE_URL) throw new Error('A public deployment requires DATABASE_URL. Embedded storage is local-only.');
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000 });
      try { await migratePostgres(pool); } catch (error) { await pool.end(); throw error; }
      return postgresDrizzle(pool, { schema });
    }
    const dataDir = path.resolve(workspaceRoot(), process.env.LOCAL_DATABASE_PATH || '.data/postgres');
    await mkdir(path.dirname(dataDir), { recursive: true });
    return (await createEmbeddedDatabase(dataDir)).db;
  })();
  state.invitationDatabase.promise = promise;
  void promise.catch(() => { if (state.invitationDatabase?.promise === promise) state.invitationDatabase.promise = undefined; });
  return promise;
}

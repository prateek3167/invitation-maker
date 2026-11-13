import { PGlite } from '@electric-sql/pglite';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { migrateEmbedded } from './client';
const magic = Buffer.from('IMBACKUP1');
type RecoveryFile = { bucket: 'media' | 'exports'; name: string; data: string; sha256: string };
type Snapshot = { version: 1; engine: 'pglite-0.5.16'; createdAt: string; database: string; files: RecoveryFile[]; authSecret?: string };
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const validName = (bucket: string, name: string) => bucket === 'media' ? /^[0-9a-f-]{36}\.jpg$/.test(name) : bucket === 'exports' && /^[0-9a-f-]{36}-[0-9a-f-]{36}\.(png|jpg|pdf)$/.test(name);
export function backupKey(value: string | undefined) {
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) throw new Error('Set BACKUP_ENCRYPTION_KEY to a managed 32-byte hexadecimal key; keep it separately from backups.');
  return Buffer.from(value, 'hex');
}
export function encryptSnapshot(bytes: Buffer, key: Buffer) {
  const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, nonce); cipher.setAAD(magic);
  const ciphertext = Buffer.concat([cipher.update(gzipSync(bytes)), cipher.final()]);
  return Buffer.concat([magic, nonce, cipher.getAuthTag(), ciphertext]);
}
export function decryptSnapshot(bytes: Buffer, key: Buffer) {
  if (!bytes.subarray(0, magic.length).equals(magic) || bytes.length > 512_000_000) throw new Error('Invalid recovery archive');
  const offset = magic.length, decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(offset, offset + 12));
  decipher.setAAD(magic); decipher.setAuthTag(bytes.subarray(offset + 12, offset + 28));
  return gunzipSync(Buffer.concat([decipher.update(bytes.subarray(offset + 28)), decipher.final()]), { maxOutputLength: 768_000_000 });
}
export async function captureRecovery(client: PGlite, locations: { media: string; exports: string; authSecret?: string }) {
  const files: RecoveryFile[] = []; let total = 0;
  for (const bucket of ['media', 'exports'] as const) {
    const entries = await readdir(locations[bucket], { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
    for (const entry of entries) {
      if (!validName(bucket, entry.name)) continue;
      if (!entry.isFile() || entry.isSymbolicLink()) throw new Error('Recovery refuses symbolic or non-file media entries.');
      const bytes = await readFile(path.join(locations[bucket], entry.name)); total += bytes.length;
      if (total > 500_000_000) throw new Error('Local recovery archive exceeds 500 MB. Use managed database/storage backup tooling.');
      files.push({ bucket, name: entry.name, data: bytes.toString('base64'), sha256: digest(bytes) });
    }
  }
  const database = Buffer.from(await (await client.dumpDataDir('none')).arrayBuffer());
  const snapshot: Snapshot = { version: 1, engine: 'pglite-0.5.16', createdAt: new Date().toISOString(), database: database.toString('base64'), files, ...(locations.authSecret ? { authSecret: locations.authSecret } : {}) };
  return Buffer.from(JSON.stringify(snapshot));
}
export async function restoreRecovery(bytes: Buffer, target: string) {
  const snapshot = JSON.parse(bytes.toString('utf8')) as Snapshot;
  if (snapshot.version !== 1 || snapshot.engine !== 'pglite-0.5.16' || typeof snapshot.database !== 'string' || !Array.isArray(snapshot.files)) throw new Error('Unsupported recovery format/engine');
  const names = new Set<string>();
  for (const file of snapshot.files) {
    if (!validName(file.bucket, file.name) || typeof file.data !== 'string' || digest(Buffer.from(file.data, 'base64')) !== file.sha256 || names.has(`${file.bucket}/${file.name}`)) throw new Error('Invalid recovery file or checksum');
    names.add(`${file.bucket}/${file.name}`);
  }
  // Never replace an existing database, directory, secret or media file.
  await mkdir(target, { recursive: false, mode: 0o700 });
  for (const bucket of ['media', 'exports']) await mkdir(path.join(target, bucket), { mode: 0o700 });
  for (const file of snapshot.files) await writeFile(path.join(target, file.bucket, file.name), Buffer.from(file.data, 'base64'), { mode: 0o600, flag: 'wx' });
  if (snapshot.authSecret) await writeFile(path.join(target, 'local-auth-secret'), snapshot.authSecret, { mode: 0o600, flag: 'wx' });
  const client = new PGlite({ dataDir: path.join(target, 'postgres'), loadDataDir: new Blob([new Uint8Array(Buffer.from(snapshot.database, 'base64'))]) });
  try { await client.waitReady; await migrateEmbedded(client); await client.query('SELECT 1'); }
  finally { await client.close(); }
  return target;
}

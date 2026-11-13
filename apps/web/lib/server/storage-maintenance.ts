import { lte } from 'drizzle-orm';
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { Database } from '../../../../packages/database/client';
import { assets, exportJobs } from '../../../../packages/database/schema';
import { mediaDirectory } from '../../../../packages/database/media';
import { artifactPath, exportDirectory } from './export-worker';
export async function maintainStorage(db: Database, apply = false, now = new Date()) {
  const jobs = await db.select({ id: exportJobs.id, leaseToken: exportJobs.leaseToken, format: exportJobs.format, expiresAt: exportJobs.expiresAt }).from(exportJobs);
  const media = await db.select({ id: assets.id }).from(assets);
  const retainedExports = new Set(jobs.filter(job => job.expiresAt > now && job.leaseToken).map(job => path.basename(artifactPath(job))));
  const retainedMedia = new Set(media.map(asset => `${asset.id}.jpg`));
  const candidates: string[] = [];
  for (const [directory, retained, pattern] of [
    [mediaDirectory(), retainedMedia, /^[0-9a-f-]{36}\.jpg$/],
    [exportDirectory(), retainedExports, /^[0-9a-f-]{36}-[0-9a-f-]{36}\.(png|jpg|pdf)$/],
  ] as const) {
    const root = path.resolve(directory), entries = await readdir(root, { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
    for (const entry of entries) {
      if (!entry.isFile() || entry.isSymbolicLink() || !pattern.test(entry.name) || retained.has(entry.name)) continue;
      const resolved = path.resolve(root, entry.name); if (path.dirname(resolved) !== root) throw new Error('Unsafe storage maintenance target');
      // Protect newly written files whose database transaction has not committed yet.
      if ((await stat(resolved)).mtimeMs < now.getTime() - 86400000) candidates.push(resolved);
    }
  }
  const expiredJobs = jobs.filter(job => job.expiresAt <= now).length;
  if (apply) {
    await db.delete(exportJobs).where(lte(exportJobs.expiresAt, now));
    for (const file of candidates) await unlink(file).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
  return { applied: apply, expiredJobs, orphanFiles: candidates.length };
}

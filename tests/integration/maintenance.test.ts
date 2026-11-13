import { expect, it } from 'vitest';
import { mkdir, mkdtemp, writeFile, utimes, access, realpath, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createEmbeddedDatabase } from '../../packages/database/client';
import { maintainStorage } from '../../apps/web/lib/server/storage-maintenance';
import { assets, user } from '../../packages/database/schema';
it('previews cleanup and removes only old unreferenced managed files, keeping fresh/live/unrecognized files', async () => {
  await mkdir('.cache', { recursive: true }); const root = await mkdtemp(path.resolve('.cache/maintenance-test-'));
  const priorMedia = process.env.PRIVATE_MEDIA_DIRECTORY, priorExports = process.env.PRIVATE_EXPORT_DIRECTORY;
  process.env.PRIVATE_MEDIA_DIRECTORY = path.join(root, 'media'); process.env.PRIVATE_EXPORT_DIRECTORY = path.join(root, 'exports');
  const database = await createEmbeddedDatabase();
  try {
    await mkdir(process.env.PRIVATE_MEDIA_DIRECTORY); await mkdir(process.env.PRIVATE_EXPORT_DIRECTORY);
    const old = path.join(process.env.PRIVATE_MEDIA_DIRECTORY, `${randomUUID()}.jpg`), fresh = path.join(process.env.PRIVATE_MEDIA_DIRECTORY, `${randomUUID()}.jpg`), unknown = path.join(process.env.PRIVATE_MEDIA_DIRECTORY, 'keep-me.txt'), liveId = randomUUID(), live = path.join(process.env.PRIVATE_MEDIA_DIRECTORY, `${liveId}.jpg`);
    for (const file of [old, fresh, unknown, live]) await writeFile(file, 'fixture');
    const yesterday = new Date(Date.now() - 2 * 86400000); await utimes(old, yesterday, yesterday); await utimes(live, yesterday, yesterday);
    await database.db.insert(user).values({ id: 'maintenance', name: 'Maintenance', email: 'maintenance@example.test' });
    await database.db.insert(assets).values({ id: liveId, ownerId: 'maintenance', sourceHash: 'a'.repeat(64), contentHash: 'b'.repeat(64), byteSize: 7, width: 1, height: 1 });
    expect(await maintainStorage(database.db)).toMatchObject({ applied: false, orphanFiles: 1 }); await access(old);
    expect(await maintainStorage(database.db, true)).toMatchObject({ applied: true, orphanFiles: 1 }); await expect(access(old)).rejects.toThrow();
    for (const file of [fresh, unknown, live]) await access(file);
  } finally {
    await database.client.close(); if (priorMedia === undefined) delete process.env.PRIVATE_MEDIA_DIRECTORY; else process.env.PRIVATE_MEDIA_DIRECTORY = priorMedia;
    if (priorExports === undefined) delete process.env.PRIVATE_EXPORT_DIRECTORY; else process.env.PRIVATE_EXPORT_DIRECTORY = priorExports;
    const actual = await realpath(root), parent = await realpath('.cache'); if (path.dirname(actual) !== parent || !path.basename(actual).startsWith('maintenance-test-')) throw new Error('Unsafe fixture cleanup');
    await rm(actual, { recursive: true, force: true });
  }
});

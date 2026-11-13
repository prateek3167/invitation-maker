import { expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createEmbeddedDatabase } from '../../packages/database/client';
import { user } from '../../packages/database/schema';
import { createCard, createProject, getCard } from '../../packages/database/projects';
import { createInvitation, templates } from '../../packages/editor-core/document';
import { captureRecovery, encryptSnapshot, decryptSnapshot, restoreRecovery } from '../../packages/database/recovery';
import { hydratePhoto } from '../../packages/database/media';
import { renderSvg } from '../../packages/template-engine/render';
it('restores an encrypted database/photo/secret backup into a fresh directory and rejects tampering/overwrite', async () => {
  await mkdir('.cache', { recursive: true }); const directory = await mkdtemp(path.resolve('.cache/recovery-test-')), previous = process.env.PRIVATE_MEDIA_DIRECTORY;
  const source = await createEmbeddedDatabase(); let restored: Awaited<ReturnType<typeof createEmbeddedDatabase>> | undefined;
  try {
    const media = path.join(directory, 'media'), exports = path.join(directory, 'exports'); process.env.PRIVATE_MEDIA_DIRECTORY = media;
    await source.db.insert(user).values({ id: 'recovery-owner', name: 'Recovery', email: 'recovery@example.test' });
    const event = await createProject(source.db, 'recovery-owner', { title: 'Recover me', occasion: 'Wedding' });
    const document = createInvitation(templates.find(t => t.photo)!);
    const photo = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#ccaabb' } }).jpeg().toBuffer(); document.photo = { data: `data:image/jpeg;base64,${photo.toString('base64')}`, x: 10, y: 60, zoom: 1.4 };
    const card = await createCard(source.db, 'recovery-owner', event.id, { document }), expected = renderSvg(await hydratePhoto(source.db, 'recovery-owner', card));
    const snapshot = await captureRecovery(source.client, { media, exports, authSecret: 'test-only-recovered-auth-secret' }), key = randomBytes(32), encrypted = encryptSnapshot(snapshot, key);
    expect(encrypted.includes(Buffer.from('recovery@example.test'))).toBe(false);
    expect(() => decryptSnapshot(encrypted, randomBytes(32))).toThrow();
    const tampered = Buffer.from(encrypted); tampered[tampered.length - 1] ^= 1; expect(() => decryptSnapshot(tampered, key)).toThrow();
    const destination = path.join(directory, 'restored'); await restoreRecovery(decryptSnapshot(encrypted, key), destination);
    await expect(restoreRecovery(snapshot, destination)).rejects.toThrow();
    restored = await createEmbeddedDatabase(path.join(destination, 'postgres')); process.env.PRIVATE_MEDIA_DIRECTORY = path.join(destination, 'media');
    expect(renderSvg(await hydratePhoto(restored.db, 'recovery-owner', await getCard(restored.db, 'recovery-owner', card.id)))).toBe(expected);
    expect(await readFile(path.join(destination, 'local-auth-secret'), 'utf8')).toBe('test-only-recovered-auth-secret');
  } finally {
    await restored?.client.close(); await source.client.close(); if (previous === undefined) delete process.env.PRIVATE_MEDIA_DIRECTORY; else process.env.PRIVATE_MEDIA_DIRECTORY = previous;
    const actual = await realpath(directory), parent = await realpath('.cache');
    if (path.dirname(actual) !== parent || !path.basename(actual).startsWith('recovery-test-')) throw new Error('Unsafe recovery fixture cleanup');
    await rm(actual, { recursive: true, force: true });
  }
});

import { beforeAll, afterAll, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createEmbeddedDatabase } from '../../packages/database/client';
import { exportJobs, user } from '../../packages/database/schema';
import { createCard, createProject, updateCard } from '../../packages/database/projects';
import { claimExport, enqueueExport, finishExport, getExport } from '../../packages/database/exports';
let database: Awaited<ReturnType<typeof createEmbeddedDatabase>>;
beforeAll(async () => {
  database = await createEmbeddedDatabase();
  await database.db.insert(user).values([{ id: 'export-owner', name: 'Owner', email: 'export@example.test' }, { id: 'export-other', name: 'Other', email: 'export-other@example.test' }]);
});
afterAll(async () => { await database?.client.close(); });
it('captures immutable content, binds idempotency and isolates job ownership', async () => {
  const project = await createProject(database.db, 'export-owner', { title: 'Export event', occasion: 'Wedding' });
  const card = await createCard(database.db, 'export-owner', project.id, { templateId: '3' });
  const input = { invitationId: card.id, revision: card.revision, format: 'png', idempotencyKey: randomUUID() };
  const job = await enqueueExport(database.db, 'export-owner', input);
  expect((await enqueueExport(database.db, 'export-owner', input)).id).toBe(job.id);
  await expect(enqueueExport(database.db, 'export-owner', { ...input, format: 'jpg' })).rejects.toMatchObject({ status: 409 });
  await expect(getExport(database.db, 'export-other', job.id)).rejects.toMatchObject({ status: 404 });
  await expect(enqueueExport(database.db, 'export-other', { ...input, idempotencyKey: randomUUID() })).rejects.toMatchObject({ status: 404 });
  await updateCard(database.db, 'export-owner', card.id, { ...card, fields: { ...card.fields, host: 'New wording after export' } });
  const original = await getExport(database.db, 'export-owner', job.id); expect(original.snapshotSvg).toBe(job.snapshotSvg); expect(original.snapshotSvg).not.toContain('New wording after export');
  await expect(enqueueExport(database.db, 'export-owner', { ...input, idempotencyKey: randomUUID() })).rejects.toMatchObject({ status: 409 });
});
it('claims once, recovers a crashed lease and prevents stale workers completing another lease', async () => {
  const first = await claimExport(database.db); expect(first?.attempts).toBe(1);
  expect(await claimExport(database.db)).toBeNull();
  await database.db.update(exportJobs).set({ leaseUntil: new Date(Date.now() - 1000) }).where(eq(exportJobs.id, first!.id));
  const retry = await claimExport(database.db); expect(retry?.attempts).toBe(2); expect(retry?.leaseToken).not.toBe(first?.leaseToken);
  expect(await finishExport(database.db, first!, true)).toBe(false);
  expect(await finishExport(database.db, retry!, false)).toBe(true);
  await database.db.update(exportJobs).set({ availableAt: new Date(Date.now() - 1000) }).where(eq(exportJobs.id, first!.id));
  const third = await claimExport(database.db); expect(third?.attempts).toBe(3);
  await database.db.update(exportJobs).set({ leaseUntil: new Date(Date.now() - 1000) }).where(eq(exportJobs.id, first!.id));
  expect(await claimExport(database.db)).toBeNull();
  expect((await getExport(database.db, 'export-owner', first!.id)).status).toBe('failed');
});

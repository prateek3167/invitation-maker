import { and, asc, eq, gt, inArray, lt, lte, or, sql } from 'drizzle-orm';
import { createHash, randomUUID } from 'node:crypto';
import type { Database } from './client';
import { exportJobs, user } from './schema';
import { DomainError, getCard, uuid } from './projects';
import { hydratePhoto } from './media';
import { contentIssues, documentTemplate, presets } from '../editor-core/document';
import { renderSvg } from '../template-engine/render';
import { serverArtwork } from '../template-engine/artwork';
export const rendererVersion = 'svg-browser-v1';
export const digest = (text: string) => createHash('sha256').update(text).digest('hex');
export type ExportJob = typeof exportJobs.$inferSelect;
const publicColumns = { id: exportJobs.id, invitationId: exportJobs.invitationId, revision: exportJobs.revision, format: exportJobs.format, status: exportJobs.status, attempts: exportJobs.attempts, errorCode: exportJobs.errorCode, createdAt: exportJobs.createdAt, expiresAt: exportJobs.expiresAt };
export function publicJob(job: ExportJob) {
  return { id: job.id, invitationId: job.invitationId, revision: job.revision, format: job.format, status: job.status, attempts: job.attempts, errorCode: job.errorCode, createdAt: job.createdAt, expiresAt: job.expiresAt };
}
export async function getExport(db: Database, owner: string, id: string) {
  uuid(id);
  const [job] = await db.select().from(exportJobs).where(and(eq(exportJobs.id, id), eq(exportJobs.ownerId, owner), gt(exportJobs.expiresAt, new Date())));
  if (!job) throw new DomainError(404, 'EXPORT_NOT_FOUND', 'This export is unavailable or expired.');
  return job;
}
export async function enqueueExport(db: Database, owner: string, input: Record<string, unknown>) {
  const invitationId = uuid(input.invitationId), idempotencyKey = uuid(input.idempotencyKey);
  if (!['png', 'jpg', 'pdf'].includes(String(input.format)) || !Number.isInteger(input.revision)) throw new DomainError(400, 'INVALID_EXPORT', 'Choose a format and saved revision.');
  const [existing] = await db.select().from(exportJobs).where(and(eq(exportJobs.ownerId, owner), eq(exportJobs.idempotencyKey, idempotencyKey)));
  const sameRequest = (job: ExportJob) => {
    if (job.invitationId !== invitationId || job.revision !== input.revision || job.format !== input.format) throw new DomainError(409, 'IDEMPOTENCY_CONFLICT', 'Use a new request key for a different export.');
    if (job.expiresAt <= new Date()) throw new DomainError(410, 'EXPORT_EXPIRED', 'Use a new request key to create a fresh export.');
    return job;
  };
  if (existing) return sameRequest(existing);
  const document = await hydratePhoto(db, owner, await getCard(db, owner, invitationId));
  if (document.revision !== input.revision) throw new DomainError(409, 'CONFLICT', 'Save the latest invitation before exporting.');
  const issues = contentIssues(document); if (issues.length) throw new DomainError(422, 'INCOMPLETE_INVITATION', issues.join(' '));
  const snapshotSvg = renderSvg(document, await serverArtwork(document)), dimensions = presets[document.format];
  return db.transaction(async tx => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, owner)).for('update');
    const [duplicate] = await tx.select().from(exportJobs).where(and(eq(exportJobs.ownerId, owner), eq(exportJobs.idempotencyKey, idempotencyKey)));
    if (duplicate) return sameRequest(duplicate);
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::integer` }).from(exportJobs).where(and(eq(exportJobs.ownerId, owner), gt(exportJobs.expiresAt, new Date())));
    if (count >= 50) throw new DomainError(422, 'EXPORT_QUOTA', 'Your seven-day export allowance is full. Use a browser download or wait for old exports to expire.');
    const [job] = await tx.insert(exportJobs).values({ id: randomUUID(), ownerId: owner, invitationId, revision: document.revision, idempotencyKey, format: String(input.format), title: document.title, width: dimensions.width, height: dimensions.height, snapshotSvg, snapshotHash: digest(snapshotSvg), rendererVersion, templateHash: digest(JSON.stringify(documentTemplate(document))), expiresAt: new Date(Date.now() + 7 * 86400000) }).returning();
    return job;
  });
}
export async function claimExport(db: Database, now = new Date()) {
  return db.transaction(async tx => {
    // Exhausted crashed leases become terminal rather than remaining stuck forever.
    await tx.update(exportJobs).set({ status: 'failed', errorCode: 'RETRY_LIMIT', leaseToken: null, leaseUntil: null }).where(and(eq(exportJobs.status, 'processing'), lte(exportJobs.leaseUntil, now), eq(exportJobs.attempts, 3)));
    const [job] = await tx.select().from(exportJobs).where(and(gt(exportJobs.expiresAt, now), lt(exportJobs.attempts, 3), or(and(eq(exportJobs.status, 'queued'), lte(exportJobs.availableAt, now)), and(eq(exportJobs.status, 'processing'), lte(exportJobs.leaseUntil, now))))).orderBy(asc(exportJobs.createdAt)).limit(1).for('update', { skipLocked: true });
    if (!job) return null;
    const [claimed] = await tx.update(exportJobs).set({ status: 'processing', attempts: job.attempts + 1, leaseToken: randomUUID(), leaseUntil: new Date(now.getTime() + 120000), errorCode: null }).where(eq(exportJobs.id, job.id)).returning();
    return claimed;
  });
}
export async function finishExport(db: Database, job: ExportJob, success: boolean) {
  const now = new Date();
  const [row] = await db.update(exportJobs).set(success ? { status: 'completed', completedAt: now, leaseUntil: null } : { status: job.attempts < 3 ? 'queued' : 'failed', errorCode: 'RENDER_FAILED', availableAt: new Date(now.getTime() + job.attempts * 1000), leaseUntil: null, leaseToken: null }).where(and(eq(exportJobs.id, job.id), eq(exportJobs.status, 'processing'), eq(exportJobs.leaseToken, job.leaseToken!), gt(exportJobs.leaseUntil, now))).returning();
  return Boolean(row);
}
export async function listExports(db: Database, owner: string) {
  return db.select(publicColumns).from(exportJobs).where(and(eq(exportJobs.ownerId, owner), gt(exportJobs.expiresAt, new Date()), inArray(exportJobs.status, ['queued', 'processing', 'completed', 'failed']))).orderBy(asc(exportJobs.createdAt)).limit(50);
}
export async function getExportStatus(db: Database, owner: string, id: string) {
  uuid(id);
  const [job] = await db.select(publicColumns).from(exportJobs).where(and(eq(exportJobs.id, id), eq(exportJobs.ownerId, owner), gt(exportJobs.expiresAt, new Date())));
  if (!job) throw new DomainError(404, 'EXPORT_NOT_FOUND', 'This export is unavailable or expired.');
  return job;
}

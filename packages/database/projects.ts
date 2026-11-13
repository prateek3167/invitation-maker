import { and, count, desc, eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { createInvitation, documentTemplate, occasions, validateInvitation, type Invitation } from '../editor-core/document';
import type { Database } from './client';
import { audit, invitations, projects, user, type SharedDetails } from './schema';
import { DomainError } from './errors';
import { storeDocumentPhotos } from './media';
import { approvedTemplate, templateFingerprint } from './templates';
export { DomainError } from './errors';

const missing = () => new DomainError(404, 'NOT_FOUND', 'That project or invitation is not available.');
const conflict = () => new DomainError(409, 'CONFLICT', 'This item changed. Refresh it before saving again.');
export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new DomainError(400, 'INVALID_ID', 'A valid UUID is required.');
  return value;
}
function title(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) throw new DomainError(400, 'VALIDATION_ERROR', 'Use a title between 1 and 120 characters.');
  return value.trim();
}
function shared(value: unknown): SharedDetails {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new DomainError(400, 'VALIDATION_ERROR', 'Shared details must be an object.');
  const result: SharedDetails = {};
  for (const [key, text] of Object.entries(value)) {
    if (!['host', 'partner', 'venue', 'message'].includes(key) || typeof text !== 'string' || text.length > (key === 'host' || key === 'partner' ? 40 : key === 'message' ? 180 : 120)) throw new DomainError(400, 'VALIDATION_ERROR', 'Invalid shared event details.');
    if (text.trim()) result[key as keyof SharedDetails] = text;
  }
  return result;
}
export function safeDocument(value: unknown): Invitation {
  try { validateInvitation(value); } catch (error) { throw new DomainError(400, 'VALIDATION_ERROR', error instanceof Error ? error.message : 'Invalid invitation.'); }
  uuid(value.id);
  // Persist only domain fields, never client-supplied ownership or unknown properties.
  return { schemaVersion: 1, id: value.id, templateId: value.templateId, title: value.title,
    revision: value.revision, createdAt: value.createdAt, updatedAt: value.updatedAt,
    fields: { host: value.fields.host, partner: value.fields.partner, heading: value.fields.heading, date: value.fields.date, time: value.fields.time, venue: value.fields.venue, message: value.fields.message },
    palette: [...value.palette], font: value.font, format: value.format,
    photo: value.photo ? { data: value.photo.data, x: value.photo.x, y: value.photo.y, zoom: value.photo.zoom } : null,
    ...(value.portraits ? { portraits: { bride: value.portraits.bride ? { data:value.portraits.bride.data,x:value.portraits.bride.x,y:value.portraits.bride.y,zoom:value.portraits.bride.zoom } : null, groom: value.portraits.groom ? {data:value.portraits.groom.data,x:value.portraits.groom.x,y:value.portraits.groom.y,zoom:value.portraits.groom.zoom} : null } } : {}),
    ...(value.templateSnapshot ? { templateSnapshot: structuredClone(value.templateSnapshot) } : {}) };
}
export async function listProjects(db: Database, ownerId: string) {
  return db.select({ id: projects.id, title: projects.title, occasion: projects.occasion, sharedDetails: projects.sharedDetails, revision: projects.revision, updatedAt: projects.updatedAt,
    cardCount: count(invitations.id) }).from(projects).leftJoin(invitations, eq(invitations.projectId, projects.id))
    .where(eq(projects.ownerId, ownerId)).groupBy(projects.id).orderBy(desc(projects.updatedAt)).limit(100);
}
export async function createProject(db: Database, ownerId: string, input: Record<string, unknown>) {
  const name = title(input.title);
  if (typeof input.occasion !== 'string' || !occasions.includes(input.occasion)) throw new DomainError(400, 'VALIDATION_ERROR', 'Choose a supported occasion.');
  const details = shared(input.sharedDetails ?? {});
  const occasion = input.occasion;
  return db.transaction(async tx => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, ownerId)).for('update');
    const [{ total }] = await tx.select({ total: count() }).from(projects).where(eq(projects.ownerId, ownerId));
    if (total >= 100) throw new DomainError(422, 'PROJECT_LIMIT', 'This account has reached the 100-project limit.');
    const [project] = await tx.insert(projects).values({ ownerId, title: name, occasion, sharedDetails: details }).returning();
    await tx.insert(audit).values({ actorId: ownerId, action: 'project.created', resourceId: project.id });
    return project;
  });
}
export async function getProject(db: Database, ownerId: string, id: string) {
  uuid(id);
  const [project] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));
  if (!project) throw missing();
  const cards = await db.select({ document: invitations.document }).from(invitations).where(eq(invitations.projectId, id)).orderBy(desc(invitations.updatedAt));
  return { ...project, invitations: cards.map(c => c.document) };
}
export async function updateProject(db: Database, ownerId: string, id: string, input: Record<string, unknown>) {
  uuid(id);
  if (!Number.isSafeInteger(input.revision) || (input.revision as number) < 0 || (input.revision as number) > 2147483646) throw new DomainError(400, 'VALIDATION_ERROR', 'A supported expected revision is required.');
  const patch: { title?: string; sharedDetails?: SharedDetails; updatedAt: Date; revision: number } = { updatedAt: new Date(), revision: (input.revision as number) + 1 };
  if (input.title !== undefined) patch.title = title(input.title);
  if (input.sharedDetails !== undefined) patch.sharedDetails = shared(input.sharedDetails);
  const [updated] = await db.update(projects).set(patch).where(and(eq(projects.id, id), eq(projects.ownerId, ownerId), eq(projects.revision, input.revision as number))).returning();
  if (!updated) { await getProject(db, ownerId, id); throw conflict(); }
  return updated;
}
export async function removeProject(db: Database, ownerId: string, id: string) {
  uuid(id);
  await db.transaction(async tx => {
    const [deleted] = await tx.delete(projects).where(and(eq(projects.id, id), eq(projects.ownerId, ownerId))).returning();
    if (!deleted) throw missing();
    await tx.insert(audit).values({ actorId: ownerId, action: 'project.deleted', resourceId: id });
  });
}
export async function createCard(db: Database, ownerId: string, projectId: string, input: Record<string, unknown>) {
  uuid(projectId);
  const source = input.document === undefined ? undefined : safeDocument(input.document);
  if (source) {
    const approved = await approvedTemplate(db, source.templateId);
    if (templateFingerprint(documentTemplate(source)) !== templateFingerprint(approved)) throw new DomainError(400, 'INVALID_TEMPLATE', 'The template snapshot differs from its published definition.');
    source.templateSnapshot = approved;
  }
  const selectedTemplate = source ? undefined : await approvedTemplate(db, String(input.templateId));
  if (source?.photo || source?.portraits) { await getProject(db, ownerId, projectId); await storeDocumentPhotos(db,ownerId,source); }
  return db.transaction(async tx => {
    // Lock the parent to serialize quota checks, inserts and deletion for this event.
    const [project] = await tx.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId))).for('update');
    if (!project) throw missing();
    const [{ total }] = await tx.select({ total: count() }).from(invitations).where(eq(invitations.projectId, projectId));
    if (total >= 20) throw new DomainError(422, 'CARD_LIMIT', 'An event can contain up to 20 invitations.');
    let document: Invitation;
    if (input.document !== undefined) {
      // An explicit device-draft copy always receives a new server identity.
      document = { ...source!, id: randomUUID(), revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    } else {
      document = createInvitation(selectedTemplate!, randomUUID());
      document.fields = { ...document.fields, ...project.sharedDetails };
      document.revision = 1;
    }
    await tx.insert(invitations).values({ id: document.id, projectId, document, revision: 1 });
    await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
    await tx.insert(audit).values({ actorId: ownerId, action: input.document ? 'invitation.copied' : 'invitation.created', resourceId: document.id });
    return document;
  });
}
function ownedProjects(ownerId: string, db: Database) { return db.select({ id: projects.id }).from(projects).where(eq(projects.ownerId, ownerId)); }
export async function getCard(db: Database, ownerId: string, id: string) {
  uuid(id);
  const [card] = await db.select().from(invitations).where(and(eq(invitations.id, id), inArray(invitations.projectId, ownedProjects(ownerId, db))));
  if (!card) throw missing();
  return card.document;
}
export async function updateCard(db: Database, ownerId: string, id: string, value: unknown) {
  uuid(id); const document = safeDocument(value);
  if (document.id !== id || document.revision < 1) throw new DomainError(400, 'VALIDATION_ERROR', 'Document identity or revision does not match.');
  const existing = await getCard(db, ownerId, id);
  if (existing.templateId !== document.templateId) throw new DomainError(400, 'VALIDATION_ERROR', 'The template of an existing invitation cannot be changed.');
  if (templateFingerprint(documentTemplate(existing)) !== templateFingerprint(documentTemplate(document))) throw new DomainError(400, 'INVALID_TEMPLATE', 'An invitation keeps its immutable template version.');
  await storeDocumentPhotos(db,ownerId,document);
  const saved = { ...document, revision: document.revision + 1, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
  const [row] = await db.update(invitations).set({ document: saved, revision: saved.revision, updatedAt: new Date() }).where(and(eq(invitations.id, id), eq(invitations.revision, document.revision), inArray(invitations.projectId, ownedProjects(ownerId, db)))).returning();
  if (!row) { await getCard(db, ownerId, id); throw conflict(); }
  return row.document;
}
export async function removeCard(db: Database, ownerId: string, id: string) {
  uuid(id);
  await db.transaction(async tx => {
    const [removed] = await tx.delete(invitations).where(and(eq(invitations.id, id), inArray(invitations.projectId, ownedProjects(ownerId, db)))).returning();
    if (!removed) throw missing();
    await tx.insert(audit).values({ actorId: ownerId, action: 'invitation.deleted', resourceId: id });
  });
}

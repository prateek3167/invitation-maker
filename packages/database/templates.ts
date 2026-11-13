import { and, desc, eq, sql } from 'drizzle-orm';
import { randomUUID, createHash } from 'node:crypto';
import type { Database } from './client';
import { audit, templateVersions, templatePublications, user } from './schema';
import { DomainError } from './errors';
import { templates, validateTemplate, type Template } from '../editor-core/document';
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export async function publishedTemplates(db: Database) {
  const rows = await db.select({ definition: templateVersions.definition }).from(templatePublications).innerJoin(templateVersions, eq(templateVersions.id, templatePublications.versionId));
  return [...templates, ...rows.map(row => row.definition)];
}
export async function approvedTemplate(db: Database, id: string) {
  const builtIn = templates.find(template => template.id === id); if (builtIn) return builtIn;
  const [row] = await db.select({ definition: templateVersions.definition }).from(templatePublications).innerJoin(templateVersions, eq(templateVersions.id, templatePublications.versionId)).where(eq(templateVersions.id, id));
  if (!row) throw new DomainError(400, 'TEMPLATE_UNAVAILABLE', 'Choose a currently published template.');
  return row.definition;
}
export async function createTemplateVersion(db: Database, actor: string, input: Record<string, unknown>) {
  const raw = input.definition;
  try { validateTemplate(raw); } catch (error) { throw new DomainError(400, 'INVALID_TEMPLATE', error instanceof Error ? error.message : 'Invalid template.'); }
  if (typeof input.licenseNote !== 'string' || input.licenseNote.trim().length < 10 || input.licenseNote.length > 2000) throw new DomainError(400, 'LICENSE_REQUIRED', 'Record source, author and commercial-use rights before publishing.');
  if (input.familyId !== undefined && (typeof input.familyId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.familyId))) throw new DomainError(400, 'INVALID_TEMPLATE_FAMILY', 'Choose a valid existing family or omit the family for a new design.');
  const familyId = input.familyId as string | undefined || randomUUID(), id = randomUUID();
  const definition: Template = { id, name: raw.name.trim(), occasion: raw.occasion, style: raw.style, photo: raw.photo, layout: raw.layout, palette: [...raw.palette], fields: { host: raw.fields.host, partner: raw.fields.partner, heading: raw.fields.heading, date: raw.fields.date, time: raw.fields.time, venue: raw.fields.venue, message: raw.fields.message }, ...(raw.royal ? {royal:structuredClone(raw.royal)} : {}) };
  return db.transaction(async tx => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, actor)).for('update');
    // Serialize families even when different administrators create versions.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${familyId}))`);
    const [prior] = await tx.select().from(templateVersions).where(eq(templateVersions.familyId, familyId)).orderBy(desc(templateVersions.version)).limit(1);
    const [row] = await tx.insert(templateVersions).values({ id, familyId, version: (prior?.version || 0) + 1, definition, contentHash: hash(definition), licenseNote: input.licenseNote as string, createdBy: actor }).returning();
    await tx.insert(audit).values({ actorId: actor, action: 'template.version_created', resourceId: id }); return row;
  });
}
export async function publishTemplate(db: Database, actor: string, id: string, publish: boolean) {
  const [version] = await db.select().from(templateVersions).where(eq(templateVersions.id, id));
  if (!version) throw new DomainError(404, 'TEMPLATE_NOT_FOUND', 'Template version not found.');
  return db.transaction(async tx => {
    if (publish) await tx.insert(templatePublications).values({ familyId: version.familyId, versionId: id }).onConflictDoUpdate({ target: templatePublications.familyId, set: { versionId: id, updatedAt: new Date() } });
    else await tx.delete(templatePublications).where(and(eq(templatePublications.familyId, version.familyId), eq(templatePublications.versionId, id)));
    await tx.insert(audit).values({ actorId: actor, action: publish ? 'template.published' : 'template.unpublished', resourceId: id });
    return version;
  });
}
export function templateFingerprint(template: Template) { return hash(template); }

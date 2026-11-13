import { desc, eq } from 'drizzle-orm';
import { getDatabase } from '../../../../../../../packages/database/client';
import { templateVersions, templatePublications } from '../../../../../../../packages/database/schema';
import { createTemplateVersion, publishTemplate } from '../../../../../../../packages/database/templates';
import { uuid } from '../../../../../../../packages/database/projects';
import { administrator } from '@/lib/server/admin';
import { body, endpoint } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  await administrator(request);
  const db = await getDatabase();
  const rows = await db.select({ version: templateVersions, publishedId: templatePublications.versionId }).from(templateVersions).leftJoin(templatePublications, eq(templateVersions.familyId, templatePublications.familyId)).orderBy(desc(templateVersions.createdAt)).limit(200);
  return Response.json({ versions: rows.map(row => ({ ...row.version, published: row.publishedId === row.version.id })) });
});
export const POST = endpoint(async request => {
  const actor = await administrator(request), input = await body(request, 20000);
  return Response.json({ version: await createTemplateVersion(await getDatabase(), actor, input) }, { status: 201 });
});
export const PATCH = endpoint(async request => {
  const actor = await administrator(request), input = await body(request, 2000);
  const version = await publishTemplate(await getDatabase(), actor, uuid(input.id), input.publish === true);
  return Response.json({ version });
});

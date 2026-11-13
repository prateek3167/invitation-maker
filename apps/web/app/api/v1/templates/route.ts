import { endpoint } from '@/lib/server/http';
import { getDatabase } from '../../../../../../packages/database/client';
import { publishedTemplates } from '../../../../../../packages/database/templates';
import { DomainError } from '../../../../../../packages/database/projects';
export const GET = endpoint(async request => {
  const query = new URL(request.url).searchParams;
  const page = Number(query.get('page') || 1), pageSize = Number(query.get('pageSize') || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new DomainError(400, 'VALIDATION_ERROR', 'Use a positive page and pageSize between 1 and 50.');
  const search = (query.get('q') || '').slice(0, 120).trim().toLowerCase(), occasion = query.get('occasion') || '', photo = query.get('photo') || '';
  const all = (await publishedTemplates(await getDatabase())).filter(t => (!search || `${t.name} ${t.occasion} ${t.style}`.toLowerCase().includes(search)) && (!occasion || t.occasion === occasion) && (!photo || t.photo === (photo === 'yes')));
  return Response.json({ templates: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize });
});
export const dynamic = 'force-dynamic';

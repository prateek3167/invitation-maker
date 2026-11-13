import { readFile } from 'node:fs/promises';
import { getDatabase } from '../../../../../../../../packages/database/client';
import { getExport } from '../../../../../../../../packages/database/exports';
import { DomainError } from '../../../../../../../../packages/database/projects';
import { endpoint, viewer } from '@/lib/server/http';
import { artifactPath } from '@/lib/server/export-worker';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request), id = new URL(request.url).pathname.split('/').at(-2)!;
  const job = await getExport(await getDatabase(), owner, id);
  if (job.status !== 'completed') throw new DomainError(409, 'EXPORT_NOT_READY', 'This export is not ready yet.');
  const bytes = await readFile(artifactPath(job));
  const name = job.title.replace(/[^a-z0-9 -]/gi, '').trim().slice(0, 70) || 'invitation';
  return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': job.format === 'pdf' ? 'application/pdf' : job.format === 'jpg' ? 'image/jpeg' : 'image/png', 'Content-Disposition': `attachment; filename="${name}.${job.format}"` } });
});

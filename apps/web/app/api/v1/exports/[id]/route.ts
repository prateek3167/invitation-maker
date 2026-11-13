import { getDatabase } from '../../../../../../../packages/database/client';
import { getExportStatus } from '../../../../../../../packages/database/exports';
import { endpoint, viewer } from '@/lib/server/http';
import { kickLocalExports } from '@/lib/server/export-worker';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request), id = new URL(request.url).pathname.split('/').at(-1)!; kickLocalExports();
  return Response.json({ export: await getExportStatus(await getDatabase(), owner, id) });
});

import { getDatabase } from '../../../../../../packages/database/client';
import { enqueueExport, listExports, publicJob } from '../../../../../../packages/database/exports';
import { body, endpoint, viewer } from '@/lib/server/http';
import { kickLocalExports } from '@/lib/server/export-worker';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request); kickLocalExports();
  return Response.json({ exports: await listExports(await getDatabase(), owner) });
});
export const POST = endpoint(async request => {
  const owner = await viewer(request), input = await body(request, 2000);
  const job = await enqueueExport(await getDatabase(), owner, input); kickLocalExports();
  return Response.json({ export: publicJob(job) }, { status: 202 });
});

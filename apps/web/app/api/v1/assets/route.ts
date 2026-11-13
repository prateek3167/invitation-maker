import { getDatabase } from '../../../../../../packages/database/client';
import { deleteUnusedPhotos } from '../../../../../../packages/database/media';
import { endpoint, viewer } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export const DELETE = endpoint(async request => {
  const owner = await viewer(request);
  return Response.json({ deleted: await deleteUnusedPhotos(await getDatabase(), owner) });
});

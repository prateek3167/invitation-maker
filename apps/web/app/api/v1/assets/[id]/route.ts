import { getDatabase } from '../../../../../../../packages/database/client';
import { readAsset } from '../../../../../../../packages/database/media';
import { endpoint, viewer } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request), id = new URL(request.url).pathname.split('/').at(-1)!;
  const { bytes } = await readAsset(await getDatabase(), owner, id);
  return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': 'inline; filename="photo.jpg"' } });
});

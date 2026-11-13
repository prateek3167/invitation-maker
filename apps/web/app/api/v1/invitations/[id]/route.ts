import { body, endpoint, viewer } from '@/lib/server/http';
import { getDatabase } from '../../../../../../../packages/database/client';
import { getCard, removeCard, updateCard } from '../../../../../../../packages/database/projects';
import { hydratePhoto } from '../../../../../../../packages/database/media';
export const dynamic = 'force-dynamic';
const id = (request: Request) => new URL(request.url).pathname.split('/').at(-1)!;
export const GET = endpoint(async request => {
  const owner = await viewer(request), db = await getDatabase();
  return Response.json({ invitation: await hydratePhoto(db, owner, await getCard(db, owner, id(request))) });
});
export const PUT = endpoint(async request => {
  const owner = await viewer(request); const input = await body(request);
  const db = await getDatabase();
  return Response.json({ invitation: await hydratePhoto(db, owner, await updateCard(db, owner, id(request), input.document)) });
});
export const DELETE = endpoint(async request => { await removeCard(await getDatabase(), await viewer(request), id(request)); return new Response(null, { status: 204 }); });

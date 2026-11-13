import { body, endpoint, viewer } from '@/lib/server/http';
import { getDatabase } from '../../../../../../../../packages/database/client';
import { createCard } from '../../../../../../../../packages/database/projects';
import { hydratePhoto } from '../../../../../../../../packages/database/media';
export const dynamic = 'force-dynamic';
export const POST = endpoint(async request => {
  const owner = await viewer(request); const input = await body(request);
  const id = new URL(request.url).pathname.split('/').at(-2)!;
  const db = await getDatabase();
  return Response.json({ invitation: await hydratePhoto(db, owner, await createCard(db, owner, id, input)) }, { status: 201 });
});

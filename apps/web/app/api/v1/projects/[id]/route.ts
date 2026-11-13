import { body, endpoint, viewer } from '@/lib/server/http';
import { getDatabase } from '../../../../../../../packages/database/client';
import { getProject, removeProject, updateProject } from '../../../../../../../packages/database/projects';
import { hydratePhoto } from '../../../../../../../packages/database/media';
export const dynamic = 'force-dynamic';
// IDs are extracted from the URL so the shared wrapper can enforce origin/error policy.
const id = (request: Request) => new URL(request.url).pathname.split('/').at(-1)!;
export const GET = endpoint(async request => {
  const owner = await viewer(request), db = await getDatabase(), project = await getProject(db, owner, id(request));
  const cards = []; for (const card of project.invitations) cards.push(await hydratePhoto(db, owner, card));
  return Response.json({ project: { ...project, invitations: cards } });
});
export const PATCH = endpoint(async request => {
  const owner = await viewer(request); const input = await body(request, 10000);
  return Response.json({ project: await updateProject(await getDatabase(), owner, id(request), input) });
});
export const DELETE = endpoint(async request => { await removeProject(await getDatabase(), await viewer(request), id(request)); return new Response(null, { status: 204 }); });

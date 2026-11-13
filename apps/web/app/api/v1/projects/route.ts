import { body, endpoint, viewer } from '@/lib/server/http';
import { getDatabase } from '../../../../../../packages/database/client';
import { createProject, listProjects } from '../../../../../../packages/database/projects';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => Response.json({ projects: await listProjects(await getDatabase(), await viewer(request)) }));
export const POST = endpoint(async request => {
  const owner = await viewer(request); const input = await body(request, 10000);
  return Response.json({ project: await createProject(await getDatabase(), owner, input) }, { status: 201 });
});

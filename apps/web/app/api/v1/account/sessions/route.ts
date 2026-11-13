import { and, eq, gt } from 'drizzle-orm';
import { getDatabase } from '../../../../../../../packages/database/client';
import { session } from '../../../../../../../packages/database/schema';
import { DomainError } from '../../../../../../../packages/database/projects';
import { getAuth } from '@/lib/server/auth';
import { body, endpoint, viewer } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request), db = await getDatabase();
  const current = await (await getAuth()).api.getSession({ headers: request.headers });
  const rows = await db.select({ id: session.id, createdAt: session.createdAt, expiresAt: session.expiresAt, userAgent: session.userAgent }).from(session).where(and(eq(session.userId, owner), gt(session.expiresAt, new Date()))).limit(100);
  return Response.json({ sessions: rows.map(row => ({ ...row, current: row.id === current?.session.id })) });
});
export const DELETE = endpoint(async request => {
  const owner = await viewer(request), input = await body(request, 1000);
  if (typeof input.id !== 'string' || input.id.length > 200) throw new DomainError(400, 'INVALID_SESSION', 'Choose a session to revoke.');
  const db = await getDatabase();
  await db.delete(session).where(and(eq(session.id, input.id), eq(session.userId, owner)));
  return new Response(null, { status: 204 });
});

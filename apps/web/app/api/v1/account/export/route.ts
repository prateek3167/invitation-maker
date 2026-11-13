import { eq } from 'drizzle-orm';
import { getDatabase } from '../../../../../../../packages/database/client';
import { user, projects, invitations } from '../../../../../../../packages/database/schema';
import { hydratePhoto } from '../../../../../../../packages/database/media';
import { endpoint, viewer } from '@/lib/server/http';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const owner = await viewer(request), db = await getDatabase();
  const [profile] = await db.select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }).from(user).where(eq(user.id, owner));
  const events = await db.select().from(projects).where(eq(projects.ownerId, owner));
  // NDJSON streams one card at a time instead of materializing all embedded photos.
  const stream = new ReadableStream({ async start(controller) {
    const emit = (value: unknown) => controller.enqueue(new TextEncoder().encode(JSON.stringify(value) + '\n'));
    try {
      emit({ type: 'profile', data: profile });
      for (const event of events) {
        emit({ type: 'project', data: event });
        const ids = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.projectId, event.id));
        for (const { id } of ids) {
          const [card] = await db.select({ document: invitations.document }).from(invitations).where(eq(invitations.id, id));
          if (card) emit({ type: 'invitation', projectId: event.id, data: await hydratePhoto(db, owner, card.document) });
        }
      }
      controller.close();
    } catch { controller.error(new Error('Account export interrupted. Please retry.')); }
  } });
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Content-Disposition': 'attachment; filename="invitation-maker-account.ndjson"' } });
});

import { eq } from 'drizzle-orm';
import { getDatabase } from '../../../../packages/database/client';
import { user } from '../../../../packages/database/schema';
import { DomainError } from '../../../../packages/database/projects';
import { viewer } from './http';
export async function administrator(request: Request) {
  const id = await viewer(request), db = await getDatabase();
  const [row] = await db.select({ role: user.role, mfa: user.twoFactorEnabled }).from(user).where(eq(user.id, id));
  if (row?.role !== 'admin' || !row.mfa) throw new DomainError(403, 'ADMIN_REQUIRED', 'A verified administrator with an authenticator is required.');
  return id;
}

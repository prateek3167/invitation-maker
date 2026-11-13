import { and, eq } from 'drizzle-orm';
import type { Database } from './client';
import { session, user } from './schema';
import { DomainError } from './projects';

export async function promoteAdministrator(db: Database, email: string) {
  return db.transaction(async tx => {
    const [promoted] = await tx.update(user).set({ role: 'admin', updatedAt: new Date() }).where(and(eq(user.email, email.trim().toLowerCase()), eq(user.emailVerified, true), eq(user.twoFactorEnabled, true))).returning();
    if (!promoted) throw new DomainError(422, 'ADMIN_SECURITY_REQUIRED', 'Administrator must have verified email and an enabled authenticator.');
    // Pre-enrollment/password-only sessions must never inherit elevated access.
    await tx.delete(session).where(eq(session.userId, promoted.id));
    return promoted.id;
  });
}

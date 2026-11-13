import { endpoint } from '@/lib/server/http';
import { getAuth } from '@/lib/server/auth';
import { mailReady } from '@/lib/server/mail';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async request => {
  const auth = await getAuth(); const session = await auth.api.getSession({ headers: request.headers });
  return Response.json({ user: session ? { id: session.user.id, name: session.user.name, email: session.user.email, emailVerified: session.user.emailVerified, role: session.user.role, twoFactorEnabled: session.user.twoFactorEnabled } : null,
    capabilities: { emailPassword: mailReady(), google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), emailRecovery: mailReady(), emailCapture: process.env.PUBLIC_DEPLOYMENT !== 'true' && !process.env.SMTP_URL, database: process.env.DATABASE_URL ? 'postgresql' : 'embedded-local' } });
});

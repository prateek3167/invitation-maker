import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getDatabase, workspaceRoot, type Database } from '../../../../packages/database/client';
import * as schema from '../../../../packages/database/schema';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { mailReady, sendMail, type TransactionalMessage } from './mail';

export function appOrigin(): string {
  const origin = new URL(process.env.PUBLIC_APP_URL || 'http://127.0.0.1:3000');
  if (process.env.PUBLIC_DEPLOYMENT === 'true' && origin.protocol !== 'https:') throw new Error('Public deployments require an HTTPS PUBLIC_APP_URL.');
  return origin.origin;
}
async function secret(): Promise<string> {
  if (process.env.BETTER_AUTH_SECRET) {
    if (process.env.BETTER_AUTH_SECRET.length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
    return process.env.BETTER_AUTH_SECRET;
  }
  if (process.env.PUBLIC_DEPLOYMENT === 'true') throw new Error('Public deployments require a managed BETTER_AUTH_SECRET.');
  const file = path.join(workspaceRoot(), '.data/local-auth-secret');
  await mkdir(path.dirname(file), { recursive: true });
  try { await writeFile(file, randomBytes(48).toString('base64url'), { mode: 0o600, flag: 'wx' }); }
  catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error; }
  return readFile(file, 'utf8');
}
export function createAuth(db: Database, key: string, origin: string, deliver: (message: TransactionalMessage) => Promise<void> = sendMail) {
  return betterAuth({
    appName: 'Invitation Maker', baseURL: origin, basePath: '/api/auth', secret: key,
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } }, deleteUser: { enabled: true } },
    emailAndPassword: { enabled: mailReady(), minPasswordLength: 12, maxPasswordLength: 128, requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true, resetPasswordTokenExpiresIn: 1800,
      sendResetPassword: async ({ user, url }) => deliver({ to: user.email, subject: 'Reset your Invitation Maker password', text: `Reset your password within 30 minutes:\n${url}\n\nIf you did not request this, ignore this message.` }),
    },
    emailVerification: { sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: true, expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) => deliver({ to: user.email, subject: 'Verify your Invitation Maker email', text: `Verify your email within one hour:\n${url}\n\nIf you did not request this, ignore this message.` }),
    },
    plugins: [twoFactor({ issuer: 'Invitation Maker' })],
    socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
      google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
    } : {},
    trustedOrigins: [origin],
    account: { accountLinking: { enabled: false } },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, freshAge: 300 },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 100, customRules: {
      '/sign-in/email': { window: 60, max: 10 }, '/sign-up/email': { window: 60, max: 10 },
      '/request-password-reset': { window: 60, max: 5 }, '/send-verification-email': { window: 60, max: 5 },
    } },
    advanced: { ipAddress: { ipAddressHeaders: [] }, useSecureCookies: new URL(origin).protocol === 'https:' },
  });
}
type Auth = ReturnType<typeof createAuth>;
const cache = globalThis as typeof globalThis & { invitationAuth?: Promise<Auth> };
export function getAuth(): Promise<Auth> {
  if (cache.invitationAuth) return cache.invitationAuth;
  const promise = Promise.all([getDatabase(), secret()]).then(([db, key]) => createAuth(db, key, appOrigin()));
  cache.invitationAuth = promise;
  void promise.catch(() => { if (cache.invitationAuth === promise) cache.invitationAuth = undefined; });
  return promise;
}

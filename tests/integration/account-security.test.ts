import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { createEmbeddedDatabase } from '../../packages/database/client';
import { createAuth } from '../../apps/web/lib/server/auth';
import { promoteAdministrator } from '../../packages/database/administration';
import { session, user, verification } from '../../packages/database/schema';
import * as authModule from '../../apps/web/lib/server/auth';
import * as databaseModule from '../../packages/database/client';
import { administrator } from '../../apps/web/lib/server/admin';

let database: Awaited<ReturnType<typeof createEmbeddedDatabase>>;
const messages: { to: string; text: string; subject: string }[] = [];
const origin = 'http://127.0.0.1:3005', email = 'security@example.test', password = 'Security test passphrase 123!';
let auth: ReturnType<typeof createAuth>;
let cookie = '';
const cookies = (response: Response) => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const link = (subject: string) => messages.filter(message => message.subject.includes(subject)).at(-1)!.text.match(/https?:\/\/\S+/)![0];
const post = (endpoint: string, body: unknown, withCookie = cookie) => auth.handler(new Request(`${origin}/api/auth/${endpoint}`, { method: 'POST', headers: { origin, 'content-type': 'application/json', cookie: withCookie }, body: JSON.stringify(body) }));
function totp(uri: string) {
  const secret = new URL(uri).searchParams.get('secret')!, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = ''; for (const char of secret.replace(/=+$/, '')) bits += alphabet.indexOf(char).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g)!.map(byte => parseInt(byte, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', key).update(counter).digest(), offset = digest[19] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}
beforeAll(async () => {
  database = await createEmbeddedDatabase();
  auth = createAuth(database.db, 'security-tests-only-long-secret-key-at-least-32-characters', origin, async message => { messages.push(message); });
  vi.spyOn(authModule, 'getAuth').mockResolvedValue(auth);
  vi.spyOn(databaseModule, 'getDatabase').mockResolvedValue(database.db);
});
afterAll(async () => { vi.restoreAllMocks(); await database?.client.close(); });

it('requires verified email; replay cannot create a new authenticated session', async () => {
  expect((await post('sign-up/email', { name: 'Security', email, password, role: 'admin' })).status).toBe(200);
  expect((await post('sign-in/email', { email, password })).status).toBe(403);
  const verified = await auth.handler(new Request(link('Verify'))); cookie = cookies(verified);
  expect(cookie).toContain('session_token');
  const replay = await auth.handler(new Request(link('Verify')));
  expect(cookies(replay)).not.toContain('session_token');
  const info = await auth.api.getSession({ headers: new Headers({ cookie }) });
  expect(info?.user.emailVerified).toBe(true); expect(info?.user.role).toBe('user');
  const elevate = await post('update-user', { name: 'Security', role: 'admin', twoFactorEnabled: true });
  expect(elevate.status).toBe(400);
  const unchanged = await auth.api.getSession({ headers: new Headers({ cookie }) });
  expect(unchanged?.user.role).toBe('user'); expect(unchanged?.user.twoFactorEnabled).toBe(false);
  await expect(promoteAdministrator(database.db, email)).rejects.toMatchObject({ code: 'ADMIN_SECURITY_REQUIRED' });
  await expect(administrator(new Request(origin, { headers: { cookie } }))).rejects.toMatchObject({ status: 403 });
});

it('uses one-use password reset tokens, expires them and revokes every old session', async () => {
  const reset = await post('request-password-reset', { email, redirectTo: '/account/reset-password' }); expect(reset.status).toBe(200);
  const redirect = await auth.handler(new Request(link('Reset')));
  const token = new URL(redirect.headers.get('location')!, origin).searchParams.get('token'); expect(token).toBeTruthy();
  const newPassword = password + ' changed';
  expect((await post('reset-password', { token, newPassword })).status).toBe(200);
  expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
  expect((await post('reset-password', { token, newPassword: password })).status).toBe(400);
  expect((await post('sign-in/email', { email, password }, '')).status).toBe(401);
  const signed = await post('sign-in/email', { email, password: newPassword }, ''); expect(signed.status).toBe(200); cookie = cookies(signed);
  await post('request-password-reset', { email });
  const expiredLink = link('Reset'), expiredToken = new URL(expiredLink).pathname.split('/').at(-1)!;
  await database.db.update(verification).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(verification.identifier, `reset-password:${expiredToken}`));
  expect((await post('reset-password', { token: expiredToken, newPassword: password })).status).toBe(400);
  const unknown = await post('request-password-reset', { email: 'nobody@example.test' }); expect(unknown.status).toBe(200);
});

it('enrolls MFA, blocks password-only access, consumes backup codes and promotes safely', async () => {
  const setupResponse = await post('two-factor/enable', { password: password + ' changed' }); expect(setupResponse.status).toBe(200);
  const setup = await setupResponse.json(); expect(setup.backupCodes.length).toBeGreaterThan(0);
  const confirm = await post('two-factor/verify-totp', { code: totp(setup.totpURI) }); expect(confirm.status).toBe(200);
  cookie = cookies(confirm) || cookie;
  const info = await auth.api.getSession({ headers: new Headers({ cookie }) }); expect(info?.user.twoFactorEnabled).toBe(true);
  await promoteAdministrator(database.db, email);
  expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
  const login = await post('sign-in/email', { email, password: password + ' changed' }, '');
  expect(await login.json()).toMatchObject({ twoFactorRedirect: true }); const challenge = cookies(login);
  expect(await auth.api.getSession({ headers: new Headers({ cookie: challenge }) })).toBeNull();
  await expect(administrator(new Request(origin, { headers: { cookie: challenge } }))).rejects.toMatchObject({ status: 401 });
  const accepted = await post('two-factor/verify-backup-code', { code: setup.backupCodes[0], trustDevice: false }, challenge); expect(accepted.status).toBe(200);
  const admin = await auth.api.getSession({ headers: new Headers({ cookie: cookies(accepted) }) }); expect(admin?.user.role).toBe('admin');
  expect(await administrator(new Request(origin, { headers: { cookie: cookies(accepted) } }))).toBe(admin?.user.id);
  const again = await post('sign-in/email', { email, password: password + ' changed' }, '');
  const reused = await post('two-factor/verify-backup-code', { code: setup.backupCodes[0] }, cookies(again)); expect(reused.status).toBe(401);
  const wrong = await post('two-factor/verify-totp', { code: '000000' }, cookies(again)); expect(wrong.status).toBe(401);
  const [row] = await database.db.select().from(user).where(eq(user.email, email)); expect(row.twoFactorEnabled).toBe(true);
  const active = await database.db.select().from(session).where(eq(session.userId, row.id)); expect(active.length).toBe(1);
});

// Test-runner-only provisioning into its fresh, disposable database. No application backdoor.
import { writeFile } from 'node:fs/promises';
import { createEmbeddedDatabase } from '../packages/database/client';
import { createAuth } from '../apps/web/lib/server/auth';
import { promoteAdministrator } from '../packages/database/administration';
import { authenticatorCode } from '../tests/e2e/helpers/totp';
if (process.env.PUBLIC_DEPLOYMENT !== 'false' || !process.env.E2E_FIXTURE_FILE || !process.env.LOCAL_DATABASE_PATH?.includes('e2e-db-')) throw new Error('Fixtures require the owned browser-test environment.');
const origin = 'http://127.0.0.1:3005', database = await createEmbeddedDatabase(process.env.LOCAL_DATABASE_PATH);
try {
  const email = 'e2e-publisher@example.test', password = process.env.E2E_ADMIN_PASSWORD!;
  let verificationLink = '';
  const auth = createAuth(database.db, process.env.BETTER_AUTH_SECRET!, origin, async message => { verificationLink = message.text.match(/https?:\/\/\S+/)![0]; });
  const headers = { origin, 'content-type': 'application/json' };
  const signup = await auth.handler(new Request(`${origin}/api/auth/sign-up/email`, { method: 'POST', headers, body: JSON.stringify({ name: 'Fixture publisher', email, password }) }));
  if (!signup.ok) throw new Error('Fixture registration failed');
  const verified = await auth.handler(new Request(verificationLink));
  const cookie = verified.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const setup = await auth.handler(new Request(`${origin}/api/auth/two-factor/enable`, { method: 'POST', headers: { ...headers, cookie }, body: JSON.stringify({ password }) }));
  if (!setup.ok) throw new Error('Fixture authenticator setup failed');
  const { totpURI } = await setup.json();
  const confirmed = await auth.handler(new Request(`${origin}/api/auth/two-factor/verify-totp`, { method: 'POST', headers: { ...headers, cookie }, body: JSON.stringify({ code: authenticatorCode(totpURI) }) }));
  if (!confirmed.ok) throw new Error('Fixture authenticator confirmation failed');
  await promoteAdministrator(database.db, email);
  await writeFile(process.env.E2E_FIXTURE_FILE, JSON.stringify({ email, totpURI }), { mode: 0o600, flag: 'wx' });
} finally { await database.client.close(); }

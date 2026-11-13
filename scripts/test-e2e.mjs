import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = fileURLToPath(new URL('../apps/web/', import.meta.url));
await access(new URL('../apps/web/.next/BUILD_ID', import.meta.url)).catch(() => {
  console.error('Run npm run build before the browser tests.'); process.exit(1);
});
// Own only the server this runner creates. Never reuse or kill another process.
await new Promise((resolve, reject) => {
  const socket = net.createServer();
  socket.once('error', () => reject(new Error('Port 3005 is occupied. Stop that preview before running browser tests.')));
  socket.listen(3005, '127.0.0.1', () => socket.close(resolve));
});
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
const databasePath = await mkdtemp(new URL('../.cache/e2e-db-', import.meta.url));
const fixtureFile = path.join(databasePath, 'admin-fixture.json');
const fixturePassword = randomBytes(24).toString('base64url');
const testEnvironment = { ...process.env, DATABASE_URL: '', PUBLIC_DEPLOYMENT: 'false', PUBLIC_APP_URL: 'http://127.0.0.1:3005', LOCAL_DATABASE_PATH: path.join(databasePath, 'postgres'), PRIVATE_MEDIA_DIRECTORY: path.join(databasePath, 'media'), PRIVATE_EXPORT_DIRECTORY: path.join(databasePath, 'exports'), MAIL_CAPTURE_DIRECTORY: path.join(databasePath, 'mailbox'), SMTP_URL: '', MAIL_FROM: '', BETTER_AUTH_SECRET: randomBytes(48).toString('base64url'), GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', E2E_FIXTURE_FILE: fixtureFile, E2E_ADMIN_PASSWORD: fixturePassword };
const fixtureScript = path.join(databasePath, 'fixture.mjs');
await build({ entryPoints: [fileURLToPath(new URL('./e2e-fixture.ts', import.meta.url))], outfile: fixtureScript, bundle: true, platform: 'node', packages: 'external', format: 'esm', target: 'node22', logLevel: 'warning' });
const fixtureProcess = spawn(process.execPath, [fixtureScript], { cwd: root, stdio: 'inherit', windowsHide: true, env: testEnvironment });
await new Promise((resolve, reject) => { fixtureProcess.once('error', reject); fixtureProcess.once('exit', code => code === 0 ? resolve() : reject(new Error('Test fixture setup failed'))); });
const server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'start', '--hostname', '127.0.0.1', '--port', '3005'], { cwd: app, stdio: 'inherit', windowsHide: true,
  env: testEnvironment });
const serverExit = new Promise(resolve => server.once('exit', resolve));
let runner;
const cleanup = () => { runner?.kill(); server.kill(); };
process.once('SIGINT', cleanup); process.once('SIGTERM', cleanup);
let exitCode = 1;
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error('The test server exited before it was ready.');
    try { ready = (await fetch('http://127.0.0.1:3005', { signal: AbortSignal.timeout(1000) })).ok; } catch { /* Await startup. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error('Timed out waiting for the production test server.');
  runner = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url)), 'test', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', windowsHide: true, env: testEnvironment });
  exitCode = await new Promise((resolve, reject) => { runner.once('error', reject); runner.once('exit', code => resolve(code ?? 1)); });
} finally {
  if (server.exitCode === null) server.kill();
  await serverExit;
  // This is the fresh directory returned by mkdtemp above, never a user database.
  const actual = await realpath(databasePath), parent = await realpath(new URL('../.cache/', import.meta.url));
  if (path.dirname(actual) !== parent || !path.basename(actual).startsWith('e2e-db-')) throw new Error('Refusing cleanup outside the owned test database directory.');
  await rm(actual, { recursive: true, force: true });
}
process.exitCode = exitCode;

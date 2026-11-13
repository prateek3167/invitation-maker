import nextEnv from '@next/env';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access, constants } from 'node:fs/promises';
const root = fileURLToPath(new URL('../', import.meta.url));
nextEnv.loadEnvConfig(path.join(root, 'apps/web'));
const failures = [];
if (process.env.PUBLIC_DEPLOYMENT !== 'true') failures.push('PUBLIC_DEPLOYMENT must be true in the staging/production deployment environment.');
try { const url = new URL(process.env.PUBLIC_APP_URL || ''); if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error(); }
catch { failures.push('Configure a public HTTPS PUBLIC_APP_URL.'); }
try { const url = new URL(process.env.DATABASE_URL || ''); if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.searchParams.get('sslmode') !== 'verify-full') throw new Error(); }
catch { failures.push('Configure managed PostgreSQL with sslmode=verify-full and a verified CA/hostname.'); }
if ((process.env.BETTER_AUTH_SECRET?.length || 0) < 32) failures.push('Provide a managed BETTER_AUTH_SECRET of at least 32 characters.');
try { const url = new URL(process.env.SMTP_URL || ''); if (!['smtp:', 'smtps:'].includes(url.protocol)) throw new Error(); }
catch { failures.push('Configure TLS-capable SMTP_URL.'); }
if (!process.env.MAIL_FROM || /[\r\n]/.test(process.env.MAIL_FROM)) failures.push('Configure a verified MAIL_FROM sender.');
for (const name of ['PRIVATE_MEDIA_DIRECTORY', 'PRIVATE_EXPORT_DIRECTORY']) {
  const directory = process.env[name];
  if (!directory || !path.isAbsolute(directory) || directory.toLowerCase().startsWith(path.join(root, 'apps/web/public').toLowerCase())) failures.push(`Configure ${name} as a durable absolute private mount outside public/.`);
  else try { await access(directory, constants.R_OK | constants.W_OK); } catch { failures.push(`${name} must be readable and writable by the application and worker identity.`); }
}
if (process.env.PRIVATE_MEDIA_DIRECTORY && path.resolve(process.env.PRIVATE_MEDIA_DIRECTORY) === path.resolve(process.env.PRIVATE_EXPORT_DIRECTORY || '.')) failures.push('Media and export mounts must use distinct directories.');
if (!process.env.EXPORT_BROWSER_EXECUTABLE && !process.env.EXPORT_BROWSER_CHANNEL) failures.push('Specify the controlled export browser installation/channel; verify the same approved font environment in staging.');
if (Boolean(process.env.GOOGLE_CLIENT_ID) !== Boolean(process.env.GOOGLE_CLIENT_SECRET)) failures.push('Configure both Google OAuth credentials, or neither.');
if (failures.length) { console.error('Deployment configuration is not ready:'); failures.forEach(failure => console.error(`- ${failure}`)); process.exitCode = 1; }
else console.info('Static deployment configuration checks passed. Live database/SMTP/OAuth, worker, mount durability, proxy/limits, recovery, fonts/artwork and UAT checks are still required.');

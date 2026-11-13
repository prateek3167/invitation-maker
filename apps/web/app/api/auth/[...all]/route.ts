import { getAuth } from '@/lib/server/auth';
import { body, endpoint } from '@/lib/server/http';
import { DomainError } from '../../../../../../packages/database/projects';
import { getDatabase } from '../../../../../../packages/database/client';
import { assets, exportJobs } from '../../../../../../packages/database/schema';
import { removeAssetFiles } from '../../../../../../packages/database/media';
import { eq } from 'drizzle-orm';
import { artifactPath } from '@/lib/server/export-worker';
import { unlink } from 'node:fs/promises';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handler = endpoint(async request => {
  let deletedAssets: string[] = [];
  let deletedExports: string[] = [];
  if (request.method === 'POST') {
    const input = await body(request, 16000);
    const pathname = new URL(request.url).pathname;
    if (pathname.endsWith('/delete-user')) {
      const current = await (await getAuth()).api.getSession({ headers: request.headers });
      if (current) {
        const db = await getDatabase();
        deletedAssets = (await db.select({ id: assets.id }).from(assets).where(eq(assets.ownerId, current.user.id))).map(row => row.id);
        deletedExports = (await db.select().from(exportJobs).where(eq(exportJobs.ownerId, current.user.id))).filter(job => job.leaseToken).map(artifactPath);
      }
    }
    if (pathname.endsWith('/two-factor/disable')) {
      const current = await (await getAuth()).api.getSession({ headers: request.headers });
      if (current?.user.role === 'admin') throw new DomainError(403, 'ADMIN_MFA_REQUIRED', 'Administrators must retain an authenticator. Contact the server operator for recovery.');
    }
    if (pathname.endsWith('/update-user') && (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 80)) throw new DomainError(400, 'INVALID_NAME', 'Enter a name of 1–80 characters.');
    const headers = new Headers(request.headers); headers.delete('content-length');
    request = new Request(request.url, { method: 'POST', headers, body: JSON.stringify(input) });
  }
  const response = await (await getAuth()).handler(request);
  if (response.ok && deletedAssets.length) await removeAssetFiles(deletedAssets);
  if (response.ok) for (const file of deletedExports) await unlink(file).catch(error => { if (error.code !== 'ENOENT') throw error; });
  return response;
});
export { handler as GET, handler as POST };

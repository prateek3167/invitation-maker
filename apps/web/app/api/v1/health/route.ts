import { sql } from 'drizzle-orm';
import { endpoint } from '@/lib/server/http';
import { getDatabase } from '../../../../../../packages/database/client';
export const dynamic = 'force-dynamic';
export const GET = endpoint(async () => {
  await (await getDatabase()).execute(sql`select 1`);
  return Response.json({ status: 'ok' });
});

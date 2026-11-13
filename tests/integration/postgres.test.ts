import { expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { inArray } from 'drizzle-orm';
import * as schema from '../../packages/database/schema';
import { createCard, createProject, getCard, getProject, removeProject, updateCard } from '../../packages/database/projects';

it.skipIf(!process.env.TEST_DATABASE_URL)('verifies the network PostgreSQL driver against an explicitly configured migrated test database', async () => {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 2 });
  const db = drizzle(pool, { schema });
  const owner = `test-${randomUUID()}`, other = `test-${randomUUID()}`;
  try {
    await db.insert(schema.user).values([{ id: owner, name: 'SQL fixture A', email: `${owner}@example.test` }, { id: other, name: 'SQL fixture B', email: `${other}@example.test` }]);
    const project = await createProject(db, owner, { title: 'Network PostgreSQL fixture', occasion: 'Wedding' });
    const card = await createCard(db, owner, project.id, { templateId: '3' });
    await expect(getProject(db, other, project.id)).rejects.toMatchObject({ status: 404 });
    const saved = await updateCard(db, owner, card.id, { ...card, title: 'Persisted through node-postgres' });
    expect(saved.revision).toBe(2);
    await expect(updateCard(db, owner, card.id, card)).rejects.toMatchObject({ status: 409 });
    await removeProject(db, owner, project.id);
    await expect(getCard(db, owner, card.id)).rejects.toMatchObject({ status: 404 });
  } finally {
    // Delete only identities created by this test; cascades remove their fixtures.
    await db.delete(schema.user).where(inArray(schema.user.id, [owner, other]));
    await pool.end();
  }
});

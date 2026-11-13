import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createEmbeddedDatabase, migrateEmbedded } from '../../packages/database/client';
import { createCard, createProject, getCard, getProject, listProjects, removeCard, removeProject, updateCard, updateProject } from '../../packages/database/projects';
import { user } from '../../packages/database/schema';
import { createAuth } from '../../apps/web/lib/server/auth';
import { endpoint } from '../../apps/web/lib/server/http';
import { mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import path from 'node:path';

describe('real PostgreSQL-compatible foundation', () => {
  let database: Awaited<ReturnType<typeof createEmbeddedDatabase>>;
  beforeAll(async () => {
    database = await createEmbeddedDatabase();
    await database.db.insert(user).values([{ id: 'alice', name: 'Alice', email: 'alice@example.test' }, { id: 'bob', name: 'Bob', email: 'bob@example.test' }]);
  });
  afterAll(async () => { await database?.client.close(); });
  it('applies versioned migrations once and enforces relational checks', async () => {
    await migrateEmbedded(database.client);
    const applied = await database.client.query('SELECT * FROM schema_migrations'); expect(applied.rows).toHaveLength(7);
    await expect(database.client.query("INSERT INTO event_projects(owner_id,title,occasion) VALUES('missing','No owner','Wedding')")).rejects.toThrow();
    await expect(database.client.query("INSERT INTO event_projects(owner_id,title,occasion) VALUES('alice','','Wedding')")).rejects.toThrow();
  });
  it('rejects changed migration history rather than silently accepting schema drift', async () => {
    const original = await database.client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name=$1', ['0001_foundation.sql']);
    await database.client.query("UPDATE schema_migrations SET checksum='tampered' WHERE name=$1", ['0001_foundation.sql']);
    try { await expect(migrateEmbedded(database.client)).rejects.toThrow('An applied migration has changed'); }
    finally { await database.client.query('UPDATE schema_migrations SET checksum=$1 WHERE name=$2', [original.rows[0].checksum, '0001_foundation.sql']); }
  });
  it('reopens account projects from disk after the embedded server is closed', async () => {
    const parent = path.resolve('.cache'); await mkdir(parent, { recursive: true });
    const directory = await mkdtemp(path.join(parent, 'server-test-'));
    let local: Awaited<ReturnType<typeof createEmbeddedDatabase>> | undefined;
    try {
      local = await createEmbeddedDatabase(directory);
      await local.db.insert(user).values({ id: 'persisted-owner', name: 'Owner', email: 'disk@example.test' });
      const project = await createProject(local.db, 'persisted-owner', { title: 'Saved across restarts', occasion: 'Wedding' });
      const card = await createCard(local.db, 'persisted-owner', project.id, { templateId: '3' });
      await local.client.close(); local = undefined;
      local = await createEmbeddedDatabase(directory);
      expect((await getProject(local.db, 'persisted-owner', project.id)).invitations[0].id).toBe(card.id);
    } finally {
      await local?.client.close();
      const actual = await realpath(directory), expectedParent = await realpath(parent);
      if (path.dirname(actual) !== expectedParent || !path.basename(actual).startsWith('server-test-')) throw new Error('Refusing cleanup outside the owned test database.');
      await rm(actual, { recursive: true, force: true });
    }
  });
  it('scopes event CRUD to its owner and checks expected revisions', async () => {
    const project = await createProject(database.db, 'alice', { title: 'Wedding weekend', occasion: 'Wedding', ownerId: 'bob' });
    expect(project.ownerId).toBe('alice');
    expect((await listProjects(database.db, 'alice')).some(p => p.id === project.id)).toBe(true);
    expect(await listProjects(database.db, 'bob')).toHaveLength(0);
    await expect(getProject(database.db, 'bob', project.id)).rejects.toMatchObject({ status: 404 });
    await expect(updateProject(database.db, 'bob', project.id, { revision: 0, title: 'Stolen' })).rejects.toMatchObject({ status: 404 });
    const updated = await updateProject(database.db, 'alice', project.id, { revision: 0, title: 'Renamed wedding', sharedDetails: { host: 'Aarav', partner: 'Ananya' } });
    expect(updated.revision).toBe(1);
    await expect(updateProject(database.db, 'alice', project.id, { revision: Number.MAX_SAFE_INTEGER, title: 'Overflow' })).rejects.toMatchObject({ status: 400 });
    await expect(updateProject(database.db, 'alice', project.id, { revision: 0, title: 'Stale edit' })).rejects.toMatchObject({ status: 409 });
    await expect(removeProject(database.db, 'bob', project.id)).rejects.toMatchObject({ status: 404 });
    await removeProject(database.db, 'alice', project.id);
  });
  it('inherits event defaults only when creating cards and preserves independent edits', async () => {
    const event = await createProject(database.db, 'alice', { title: 'Family celebrations', occasion: 'Wedding', sharedDetails: { host: 'Shared host', venue: 'Garden' } });
    const first = await createCard(database.db, 'alice', event.id, { templateId: '1' });
    const second = await createCard(database.db, 'alice', event.id, { templateId: '2' });
    expect(first.fields.host).toBe('Shared host'); expect(second.fields.venue).toBe('Garden');
    await updateProject(database.db, 'alice', event.id, { revision: 0, sharedDetails: { host: 'New default' } });
    expect((await getCard(database.db, 'alice', first.id)).fields.host).toBe('Shared host');
    const third = await createCard(database.db, 'alice', event.id, { templateId: '3' });
    expect(third.fields.host).toBe('New default');
    expect((await getProject(database.db, 'alice', event.id)).invitations).toHaveLength(3);
    await removeProject(database.db, 'alice', event.id);
    await expect(getCard(database.db, 'alice', first.id)).rejects.toMatchObject({ status: 404 });
  });
  it('rejects cross-owner invitation access, stale writes and template swapping', async () => {
    const event = await createProject(database.db, 'alice', { title: 'Private birthday', occasion: 'Birthday' });
    const card = await createCard(database.db, 'alice', event.id, { templateId: '2' });
    await expect(createCard(database.db, 'bob', event.id, { templateId: '2' })).rejects.toMatchObject({ status: 404 });
    await expect(getCard(database.db, 'bob', card.id)).rejects.toMatchObject({ status: 404 });
    await expect(updateCard(database.db, 'bob', card.id, card)).rejects.toMatchObject({ status: 404 });
    await expect(removeCard(database.db, 'bob', card.id)).rejects.toMatchObject({ status: 404 });
    const saved = await updateCard(database.db, 'alice', card.id, { ...card, font: 'modern', fields: { ...card.fields, host: 'Personal host' } });
    expect(saved.revision).toBe(2); expect(saved.font).toBe('modern');
    await expect(updateCard(database.db, 'alice', card.id, card)).rejects.toMatchObject({ status: 409 });
    await expect(updateCard(database.db, 'alice', card.id, { ...saved, templateId: '3' })).rejects.toMatchObject({ status: 400 });
    await removeCard(database.db, 'alice', card.id); await removeProject(database.db, 'alice', event.id);
  });
  it('copies imported documents with a new identity and enforces the event card limit', async () => {
    const event = await createProject(database.db, 'alice', { title: 'Copy test', occasion: 'Wedding' });
    const card = await createCard(database.db, 'alice', event.id, { templateId: '2' });
    const copy = await createCard(database.db, 'alice', event.id, { document: { ...card, ownerId: 'bob', title: 'Account copy' } });
    expect(copy.id).not.toBe(card.id); expect(copy).not.toHaveProperty('ownerId');
    for (let i = 2; i < 20; i++) await createCard(database.db, 'alice', event.id, { templateId: '2' });
    await expect(createCard(database.db, 'alice', event.id, { templateId: '2' })).rejects.toMatchObject({ code: 'CARD_LIMIT' });
    await removeProject(database.db, 'alice', event.id);
  });
  it('uses Better Auth to hash passwords, create/revoke sessions and reject wrong passwords', async () => {
    const messages: {text:string}[] = [];
    const auth = createAuth(database.db, 'test-only-secret-with-at-least-thirty-two-characters-123', 'http://127.0.0.1:3005', async message => { messages.push(message); });
    const headers = { origin: 'http://127.0.0.1:3005', 'content-type': 'application/json' };
    const response = await auth.handler(new Request('http://127.0.0.1:3005/api/auth/sign-up/email', { method: 'POST', headers, body: JSON.stringify({ name: 'Real account', email: 'real@example.test', password: 'A long test passphrase 123!' }) }));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().join(';')).not.toContain('session_token');
    const verification = await auth.handler(new Request(messages[0].text.match(/https?:\/\/\S+/)![0]));
    const cookie = verification.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    expect(cookie).toContain('session_token'); expect(verification.headers.getSetCookie().join(';')).toContain('HttpOnly');
    const accountRow = await database.client.query<{ password: string }>("SELECT password FROM auth_accounts WHERE provider_id='credential'");
    expect(accountRow.rows[0].password).not.toContain('A long test passphrase');
    const info = await auth.api.getSession({ headers: new Headers({ cookie }) }); expect(info?.user.email).toBe('real@example.test');
    const wrong = await auth.handler(new Request('http://127.0.0.1:3005/api/auth/sign-in/email', { method: 'POST', headers, body: JSON.stringify({ email: 'real@example.test', password: 'Definitely the wrong password' }) }));
    expect(wrong.status).toBe(401);
    const logout = await auth.handler(new Request('http://127.0.0.1:3005/api/auth/sign-out', { method: 'POST', headers: { ...headers, cookie }, body: '{}' }));
    expect(logout.status).toBe(200);
    expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
    // The application enforces origin even on cookie-free registration; the auth
    // library's own origin checks are not a replacement for this boundary.
    const foreignOrigin = await endpoint(request => auth.handler(request))(new Request('http://127.0.0.1:3005/api/auth/sign-up/email', { method: 'POST', headers: { ...headers, origin: 'https://evil.example' }, body: JSON.stringify({ name: 'Attack', email: 'attack@example.test', password: 'A long test passphrase 123!' }) }));
    expect(foreignOrigin.status).toBe(403);
  });
  it('persists auth rate limits and rejects repeated sign-in attempts', async () => {
    const auth = createAuth(database.db, 'test-only-secret-with-at-least-thirty-two-characters-123', 'http://127.0.0.1:3005');
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const response = await auth.handler(new Request('http://127.0.0.1:3005/api/auth/sign-in/email', { method: 'POST', headers: { origin: 'http://127.0.0.1:3005', 'content-type': 'application/json' }, body: JSON.stringify({ email: 'unknown@example.test', password: 'A long incorrect passphrase 123!' }) }));
      statuses.push(response.status);
    }
    expect(statuses.at(-1)).toBe(429);
    const result = await database.client.query('SELECT count(*)::integer AS total FROM auth_rate_limits');
    expect((result.rows[0] as { total: number }).total).toBeGreaterThan(0);
  });
});

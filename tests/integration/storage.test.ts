import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createInvitation, templates } from '../../packages/editor-core/document';
import { ConflictError, deleteDraft, listDrafts, saveDraft } from '../../apps/web/lib/storage';

describe('transactional device drafts', () => {
  it('roundtrips complete visual state and rejects stale concurrent writes', async () => {
    const d = createInvitation(templates.find(t => t.photo)!, crypto.randomUUID());
    d.font = 'italic'; d.palette = ['#123456', '#ffffff', '#987654']; d.format = 'story';
    d.photo = { data: 'data:image/png;base64,YQ==', x: 12, y: 83, zoom: 2.5 };
    const saved = await saveDraft(d);
    expect(saved.revision).toBe(1);
    expect((await listDrafts()).find(x => x.id === d.id)).toEqual(saved);
    const results = await Promise.allSettled([saveDraft({ ...saved, title: 'Tab A' }), saveDraft({ ...saved, title: 'Tab B' })]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    const failed = results.find(r => r.status === 'rejected');
    expect(failed?.status === 'rejected' && failed.reason).toBeInstanceOf(ConflictError);
    await deleteDraft(d.id);
    await expect(saveDraft(saved)).rejects.toBeInstanceOf(ConflictError);
    expect((await listDrafts()).some(x => x.id === d.id)).toBe(false);
  });
  it('keeps duplicated photos/settings independent from their original', async () => {
    const source = await saveDraft(createInvitation(templates[1], crypto.randomUUID()));
    const copy = await saveDraft({ ...source, id: crypto.randomUUID(), title: 'Copy', revision: 0 });
    await saveDraft({ ...copy, fields: { ...copy.fields, host: 'Changed copy' } });
    expect((await listDrafts()).find(x => x.id === source.id)?.fields.host).toBe(source.fields.host);
    await deleteDraft(source.id); await deleteDraft(copy.id);
  });
});

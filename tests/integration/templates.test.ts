import { afterAll, beforeAll, expect, it } from 'vitest';
import { createEmbeddedDatabase } from '../../packages/database/client';
import { user } from '../../packages/database/schema';
import { createTemplateVersion, publishTemplate, publishedTemplates } from '../../packages/database/templates';
import { createCard, createProject, getCard, updateCard } from '../../packages/database/projects';
import { templates, createInvitation, presets, validateTemplate } from '../../packages/editor-core/document';
import { renderSvg } from '../../packages/template-engine/render';
let database: Awaited<ReturnType<typeof createEmbeddedDatabase>>;
beforeAll(async () => { database = await createEmbeddedDatabase(); await database.db.insert(user).values({ id: 'publisher', name: 'Publisher', email: 'publisher@example.test' }); });
afterAll(async () => { await database?.client.close(); });
it('validates immutable definitions and preserves old invitations through replacement and withdrawal', async () => {
  const base = templates.find(template => !template.photo)!;
  await expect(createTemplateVersion(database.db, 'publisher', { definition: { ...base, layout: 100 }, licenseNote: 'Original test-only geometric composition.' })).rejects.toMatchObject({ code: 'INVALID_TEMPLATE' });
  await expect(createTemplateVersion(database.db, 'publisher', { definition: base, licenseNote: '' })).rejects.toMatchObject({ code: 'LICENSE_REQUIRED' });
  const first = await createTemplateVersion(database.db, 'publisher', { definition: { ...base, name: 'First publisher fixture' }, licenseNote: 'Original test-only geometric composition, not for sale.' });
  const project = await createProject(database.db, 'publisher', { title: 'Published project', occasion: 'Wedding' });
  await expect(createCard(database.db, 'publisher', project.id, { templateId: first.id })).rejects.toMatchObject({ code: 'TEMPLATE_UNAVAILABLE' });
  await publishTemplate(database.db, 'publisher', first.id, true);
  expect((await publishedTemplates(database.db)).some(t => t.id === first.id)).toBe(true);
  const card = await createCard(database.db, 'publisher', project.id, { templateId: first.id }), original = renderSvg(card);
  const second = await createTemplateVersion(database.db, 'publisher', { familyId: first.familyId, definition: { ...first.definition, name: 'Replacement fixture', layout: (base.layout + 1) % 10 }, licenseNote: 'Original test-only geometric composition, not for sale.' });
  expect(second.version).toBe(2); await publishTemplate(database.db, 'publisher', second.id, true);
  expect((await publishedTemplates(database.db)).some(t => t.id === first.id)).toBe(false);
  expect(renderSvg(await getCard(database.db, 'publisher', card.id))).toBe(original);
  await expect(updateCard(database.db, 'publisher', card.id, { ...card, templateSnapshot: { ...first.definition, layout: 9 } })).rejects.toMatchObject({ code: 'INVALID_TEMPLATE' });
  await publishTemplate(database.db, 'publisher', second.id, false);
  expect(renderSvg(await getCard(database.db, 'publisher', card.id))).toBe(original);
  expect((await updateCard(database.db, 'publisher', card.id, { ...card, title: 'Edited after withdrawal' })).revision).toBe(2);
});
it('renders all published-schema compositions in every size and rejects active values', () => {
  for (const photo of [false, true]) for (let layout = 0; layout <= 9; layout++) for (const format of Object.keys(presets) as (keyof typeof presets)[]) {
    const definition = { ...templates[0], id: `proof-${layout}-${photo}`, layout, photo }; validateTemplate(definition);
    const document = createInvitation(definition); document.format = format;
    expect(renderSvg(document)).toContain(`width="${presets[format].width}"`);
  }
  expect(() => validateTemplate({ ...templates[0], palette: ['url(https://evil)', '#fff000', '#fff000'] })).toThrow();
});

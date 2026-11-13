import { serverArtwork } from '../../packages/template-engine/artwork';
import { describe, expect, it } from 'vitest';
import { contentIssues, createInvitation, filterTemplates, occasions, presets, templates, validateInvitation } from '../../packages/editor-core/document';
import { renderSvg } from '../../packages/template-engine/render';

describe('canonical invitation documents', () => {
  it('provides the agreed occasion and photo inventory', () => {
    expect(templates).toHaveLength(80); expect(occasions).toHaveLength(12);
    expect(templates.filter(t => t.photo)).toHaveLength(57);
    expect(new Set(templates.map(t => t.id)).size).toBe(80);
  });
  it('renders every catalog concept deterministically with complete content', async () => {
    for (const t of templates) {
      const d = createInvitation(t, 'fixture');
      const art = await serverArtwork(d);
      expect(() => validateInvitation(d)).not.toThrow();
      expect(renderSvg(d,art)).toEqual(renderSvg(structuredClone(d),art));
      expect(renderSvg(d,art)).toContain('width="1500" height="2100"');
      expect(renderSvg(d,art)).toContain('A MOMENT TO REMEMBER');
    }
  });
  it('escapes user content and rejects active images, colors and unknown versions', () => {
    const d = createInvitation(templates[0], 'safe');
    d.fields.host = '<script>alert(1)</script>';
    expect(renderSvg(d)).not.toContain('<script>');
    expect(renderSvg(d)).toContain('&lt;script&gt;');
    expect(() => validateInvitation({ ...d, palette: ['red;evil', '#ffffff', '#000000'] })).toThrow();
    expect(() => validateInvitation({ ...d, schemaVersion: 2 })).toThrow();
    expect(() => validateInvitation({ ...d, revision: Number.MAX_SAFE_INTEGER })).toThrow();
    expect(() => validateInvitation({ ...d, photo: { data: 'data:image/svg+xml,<svg onload="evil"/>', x: 50, y: 50, zoom: 1 } })).toThrow();
    expect(() => validateInvitation({ ...d, format: '__proto__' })).toThrow();
  });
  it('rejects photos on non-photo documents and invalid crop transforms', () => {
    const d = createInvitation(templates.find(t => !t.photo)!, 'no-photo');
    expect(() => validateInvitation({ ...d, photo: { data: 'data:image/png;base64,YQ==', x: 50, y: 50, zoom: 1 } })).toThrow();
    const p = createInvitation(templates.find(t => t.photo)!, 'photo');
    expect(() => validateInvitation({ ...p, photo: { data: 'data:image/png;base64,YQ==', x: NaN, y: 50, zoom: 1 } })).toThrow();
  });
  it('retains all content for each format and allows styling independently of content', () => {
    const d = createInvitation(templates.find(t => !t.photo)!, 'formats');
    const original = JSON.stringify(d.fields);
    for (const format of Object.keys(presets) as (keyof typeof presets)[]) {
      d.format = format; d.font = 'modern';
      const svg = renderSvg(d);
      expect(svg).toContain(`width="${presets[format].width}" height="${presets[format].height}"`);
      expect(svg).toContain('Arial, sans-serif'); expect(JSON.stringify(d.fields)).toBe(original);
    }
  });
  it('filters by actual capabilities and signals incomplete content before export', () => {
    expect(filterTemplates('  WEDDING ', 'Wedding', 'no').every(t => t.occasion === 'Wedding' && !t.photo)).toBe(true);
    expect(filterTemplates('does not exist', '', '')).toHaveLength(0);
    const d = createInvitation(templates[0], 'required'); d.fields.host = '';
    expect(contentIssues(d)).toContain('Add a host or first name.');
    expect(contentIssues(d)).toContain('Add your photo before downloading this photo design.');
  });
});

import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { createInvitation, templates, validateInvitation } from '../../packages/editor-core/document';
import { decomposeTemplateToElements } from '../../packages/editor-core/canvas';
import { safeDocument } from '../../packages/database/projects';
import { generateQrCodeSvg } from '../../apps/web/lib/qrcode';
import { generateGoogleCalendarUrl, generateIcsCalendarFile } from '../../apps/web/lib/share';
import { renderSvg } from '../../packages/template-engine/render';
import { readFile } from 'node:fs/promises';

describe('2026-11-14 audit regressions', () => {
  it('keeps all 80 canvasless-to-editable compositions identical and preserves an intentionally empty canvas', async () => {
    for (const template of templates) {
      const document = createInvitation(template);
      const artwork = template.royal ? 'data:image/webp;base64,' + (await readFile('apps/web/public/royal/' + template.royal.artwork + '.webp')).toString('base64') : undefined;
      const before = renderSvg(document, artwork);
      document.canvasElements = decomposeTemplateToElements(document);
      expect(renderSvg(document, artwork), template.id).toBe(before);
      document.canvasElements = [];
      expect(renderSvg(document, artwork)).not.toContain('ADD PHOTOGRAPH');
      expect(renderSvg(document, artwork)).not.toContain('<text');
    }
  });
  it('positions and resizes every movable heritage ornament in its element bounds', async () => {
    const document = createInvitation(templates.find(template => !template.photo)!);
    for (const shapeType of ['kalash', 'toran', 'lanterns', 'peacock', 'henna', 'filigree'] as const) {
      document.canvasElements = [{id:'movable-art',type:'ornament',name:'Heritage artwork',x:200,y:300,width:100,height:120,zIndex:1,shapeType,stroke:'#333333'}];
      const svg = renderSvg(document);
      expect(svg).toContain('<svg x="200" y="300" width="100" height="120"');
      const {data,info} = await sharp(Buffer.from(svg)).resize(700,980).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      // All visible ink belongs to the element's rectangle, not its old hard-coded page coordinates.
      const paper = document.palette[1].slice(1).match(/../g)!.map(value=>parseInt(value,16));
      let inkInside = 0, inkOutside = 0;
      for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
        const offset=(y*info.width+x)*4;
        if(paper.some((channel,index)=>Math.abs(data[offset+index]-channel)>20)) {
          if(x>=199&&x<=301&&y>=299&&y<=421)inkInside++;else inkOutside++;
        }
      }
      expect(inkInside).toBeGreaterThan(10);
      expect(inkOutside).toBe(0);
    }
  });
  it('decodes the exact short, long and Unicode QR payloads with an independent scanner', async () => {
    for (const value of ['https://example.com/invite/123', `https://example.com/invite/${'a'.repeat(180)}`, 'https://example.com/?name=शुभ-विवाह']) {
      const { data, info } = await sharp(Buffer.from(generateQrCodeSvg(value, { size: 720, includeCenterBadge: true }))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data).toBe(value);
    }
  });
  it('preserves canvas, suite and guest settings through the account document boundary', () => {
    const doc = createInvitation(templates[0]);
    doc.canvasElements = decomposeTemplateToElements(doc);
    doc.suiteCards = [createInvitation(templates[0])];
    doc.eventTag = 'Shaadi';
    doc.rsvpSettings = { enabled: false, allowPlusOnes: false, maxPartySize: 1, collectDietary: false, collectCeremonies: false };
    const saved = safeDocument(doc);
    expect(saved.canvasElements).toEqual(doc.canvasElements);
    expect(saved.suiteCards).toEqual(doc.suiteCards);
    expect(saved.rsvpSettings).toEqual(doc.rsvpSettings);
    expect(saved.eventTag).toBe('Shaadi');
  });
  it('rejects executable SVG, attribute injection and invalid nested suite documents', () => {
    const doc = createInvitation(templates[0]);
    doc.canvasElements = [{ id: 'unsafe', name: 'Unsafe', type: 'shape', shapeType: 'customSvg', x: 0, y: 0, width: 100, height: 100, zIndex: 1, svgContent: '<svg><image href="bad" onerror="window.__auditXss=1"/></svg>' }];
    expect(() => validateInvitation(doc)).toThrow();
    doc.canvasElements[0].svgContent = '<svg><path d="M0 0h10v10z"/></svg>';
    doc.canvasElements[0].fill = 'red" onload="alert(1)';
    expect(() => validateInvitation(doc)).toThrow();
    delete doc.canvasElements;
    doc.suiteCards = [{} as typeof doc];
    expect(() => validateInvitation(doc)).toThrow();
  });
  it('uses the actual Indian event time and escapes calendar property injection', () => {
    const doc = createInvitation(templates[0]);
    doc.fields.date = 'Saturday, November 28, 2026';
    doc.fields.time = '7:00 PM Onwards';
    expect(new URL(generateGoogleCalendarUrl(doc)).searchParams.get('dates')).toBe('20261128T133000Z/20261128T163000Z');
    doc.fields.host = 'Aarav\r\nATTENDEE:attacker@example.com';
    const ics = generateIcsCalendarFile(doc);
    expect(ics).toContain('DTSTART:20261128T133000Z');
    expect(ics).not.toContain('\r\nATTENDEE:');
    doc.fields.date = 'soon';
    expect(() => generateIcsCalendarFile(doc)).toThrow(/date/i);
  });
});

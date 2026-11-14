import { describe, it, expect } from 'vitest';
import {
  VEDIC_SHLOKAS,
  convertDocumentToHindi,
  applyDevanagariFontsToElements,
} from '../../packages/editor-core/shlokas';
import {
  getTraditionalOrnamentSvg,
  renderGaneshaRoyal,
  renderGaneshaMinimal,
  renderSwastik,
  renderOm,
  renderDoli,
  renderShehnai,
  renderBaaratElephant,
  renderHavanKund,
  renderMangalsutra,
  renderPeacockPair,
  renderDiya,
  renderNamaste,
  renderMarigoldGarland,
} from '../../packages/template-engine/traditional-elements';
import { renderFromCanvasElements } from '../../packages/template-engine/render';
import { WEDDING_ELEMENT_TEMPLATES, type CanvasElement } from '../../packages/editor-core/canvas';
import type { Invitation } from '../../packages/editor-core/document';

describe('Vedic Shlokas & Devanagari Library', () => {
  it('contains comprehensive categorized authentic Vedic wedding shlokas', () => {
    expect(VEDIC_SHLOKAS.length).toBeGreaterThanOrEqual(10);
    const categories = new Set(VEDIC_SHLOKAS.map(s => s.category));
    expect(categories.has('ganesh')).toBe(true);
    expect(categories.has('vivah')).toBe(true);
    expect(categories.has('gauri')).toBe(true);
    expect(categories.has('saptapadi')).toBe(true);
    expect(categories.has('shanti')).toBe(true);
    expect(categories.has('headlines')).toBe(true);

    for (const shloka of VEDIC_SHLOKAS) {
      expect(shloka.id).toBeTruthy();
      expect(shloka.title).toBeTruthy();
      expect(shloka.sanskrit).toBeTruthy();
      expect(shloka.meaning).toBeTruthy();
      expect(shloka.suggestedFont).toMatch(/Devanagari|Rozha|Yatra|Kalam|Serif/);
      expect(shloka.suggestedFontSize).toBeGreaterThan(10);
    }
  });

  it('converts an invitation document into authentic Devanagari Hindi preset', () => {
    const baseDoc: Invitation = {
      schemaVersion: 1,
      id: 'test-invitation',
      templateId: '1',
      title: 'Aarav & Meera Wedding',
      revision: 1,
      createdAt: '2026-11-14T10:00:00.000Z',
      updatedAt: '2026-11-14T10:00:00.000Z',
      fields: {
        host: 'Sharma Family',
        partner: 'Verma Family',
        heading: 'Wedding Celebration',
        date: 'Saturday, November 28, 2026',
        time: '7:00 PM onwards',
        venue: 'Grand Hyatt, Mumbai',
        message: 'Together with their families cordially invite you',
      },
      palette: ['#541212', '#fff8ee', '#d4af37'],
      font: 'modern',
      format: 'portrait',
      photo: null,
    };

    const hindi = convertDocumentToHindi(baseDoc);
    expect(hindi.fields.heading).toBe('॥ श्री गणेशाय नमः ॥');
    expect(hindi.fields.date).toContain('२०२६');
    expect(hindi.fields.message).toContain('पावन परिणयोत्सव');
    expect(hindi.font).toBe('serif');
  });

  it('updates canvas elements with Devanagari typography', () => {
    const elements: CanvasElement[] = [
      {
        id: 'el-heading',
        type: 'text',
        name: 'Heading Invocation',
        text: '॥ श्री गणेशाय नमः ॥',
        x: 100,
        y: 100,
        width: 500,
        height: 60,
        zIndex: 1,
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
      },
      {
        id: 'el-body',
        type: 'text',
        name: 'Event Date & Venue',
        text: 'शनिवार, २८ नवंबर २०२६',
        x: 100,
        y: 200,
        width: 500,
        height: 40,
        zIndex: 2,
        fontSize: 14,
        fontFamily: 'Georgia, serif',
      },
      {
        id: 'el-shape',
        type: 'shape',
        name: 'Border Frame',
        x: 0,
        y: 0,
        width: 700,
        height: 980,
        zIndex: 0,
        shapeType: 'rect',
      },
    ];

    const updated = applyDevanagariFontsToElements(elements);
    expect(updated[0].fontFamily).toBe("'Rozha One', serif");
    expect(updated[1].fontFamily).toBe("'Noto Serif Devanagari', serif");
    expect(updated[2].type).toBe('shape'); // Untouched
  });
});

describe('Culturally Rich Traditional Wedding Elements', () => {
  it('renders all traditional vector elements as valid non-empty SVG markup', () => {
    const stroke = '#d4af37';
    const fill = '#541212';

    const renderers = [
      renderGaneshaRoyal,
      renderGaneshaMinimal,
      renderSwastik,
      renderOm,
      renderDoli,
      renderShehnai,
      renderBaaratElephant,
      renderHavanKund,
      renderMangalsutra,
      renderPeacockPair,
      renderDiya,
      renderNamaste,
      renderMarigoldGarland,
    ];

    for (const renderer of renderers) {
      const svg = renderer(stroke, fill);
      expect(typeof svg).toBe('string');
      expect(svg.length).toBeGreaterThan(50);
      expect(svg).toContain('<g');
      expect(svg).toContain(stroke);
    }
  });

  it('resolves all WEDDING_ELEMENT_TEMPLATES via getTraditionalOrnamentSvg', () => {
    const keys = [
      'ganesha_royal',
      'ganesha_minimal',
      'swastik',
      'om',
      'doli',
      'shehnai',
      'baarat_elephant',
      'havan_kund',
      'mangalsutra',
      'peacock_pair',
      'diya',
      'namaste',
      'marigold_garland',
    ];

    for (const key of keys) {
      expect(WEDDING_ELEMENT_TEMPLATES[key]).toBeDefined();
      const svg = getTraditionalOrnamentSvg(key, '#c5a059');
      expect(svg).not.toBeNull();
      expect(svg!.length).toBeGreaterThan(50);
    }

    expect(getTraditionalOrnamentSvg('unknown_shape', '#000')).toBeNull();
  });

  it('renders traditional ornaments and Hindi text without remote font imports', () => {
    const doc: Invitation = {
      schemaVersion: 1,
      id: 'doc-traditional-test',
      templateId: '1',
      title: 'Devanagari Wedding',
      revision: 1,
      createdAt: '2026-11-14T10:00:00.000Z',
      updatedAt: '2026-11-14T10:00:00.000Z',
      fields: {
        host: 'शर्मा परिवार',
        partner: 'वर्मा परिवार',
        heading: '॥ श्री गणेशाय नमः ॥',
        date: '२८ नवंबर २०२६',
        time: 'सायं ७:००',
        venue: 'राज पैलेस',
        message: 'सादर आमंत्रित',
      },
      palette: ['#541212', '#fff8ee', '#d4af37'],
      font: 'serif',
      format: 'portrait',
      photo: null,
      canvasElements: [
        {
          id: 'ganesha-1',
          type: 'ornament',
          name: 'Lord Ganesha',
          shapeType: 'ganesha_royal',
          x: 310,
          y: 60,
          width: 80,
          height: 80,
          zIndex: 1,
          stroke: '#d4af37',
        },
        {
          id: 'heading-text',
          type: 'text',
          name: 'Heading',
          text: '॥ शुभ विवाह ॥',
          x: 100,
          y: 160,
          width: 500,
          height: 60,
          zIndex: 2,
          fontSize: 34,
          fontFamily: "'Rozha One', serif",
          color: '#541212',
        },
        {
          id: 'doli-1',
          type: 'ornament',
          name: 'Bridal Doli',
          shapeType: 'doli',
          x: 295,
          y: 750,
          width: 110,
          height: 90,
          zIndex: 3,
          stroke: '#d4af37',
        },
      ],
    };

    const svg = renderFromCanvasElements(doc);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Rozha One'); // Family retained; installed fallback is explicit.
    expect(svg).not.toContain('@import'); // Image SVGs and isolated workers cannot load remote fonts.
    expect(svg).toContain('॥ शुभ विवाह ॥'); // Devanagari text rendered
    expect(svg).toContain('scale(0.8, 0.8)'); // Scaled Ganesha (80/100)
    expect(svg).toContain('scale(1.1, 0.9)'); // Scaled Doli (110/100, 90/100)
  });
});

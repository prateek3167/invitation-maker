import { describe, it, expect } from 'vitest';
import {
  createInvitation,
  templates,
  validateInvitation,
} from '../../packages/editor-core/document';
import {
  WEDDING_CEREMONIES,
  createEventCard,
  generateWeddingSuite,
  syncSuiteCoupleDetails,
  applyPaletteToSuite,
} from '../../packages/editor-core/suite';

describe('multi-card wedding suite', () => {
  const weddingTemplate = templates.find(t => t.occasion === 'Wedding') || templates[0];
  const baseInvitation = createInvitation(weddingTemplate);
  baseInvitation.fields.host = 'Ananya Sharma';
  baseInvitation.fields.partner = 'Vikram Singhania';

  it('defines the core Indian wedding ceremonies', () => {
    expect(WEDDING_CEREMONIES.length).toBeGreaterThanOrEqual(5);
    const ceremonyIds = WEDDING_CEREMONIES.map(c => c.id);
    expect(ceremonyIds).toContain('haldi');
    expect(ceremonyIds).toContain('mehndi');
    expect(ceremonyIds).toContain('sangeet');
    expect(ceremonyIds).toContain('shaadi');
    expect(ceremonyIds).toContain('save-the-date');
  });

  it('creates an event-specific card with preserved couple names', () => {
    const haldiCard = createEventCard(baseInvitation, 'haldi');
    validateInvitation(haldiCard);
    expect(haldiCard.fields.host).toBe('Ananya Sharma');
    expect(haldiCard.fields.partner).toBe('Vikram Singhania');
    expect(haldiCard.fields.heading).toBe('Shubh Haldi Ceremony');
    expect(haldiCard.eventTag).toBe('Shubh Haldi');
    expect(haldiCard.canvasElements?.length).toBeGreaterThan(0);
  });

  it('generates a full 5-card coordinated wedding suite', () => {
    const suite = generateWeddingSuite(baseInvitation);
    expect(suite).toHaveLength(5);
    for (const card of suite) {
      validateInvitation(card);
      expect(card.fields.host).toBe('Ananya Sharma');
      expect(card.fields.partner).toBe('Vikram Singhania');
      expect(card.canvasElements?.length).toBeGreaterThan(0);
    }
    const headings = suite.map(c => c.fields.heading);
    expect(headings.some(h => h.includes('Save'))).toBe(true);
    expect(headings.some(h => h.includes('Haldi'))).toBe(true);
    expect(headings.some(h => h.includes('Mehndi'))).toBe(true);
    expect(headings.some(h => h.includes('Sangeet'))).toBe(true);
    expect(headings.some(h => h.includes('Vivah'))).toBe(true);
  });

  it('synchronizes couple names across all suite cards when updated on one card', () => {
    const suite = generateWeddingSuite(baseInvitation);
    const modifiedFirstCard = {
      ...suite[0],
      fields: {
        ...suite[0].fields,
        host: 'Rhea Kapoor',
        partner: 'Arjun Mehra',
      },
    };

    const syncedSuite = syncSuiteCoupleDetails(suite, modifiedFirstCard);
    for (const card of syncedSuite) {
      expect(card.fields.host).toBe('Rhea Kapoor');
      expect(card.fields.partner).toBe('Arjun Mehra');
    }
  });

  it('applies a chosen luxury palette across all cards in the suite', () => {
    const suite = generateWeddingSuite(baseInvitation);
    const emeraldPalette = ['#14382c', '#fff9ee', '#c5a059'];
    const updatedSuite = applyPaletteToSuite(suite, emeraldPalette);

    for (const card of updatedSuite) {
      expect(card.palette).toEqual(emeraldPalette);
    }
  });
});

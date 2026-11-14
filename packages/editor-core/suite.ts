import type { Fields, Invitation } from './document';
import { decomposeTemplateToElements, syncElementsFromFields } from './canvas';

export interface WeddingCeremony {
  id: string;
  name: string;
  hindiName: string;
  heading: string;
  defaultTime: string;
  defaultPalette: [string, string, string];
  defaultMessage: string;
  iconEmoji: string;
}

export const WEDDING_CEREMONIES: WeddingCeremony[] = [
  {
    id: 'save-the-date',
    name: 'Save the Date',
    hindiName: '॥ श्री गणेशाय नमः ॥',
    heading: 'Save The Date',
    defaultTime: 'Save the Weekend',
    defaultPalette: ['#541212', '#fffaf0', '#d4af37'],
    defaultMessage: 'Two lives, two hearts, joined together in friendship, united forever in love.',
    iconEmoji: '💌',
  },
  {
    id: 'haldi',
    name: 'Shubh Haldi',
    hindiName: '॥ शुभ हल्दी उत्सव ॥',
    heading: 'Shubh Haldi Ceremony',
    defaultTime: '10:00 AM Onwards',
    defaultPalette: ['#7a450e', '#fffde8', '#e5a00d'],
    defaultMessage: 'Join us in anointing the couple with auspicious turmeric, laughter, and marigold blessings.',
    iconEmoji: '🌞',
  },
  {
    id: 'mehndi',
    name: 'Shubh Mehndi',
    hindiName: '॥ शुभ मेहंदी की रात ॥',
    heading: 'Mehndi Ki Raat',
    defaultTime: '4:00 PM Onwards',
    defaultPalette: ['#14382c', '#f5fcf7', '#c5a059'],
    defaultMessage: 'Let the henna blossom on hands and hearts. A vibrant evening of songs, dholak beats, and joy.',
    iconEmoji: '🌿',
  },
  {
    id: 'sangeet',
    name: 'Sangeet Night',
    hindiName: '॥ संगीत एवं नृत्य संध्या ॥',
    heading: 'Sangeet & Dance Celebration',
    defaultTime: '7:30 PM Onwards',
    defaultPalette: ['#182e43', '#f4f6fa', '#ba9a62'],
    defaultMessage: 'Put on your dancing shoes for an unforgettable night of musical beats, romance, and performances!',
    iconEmoji: '🎶',
  },
  {
    id: 'shaadi',
    name: 'Shubh Vivah',
    hindiName: '॥ शुभ विवाह ॥',
    heading: 'Shubh Vivah (Wedding Ceremony)',
    defaultTime: 'Baraat: 6:00 PM · Pheras: 8:15 PM',
    defaultPalette: ['#541212', '#fff8ee', '#d4af37'],
    defaultMessage: 'Cordially invite you to witness the sacred vows, holy fire phere, and auspicious union of our children.',
    iconEmoji: '👑',
  },
  {
    id: 'reception',
    name: 'Grand Reception',
    hindiName: '॥ प्रीतिभोज एवं स्वागत ॥',
    heading: 'Dinner & Wedding Reception',
    defaultTime: '8:00 PM Onwards',
    defaultPalette: ['#613b49', '#fff3f0', '#ba7c78'],
    defaultMessage: 'Celebrate the newlyweds over an evening of celebratory toasts, exquisite dinner, and royal music.',
    iconEmoji: '🥂',
  },
];

export function getCeremony(id: string): WeddingCeremony {
  return (
    WEDDING_CEREMONIES.find(c => c.id === id) || {
      id,
      name: 'Ceremony',
      hindiName: '॥ उत्सव ॥',
      heading: `${id} Celebration`,
      defaultTime: '6:00 PM Onwards',
      defaultPalette: ['#541212', '#fff8ee', '#d4af37'],
      defaultMessage: 'Together with their families cordially invite you to join the celebration.',
      iconEmoji: '✨',
    }
  );
}

/**
 * Creates a new event card for the wedding suite based on an existing invitation.
 */
export function createEventCard(
  baseDoc: Invitation,
  ceremonyId: string,
  options?: { preservePalette?: boolean; customTitle?: string }
): Invitation {
  const ceremony = getCeremony(ceremonyId);
  const now = new Date().toISOString();
  const cardId = crypto.randomUUID();

  const palette = options?.preservePalette
    ? [...baseDoc.palette]
    : [...ceremony.defaultPalette];

  const updatedFields: Fields = {
    ...baseDoc.fields,
    heading: ceremony.heading,
    time: ceremony.defaultTime,
    message: ceremony.defaultMessage,
  };

  const newDoc: Invitation = {
    schemaVersion: 1,
    id: cardId,
    templateId: baseDoc.templateId,
    title: options?.customTitle || `${baseDoc.fields.host} & ${baseDoc.fields.partner || 'Wedding'} · ${ceremony.name}`,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    fields: updatedFields,
    palette,
    font: baseDoc.font,
    format: baseDoc.format,
    photo: baseDoc.photo ? { ...baseDoc.photo } : null,
    portraits: baseDoc.portraits
      ? {
          bride: baseDoc.portraits.bride ? { ...baseDoc.portraits.bride } : null,
          groom: baseDoc.portraits.groom ? { ...baseDoc.portraits.groom } : null,
        }
      : undefined,
    templateSnapshot: baseDoc.templateSnapshot ? structuredClone(baseDoc.templateSnapshot) : undefined,
    eventTag: ceremony.name,
  };

  // Generate canvas elements matching the new event
  newDoc.canvasElements = decomposeTemplateToElements(newDoc);
  return newDoc;
}

/**
 * Generates the complete 5-card coordinated Indian Wedding Suite from a base invitation.
 */
export function generateWeddingSuite(baseDoc: Invitation): Invitation[] {
  const suiteEvents = ['save-the-date', 'haldi', 'mehndi', 'sangeet', 'shaadi'];
  const suite: Invitation[] = [];

  for (const eventId of suiteEvents) {
    const card = createEventCard(baseDoc, eventId);
    suite.push(card);
  }

  return suite;
}

/**
 * Synchronizes shared couple names and family details across all cards in the suite.
 */
export function syncSuiteCoupleDetails(
  suite: Invitation[],
  sourceCard: Invitation
): Invitation[] {
  const sharedHost = sourceCard.fields.host;
  const sharedPartner = sourceCard.fields.partner;

  return suite.map(card => {
    if (card.id === sourceCard.id) return sourceCard;
    if (card.fields.host === sharedHost && card.fields.partner === sharedPartner) return card;

    const updatedFields: Fields = {
      ...card.fields,
      host: sharedHost,
      partner: sharedPartner,
    };

    const updatedElements = card.canvasElements
      ? syncElementsFromFields(card.canvasElements, updatedFields)
      : undefined;

    return {
      ...card,
      fields: updatedFields,
      canvasElements: updatedElements,
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Applies a single luxury color palette across all cards in the suite.
 */
export function applyPaletteToSuite(
  suite: Invitation[],
  palette: string[]
): Invitation[] {
  return suite.map(card => {
    const updatedElements = (card.canvasElements || []).map(el => {
      if (el.type === 'background') return { ...el, fill: palette[1] };
      return el;
    });

    return {
      ...card,
      palette: [...palette],
      canvasElements: updatedElements,
      updatedAt: new Date().toISOString(),
    };
  });
}

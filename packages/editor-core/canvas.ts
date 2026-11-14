import { documentTemplate, type Fields, type Invitation } from './document';

export type CanvasElementType = 'text' | 'image' | 'shape' | 'ornament' | 'background';

export type FrameShape = 'rect' | 'circle' | 'arch' | 'oval';

export type CanvasElement = {
  id: string;
  type: CanvasElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees 0-360
  opacity?: number;  // 0-1
  locked?: boolean;
  hidden?: boolean;
  zIndex: number;

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  fieldBinding?: keyof Fields | 'badge' | 'footer' | 'ampersand';

  // Image / Photo properties
  src?: string;
  cropX?: number; // 0-100
  cropY?: number; // 0-100
  zoom?: number;  // 1-3
  frameShape?: FrameShape;
  filter?: 'none' | 'sepia' | 'vintage' | 'warm' | 'grayscale';
  slot?: 'single' | 'bride' | 'groom';
  photoSlot?: 'single' | 'bride' | 'groom';

  // Shape / Ornament properties
  shapeType?:
    | 'rect'
    | 'circle'
    | 'ellipse'
    | 'line'
    | 'star'
    | 'mandala'
    | 'kalash'
    | 'filigree'
    | 'toran'
    | 'lanterns'
    | 'peacock'
    | 'henna'
    | 'border'
    | 'divider'
    | 'ganesha_royal'
    | 'ganesha_minimal'
    | 'swastik'
    | 'om'
    | 'doli'
    | 'shehnai'
    | 'baarat_elephant'
    | 'havan_kund'
    | 'mangalsutra'
    | 'peacock_pair'
    | 'diya'
    | 'namaste'
    | 'marigold_garland'
    | 'template-decoration'
    | 'customSvg';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  svgContent?: string;
};

export const WEDDING_ELEMENT_TEMPLATES: Record<
  string,
  {
    name: string;
    width: number;
    height: number;
    shapeType: CanvasElement['shapeType'];
    svgContent?: string;
    category?: 'sacred' | 'ceremony' | 'decor' | 'general';
  }
> = {
  // Sacred & Auspicious Invocations
  ganesha_royal: {
    name: 'Lord Ganesha (Royal)',
    width: 80,
    height: 80,
    shapeType: 'ganesha_royal',
    category: 'sacred',
  },
  ganesha_minimal: {
    name: 'Lord Ganesha (Line Art)',
    width: 70,
    height: 70,
    shapeType: 'ganesha_minimal',
    category: 'sacred',
  },
  swastik: {
    name: 'Auspicious Swastika',
    width: 55,
    height: 55,
    shapeType: 'swastik',
    category: 'sacred',
  },
  om: {
    name: 'Sacred Pranava Om ॐ',
    width: 60,
    height: 60,
    shapeType: 'om',
    category: 'sacred',
  },
  kalash: {
    name: 'Pooja Kalash & Nariyal',
    width: 60,
    height: 60,
    shapeType: 'kalash',
    category: 'sacred',
  },
  mandala: {
    name: 'Sacred Mandala',
    width: 150,
    height: 150,
    shapeType: 'mandala',
    category: 'sacred',
  },

  // Wedding Ceremonies & Processions
  doli: {
    name: 'Royal Bridal Doli / Palki',
    width: 110,
    height: 90,
    shapeType: 'doli',
    category: 'ceremony',
  },
  shehnai: {
    name: 'Shehnai & Dholak Beats',
    width: 100,
    height: 85,
    shapeType: 'shehnai',
    category: 'ceremony',
  },
  baarat_elephant: {
    name: 'Royal Baarat Elephant',
    width: 105,
    height: 95,
    shapeType: 'baarat_elephant',
    category: 'ceremony',
  },
  havan_kund: {
    name: 'Saat Phere Havan Kund',
    width: 90,
    height: 80,
    shapeType: 'havan_kund',
    category: 'ceremony',
  },
  mangalsutra: {
    name: 'Mangalsutra & Sindoor Dani',
    width: 80,
    height: 75,
    shapeType: 'mangalsutra',
    category: 'ceremony',
  },

  // Royal Decor & Welcome Elements
  peacock_pair: {
    name: 'Mayur Yugam (Peacock Pair)',
    width: 120,
    height: 80,
    shapeType: 'peacock_pair',
    category: 'decor',
  },
  diya: {
    name: 'Auspicious Brass Diya',
    width: 65,
    height: 65,
    shapeType: 'diya',
    category: 'decor',
  },
  namaste: {
    name: 'Atithi Devo Bhava (Namaste)',
    width: 75,
    height: 75,
    shapeType: 'namaste',
    category: 'decor',
  },
  marigold_garland: {
    name: 'Genda Phool Hanging Ladi',
    width: 40,
    height: 160,
    shapeType: 'marigold_garland',
    category: 'decor',
  },
  toran: {
    name: 'Marigold Toran Garland',
    width: 620,
    height: 60,
    shapeType: 'toran',
    category: 'decor',
  },
  lanterns: {
    name: 'Palace Hanging Lanterns',
    width: 500,
    height: 140,
    shapeType: 'lanterns',
    category: 'decor',
  },
  peacock: {
    name: 'Imperial Peacock Feathers',
    width: 600,
    height: 90,
    shapeType: 'peacock',
    category: 'decor',
  },
  henna: {
    name: 'Henna Arabesque Flourish',
    width: 620,
    height: 890,
    shapeType: 'henna',
    category: 'decor',
  },
  divider: {
    name: 'Royal Sunburst Divider',
    width: 240,
    height: 20,
    shapeType: 'divider',
    category: 'decor',
  },
};

export function decomposeTemplateToElements(document: Invitation, artworkData?: string): CanvasElement[] {
  const template = documentTemplate(document);
  const [ink, paper, accent] = document.palette;
  const elements: CanvasElement[] = [];
  let zIndex = 1;

  // 1. Royal Template Decomposition
  if (template.royal) {
    const royal = template.royal;
    // Background layer
    elements.push({
      id: 'bg-artwork',
      type: 'background',
      name: 'Royal Palace Artwork',
      x: 0,
      y: 0,
      width: 700,
      height: 980,
      zIndex: zIndex++,
      locked: true,
      src: artworkData || `royal/${royal.artwork}`,
      fill: paper,
    });

    // Dual Portrait Frames
    const positions = [
      [[145, 300, 185, 235], [370, 300, 185, 235]],
      [[150, 315, 180, 215], [370, 315, 180, 215]],
      [[130, 290, 185, 215], [385, 330, 185, 215]],
      [[150, 315, 180, 180], [370, 315, 180, 180]],
      [[120, 295, 205, 240], [375, 295, 205, 240]],
    ][royal.composition];

    (['bride', 'groom'] as const).forEach((slot, index) => {
      const [x, y, w, h] = (royal.photoBoxes || positions)[index];
      const photo = document.portraits?.[slot];
      elements.push({
        id: `photo-${slot}`,
        type: 'image',
        name: slot === 'bride' ? 'Bride Photograph' : 'Groom Photograph',
        x,
        y,
        width: w,
        height: h,
        zIndex: zIndex++,
        slot,
        photoSlot: slot,
        src: photo?.data || '',
        cropX: photo?.x ?? 50,
        cropY: photo?.y ?? 50,
        zoom: photo?.zoom ?? 1,
        frameShape: royal.frame === 'oval' ? 'oval' : 'arch',
        stroke: accent,
        strokeWidth: 2.5,
      });
    });

    // Stationery Panel
    elements.push({
      id: 'stationery-panel',
      type: 'shape',
      name: 'Stationery Panel',
      x: 105,
      y: 570,
      width: 490,
      height: 344,
      zIndex: zIndex++,
      shapeType: 'rect',
      fill: paper,
      opacity: 0.94,
    });

    const nameY = royal.composition === 3 ? 582 : 605;
    const family = document.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif';

    // Top blessings badge
    elements.push({
      id: 'blessings-badge',
      type: 'text',
      name: 'Blessings Badge',
      x: 105,
      y: nameY - 26,
      width: 490,
      height: 24,
      zIndex: zIndex++,
      text: 'WITH THE BLESSINGS OF OUR FAMILIES',
      fontFamily: 'Arial, sans-serif',
      fontSize: 9,
      color: ink,
      textAlign: 'center',
      letterSpacing: 2,
      fieldBinding: 'badge',
    });

    // Couple Names
    elements.push({
      id: 'names-couple',
      type: 'text',
      name: 'Couple Names',
      x: 110,
      y: nameY + 6,
      width: 480,
      height: 48,
      zIndex: zIndex++,
      text: document.fields.partner ? `${document.fields.host} & ${document.fields.partner}` : document.fields.host,
      fontFamily: family,
      fontSize: 34,
      fontStyle: document.font === 'italic' ? 'italic' : 'normal',
      color: ink,
      textAlign: 'center',
      fieldBinding: 'host',
    });

    // Event Heading
    elements.push({
      id: 'heading-event',
      type: 'text',
      name: 'Event Heading',
      x: 110,
      y: nameY + 54,
      width: 480,
      height: 30,
      zIndex: zIndex++,
      text: document.fields.heading,
      fontFamily: family,
      fontSize: 17,
      fontStyle: 'italic',
      color: ink,
      textAlign: 'center',
      fieldBinding: 'heading',
    });

    // Gold Divider
    elements.push({
      id: 'divider-gold',
      type: 'ornament',
      name: 'Gold Accent Rule',
      x: 270,
      y: nameY + 86,
      width: 160,
      height: 6,
      zIndex: zIndex++,
      shapeType: 'divider',
      stroke: accent,
      strokeWidth: 1.4,
    });

    // Date
    elements.push({
      id: 'text-date',
      type: 'text',
      name: 'Event Date',
      x: 120,
      y: nameY + 104,
      width: 460,
      height: 22,
      zIndex: zIndex++,
      text: document.fields.date,
      fontFamily: family,
      fontSize: 12,
      color: ink,
      textAlign: 'center',
      fieldBinding: 'date',
    });

    // Time
    elements.push({
      id: 'text-time',
      type: 'text',
      name: 'Event Time',
      x: 120,
      y: nameY + 128,
      width: 460,
      height: 20,
      zIndex: zIndex++,
      text: document.fields.time,
      fontFamily: family,
      fontSize: 11,
      color: ink,
      textAlign: 'center',
      fieldBinding: 'time',
    });

    // Venue
    elements.push({
      id: 'text-venue',
      type: 'text',
      name: 'Venue Location',
      x: 120,
      y: nameY + 158,
      width: 460,
      height: 38,
      zIndex: zIndex++,
      text: document.fields.venue,
      fontFamily: family,
      fontSize: 12,
      color: ink,
      textAlign: 'center',
      fieldBinding: 'venue',
    });

    // Message
    elements.push({
      id: 'text-message',
      type: 'text',
      name: 'Personal Message',
      x: 120,
      y: nameY + 204,
      width: 460,
      height: 38,
      zIndex: zIndex++,
      text: document.fields.message,
      fontFamily: family,
      fontSize: 11,
      fontStyle: 'italic',
      color: ink,
      textAlign: 'center',
      fieldBinding: 'message',
    });

    // Footer
    elements.push({
      id: 'text-footer',
      type: 'text',
      name: 'Footer Tagline',
      x: 120,
      y: 900,
      width: 460,
      height: 18,
      zIndex: zIndex++,
      text: 'A MOMENT TO REMEMBER',
      fontFamily: 'Arial, sans-serif',
      fontSize: 8,
      color: ink,
      textAlign: 'center',
      letterSpacing: 2.2,
      fieldBinding: 'footer',
    });

    return elements;
  }

  // 2. Vector Template Decomposition
  const dark = [1, 3, 6, 9].includes(template.layout);
  const bg = dark ? ink : paper;
  const fg = dark ? paper : ink;
  const family = document.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif';
  const photo = template.photo;

  // Background
  elements.push({
    id: 'bg-solid',
    type: 'background',
    name: 'Canvas Background',
    x: 0,
    y: 0,
    width: 700,
    height: 980,
    zIndex: zIndex++,
    locked: true,
    fill: bg,
  });

  // Border & Decorative Layout Ornament
  const ornamentNames: Record<number, string> = {
    0: 'Maharaja Royal Darbar Borders',
    1: 'Modern Architectural Crosshairs',
    2: 'Mughal Botanical Foliage',
    3: 'Imperial Peacock Feathers & Border',
    4: 'Rajputana Jharokha Arch',
    5: 'Vintage Shubh Patrika Scrolls',
    6: 'Art Deco Geometric Borders',
    7: 'Sacred Lotus & Marigold Toran',
    8: 'Henna Arabesque Border & Paisleys',
    9: 'Palace Hanging Lanterns & Stars',
  };


  elements.push({
    id: 'decor-borders',
    type: 'ornament',
    name: ornamentNames[template.layout] || 'Decorative Border',
    x: 24,
    y: 24,
    width: 652,
    height: 932,
    zIndex: zIndex++,
    shapeType: 'template-decoration',
    stroke: accent,
    strokeWidth: 1.2,
    opacity: 0.85,
  });

  // Dynamic Event Badge
  const hUpper = document.fields.heading.toUpperCase();
  let topBadge = 'TOGETHER, LET’S CELEBRATE';
  let badgeIconShape: CanvasElement['shapeType'] = 'kalash';

  if (hUpper.includes('HALDI') || template.occasion === 'Haldi') {
    topBadge = '|| SHUBH HALDI UTSAV ||';
    badgeIconShape = 'toran';
  } else if (hUpper.includes('MEHNDI') || template.occasion === 'Mehndi') {
    topBadge = '|| SHUBH MEHNDI KI RAAT ||';
    badgeIconShape = 'henna';
  } else if (hUpper.includes('SANGEET') || template.occasion === 'Sangeet') {
    topBadge = '|| SANGEET & DANCE CELEBRATION ||';
    badgeIconShape = 'lanterns';
  } else if (hUpper.includes('SAGAAI') || hUpper.includes('ENGAGED') || template.occasion === 'Engagement') {
    topBadge = '|| THE ROYAL RING CEREMONY ||';
    badgeIconShape = 'mandala';
  } else if (template.occasion === 'Wedding' || hUpper.includes('WEDDING') || hUpper.includes('SHAADI') || hUpper.includes('VIVAH')) {
    topBadge = '|| SHREE GANESHAYA NAMAHA ||';
    badgeIconShape = 'kalash';
  }

  // Auspicious Icon
  elements.push({
    id: 'icon-auspicious',
    type: 'ornament',
    name: 'Auspicious Emblem',
    x: 320,
    y: photo ? 38 : 50,
    width: 60,
    height: 60,
    zIndex: zIndex++,
    shapeType: badgeIconShape,
    stroke: accent,
    fill: accent,
    opacity: 0.9,
  });

  // Top Badge Text
  elements.push({
    id: 'badge-top',
    type: 'text',
    name: 'Ceremony Top Badge',
    x: 100,
    y: photo ? 86 : 120,
    width: 500,
    height: 24,
    zIndex: zIndex++,
    text: topBadge,
    fontFamily: 'Arial, sans-serif',
    fontSize: 11,
    color: accent,
    textAlign: 'center',
    letterSpacing: 2.8,
    fieldBinding: 'badge',
  });

  // Names Position
  const nameY = photo ? 132 : 185;
  const nameSize = Math.min(photo ? 42 : 54, 520 / (Math.max(document.fields.host.length, document.fields.partner.length, 1) * 0.62));

  // Host Name
  elements.push({
    id: 'text-host',
    type: 'text',
    name: 'First Name / Host',
    x: 100,
    y: nameY,
    width: 500,
    height: nameSize * 1.3,
    zIndex: zIndex++,
    text: document.fields.host,
    fontFamily: family,
    fontSize: nameSize,
    fontStyle: document.font === 'italic' ? 'italic' : 'normal',
    color: fg,
    textAlign: 'center',
    fieldBinding: 'host',
  });

  if (document.fields.partner) {
    // Ampersand
    elements.push({
      id: 'text-ampersand',
      type: 'text',
      name: 'Ampersand Connector',
      x: 310,
      y: nameY + (photo ? 28 : 36),
      width: 80,
      height: 32,
      zIndex: zIndex++,
      text: '&',
      fontFamily: family,
      fontSize: photo ? 22 : 28,
      fontStyle: 'italic',
      color: accent,
      textAlign: 'center',
      fieldBinding: 'ampersand',
    });

    // Partner Name
    elements.push({
      id: 'text-partner',
      type: 'text',
      name: 'Second Name / Partner',
      x: 100,
      y: nameY + (photo ? 58 : 74),
      width: 500,
      height: nameSize * 1.3,
      zIndex: zIndex++,
      text: document.fields.partner,
      fontFamily: family,
      fontSize: nameSize,
      fontStyle: document.font === 'italic' ? 'italic' : 'normal',
      color: fg,
      textAlign: 'center',
      fieldBinding: 'partner',
    });
  }

  // Photo Frame or Sacred Mandala Centerpiece
  const photoW = 380, photoH = 320;
  const photoX = (700 - photoW) / 2;
  const photoY = 236;
  const frameShape: FrameShape = template.layout % 3 === 0 ? 'arch' : template.layout % 3 === 1 ? 'rect' : 'oval';

  if (photo) {
    elements.push({
      id: 'photo-single',
      type: 'image',
      name: 'Invitation Photograph',
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
      zIndex: zIndex++,
      slot: 'single',
      src: document.photo?.data || '',
      cropX: document.photo?.x ?? 50,
      cropY: document.photo?.y ?? 50,
      zoom: document.photo?.zoom ?? 1,
      frameShape,
      stroke: accent,
      strokeWidth: 2,
    });
  } else {
    // Sacred Mandala Centerpiece
    elements.push({
      id: 'centerpiece-mandala',
      type: 'ornament',
      name: 'Sacred Mandala Centerpiece',
      x: 275,
      y: 345,
      width: 150,
      height: 150,
      zIndex: zIndex++,
      shapeType: 'mandala',
      stroke: accent,
      fill: accent,
      opacity: 0.9,
    });
  }

  // Details
  const detailY = photo ? 585 : 550;

  // Event Heading
  elements.push({
    id: 'heading-main',
    type: 'text',
    name: 'Event Heading',
    x: 100,
    y: detailY,
    width: 500,
    height: 38,
    zIndex: zIndex++,
    text: document.fields.heading,
    fontFamily: family,
    fontSize: 22,
    fontStyle: 'italic',
    color: fg,
    textAlign: 'center',
    fieldBinding: 'heading',
  });

  // Divider
  elements.push({
    id: 'divider-center',
    type: 'ornament',
    name: 'Flourish Divider',
    x: 240,
    y: detailY + 38,
    width: 220,
    height: 12,
    zIndex: zIndex++,
    shapeType: 'divider',
    stroke: accent,
    fill: accent,
    opacity: 0.85,
  });

  // Date
  elements.push({
    id: 'text-date',
    type: 'text',
    name: 'Event Date',
    x: 100,
    y: detailY + 68,
    width: 500,
    height: 24,
    zIndex: zIndex++,
    text: document.fields.date,
    fontFamily: family,
    fontSize: 16,
    color: fg,
    textAlign: 'center',
    fieldBinding: 'date',
  });

  // Time
  elements.push({
    id: 'text-time',
    type: 'text',
    name: 'Event Time',
    x: 100,
    y: detailY + 98,
    width: 500,
    height: 22,
    zIndex: zIndex++,
    text: document.fields.time,
    fontFamily: family,
    fontSize: 14,
    color: fg,
    textAlign: 'center',
    fieldBinding: 'time',
  });

  // Venue
  elements.push({
    id: 'text-venue',
    type: 'text',
    name: 'Venue Location',
    x: 100,
    y: detailY + 134,
    width: 500,
    height: 48,
    zIndex: zIndex++,
    text: document.fields.venue,
    fontFamily: family,
    fontSize: 15,
    color: fg,
    textAlign: 'center',
    fieldBinding: 'venue',
  });

  // Message
  elements.push({
    id: 'text-message',
    type: 'text',
    name: 'Personal Message',
    x: 100,
    y: detailY + 196,
    width: 500,
    height: 48,
    zIndex: zIndex++,
    text: document.fields.message,
    fontFamily: family,
    fontSize: 13,
    fontStyle: 'italic',
    color: fg,
    textAlign: 'center',
    fieldBinding: 'message',
  });

  // Footer Tagline
  elements.push({
    id: 'text-footer',
    type: 'text',
    name: 'Footer Tagline',
    x: 100,
    y: 916,
    width: 500,
    height: 20,
    zIndex: zIndex++,
    text: 'A MOMENT TO REMEMBER',
    fontFamily: 'Arial, sans-serif',
    fontSize: 9,
    color: fg,
    textAlign: 'center',
    letterSpacing: 2.8,
    fieldBinding: 'footer',
  });

  return elements;
}

export function syncFieldsFromElements(elements: CanvasElement[], currentFields: Fields): Fields {
  const updated = { ...currentFields };
  for (const el of elements) {
    if (el.type === 'text' && el.fieldBinding && el.text !== undefined) {
      if (['host', 'partner', 'heading', 'date', 'time', 'venue', 'message'].includes(el.fieldBinding)) {
        if (el.id === 'names-couple') {
          const names = el.text.split(' & ');
          if (names.length === 2) { updated.host = names[0]; updated.partner = names[1]; }
        } else updated[el.fieldBinding as keyof Fields] = el.text;
      }
    }
  }
  return updated;
}

export function syncElementsFromFields(elements: CanvasElement[], fields: Fields): CanvasElement[] {
  return elements.map(el => {
    if (el.type === 'text' && el.fieldBinding && ['host', 'partner', 'heading', 'date', 'time', 'venue', 'message'].includes(el.fieldBinding)) {
      return { ...el, text: el.id === 'names-couple' ? `${fields.host} & ${fields.partner}` : fields[el.fieldBinding as keyof Fields] };
    }
    return el;
  });
}

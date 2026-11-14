import { documentTemplate, presets, validateInvitation, type Invitation } from '../editor-core/document';
import { getTraditionalOrnamentSvg } from './traditional-elements';

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
function lines(text: string, max: number): string[] {
  const result: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const pieces = word.match(new RegExp(`.{1,${max}}`, 'gu')) || [''];
      for (const piece of pieces) {
        if (line && line.length + piece.length + 1 > max) { result.push(line); line = ''; }
        line += (line ? ' ' : '') + piece;
      }
    }
    result.push(line);
  }
  return result;
}

function text(value: string, y: number, size: number, color: string, max = 40, family = 'Georgia, serif', italic = false, spacing = 0): string {
  const rows = lines(value, max);
  const adjusted = Math.min(size, rows.length > 4 ? size * 4 / rows.length : size);
  return `<text text-anchor="middle" fill="${color}" font-family="${family}" font-size="${adjusted}" font-style="${italic ? 'italic' : 'normal'}" letter-spacing="${spacing}">${rows.map((row, i) => `<tspan x="350" y="${y + i * adjusted * 1.22}">${esc(row)}</tspan>`).join('')}</text>`;
}

/* =========================================================================
   ORNAMENTAL VECTOR ASSETS & BORDERS
   ========================================================================= */

function cornerFiligree(x: number, y: number, scaleX: number, scaleY: number, color: string): string {
  return `<g transform="translate(${x},${y}) scale(${scaleX},${scaleY})" stroke="${color}" fill="none" stroke-width="1.2" opacity="0.85">
    <path d="M0,0 Q32,4 48,28 Q32,46 14,36 Q0,24 0,0Z" fill="${color}" fill-opacity="0.14"/>
    <path d="M0,0 Q38,0 66,28 Q66,66 28,66 Q0,38 0,0"/>
    <path d="M6,6 Q32,10 46,36 Q36,54 18,48"/>
    <circle cx="26" cy="26" r="3.2" fill="${color}"/>
    <circle cx="46" cy="18" r="2" fill="${color}"/>
    <circle cx="18" cy="46" r="2" fill="${color}"/>
  </g>`;
}

function auspiciousKalash(color: string): string {
  return `<g stroke="${color}" fill="none" stroke-width="1.3" opacity="0.92">
    <path d="M341,58 Q350,44 359,58 Q368,68 350,80 Q332,68 341,58Z" fill="${color}" fill-opacity="0.25"/>
    <path d="M338,80 Q350,76 362,80 L359,96 Q350,100 341,96 Z" fill="${color}" fill-opacity="0.32"/>
    <path d="M335,70 Q322,62 320,52 Q332,54 338,66"/>
    <path d="M365,70 Q378,62 380,52 Q368,54 362,66"/>
    <circle cx="350" cy="50" r="3" fill="${color}"/>
  </g>`;
}

function royalMandalaCenterpiece(cx: number, cy: number, r: number, color: string): string {
  const petals: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * 360) / 16;
    petals.push(`<ellipse cx="${cx}" cy="${cy - r * 0.72}" rx="${r * 0.14}" ry="${r * 0.32}" transform="rotate(${angle} ${cx} ${cy})" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="1.1"/>`);
  }
  return `<g opacity="0.9">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.4" stroke-dasharray="3 4"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.88}" fill="none" stroke="${color}" stroke-width="1"/>
    ${petals.join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="1.3"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${color}" fill-opacity="0.5" stroke="${color}" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.08}" fill="${color}"/>
  </g>`;
}

function botanicalFoliage(accent: string): string {
  return `<g fill="none" stroke="${accent}" stroke-width="1.3" opacity="0.82">
    <path d="M40 220Q140 140 110 40M40 120Q100 90 150 30M660 760Q580 840 590 940M660 860Q600 880 550 950"/>
    ${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${35 + i * 14}" cy="${190 - i * 24}" rx="11" ry="22" transform="rotate(${32 + i * 8} ${35 + i * 14} ${190 - i * 24})" fill="${accent}" fill-opacity="0.12"/><ellipse cx="${665 - i * 14}" cy="${780 + i * 24}" rx="11" ry="22" transform="rotate(${32 + i * 8} ${665 - i * 14} ${780 + i * 24})" fill="${accent}" fill-opacity="0.12"/>`).join('')}
    <path d="M48 48L652 48M48 932L652 932" stroke-dasharray="4 6" opacity="0.6"/>
  </g>`;
}

function peacockPlumes(color: string): string {
  return `<g stroke="${color}" fill="none" stroke-width="1.2" opacity="0.85">
    <!-- Top Left Peacock Feather -->
    <path d="M50 80 Q100 40 180 55 Q130 90 70 120" />
    <ellipse cx="140" cy="62" rx="18" ry="12" transform="rotate(-15 140 62)" fill="${color}" fill-opacity="0.2"/>
    <circle cx="140" cy="62" r="5" fill="${color}" fill-opacity="0.6"/>
    <!-- Top Right Peacock Feather -->
    <path d="M650 80 Q600 40 520 55 Q570 90 630 120" />
    <ellipse cx="560" cy="62" rx="18" ry="12" transform="rotate(15 560 62)" fill="${color}" fill-opacity="0.2"/>
    <circle cx="560" cy="62" r="5" fill="${color}" fill-opacity="0.6"/>
    <!-- Radiating Starlight Dots -->
    <g fill="${color}" opacity="0.75">
      <circle cx="350" cy="45" r="2.5"/><circle cx="330" cy="48" r="1.5"/><circle cx="370" cy="48" r="1.5"/>
      <circle cx="350" cy="935" r="2.5"/><circle cx="330" cy="932" r="1.5"/><circle cx="370" cy="932" r="1.5"/>
    </g>
  </g>`;
}

function hangingLanterns(color: string): string {
  return `<g stroke="${color}" fill="none" stroke-width="1.2" opacity="0.85">
    <!-- Left Lantern -->
    <line x1="120" y1="40" x2="120" y2="120" stroke-dasharray="2 3"/>
    <polygon points="120,120 135,135 130,165 110,165 105,135" fill="${color}" fill-opacity="0.18"/>
    <circle cx="120" cy="148" r="4" fill="${color}"/>
    <line x1="120" y1="165" x2="120" y2="180"/>
    <!-- Right Lantern -->
    <line x1="580" y1="40" x2="580" y2="120" stroke-dasharray="2 3"/>
    <polygon points="580,120 595,135 590,165 570,165 565,135" fill="${color}" fill-opacity="0.18"/>
    <circle cx="580" cy="148" r="4" fill="${color}"/>
    <line x1="580" y1="165" x2="580" y2="180"/>
    <!-- Inner Festive Draped Swags -->
    <path d="M120 80 Q350 120 580 80" stroke-dasharray="4 4" opacity="0.6"/>
  </g>`;
}

function marigoldToran(color: string): string {
  return `<g stroke="${color}" fill="none" stroke-width="1.2" opacity="0.88">
    <path d="M40 50 Q195 95 350 60 Q505 95 660 50" stroke-width="1.4"/>
    ${[100, 180, 260, 350, 440, 520, 600].map(x => `
      <circle cx="${x}" cy="${68 + Math.sin(x) * 6}" r="7" fill="${color}" fill-opacity="0.3"/>
      <circle cx="${x}" cy="${68 + Math.sin(x) * 6}" r="3.5" fill="${color}"/>
      <line x1="${x}" y1="${75 + Math.sin(x) * 6}" x2="${x}" y2="${90 + Math.sin(x) * 6}"/>
      <polygon points="${x - 4},${90 + Math.sin(x) * 6} ${x + 4},${90 + Math.sin(x) * 6} ${x},${98 + Math.sin(x) * 6}" fill="${color}"/>
    `).join('')}
  </g>`;
}

function hennaArabesque(color: string): string {
  return `<g stroke="${color}" fill="none" stroke-width="1.2" opacity="0.82">
    <!-- Paisley corners -->
    <path d="M48 48 Q90 52 110 85 Q95 120 60 105 Q45 95 48 48Z" fill="${color}" fill-opacity="0.15"/>
    <path d="M652 48 Q610 52 590 85 Q605 120 640 105 Q655 95 652 48Z" fill="${color}" fill-opacity="0.15"/>
    <path d="M48 932 Q90 928 110 895 Q95 860 60 875 Q45 885 48 932Z" fill="${color}" fill-opacity="0.15"/>
    <path d="M652 932 Q610 928 590 895 Q605 860 640 875 Q655 885 652 932Z" fill="${color}" fill-opacity="0.15"/>
    <!-- Henna beaded rim -->
    <rect x="42" y="42" width="616" height="896" stroke-dasharray="3 5" opacity="0.6"/>
  </g>`;
}

function artDecoBorders(accent: string): string {
  return `<g stroke="${accent}" fill="none" stroke-width="1.3" opacity="0.85">
    <rect x="36" y="36" width="628" height="908"/>
    <rect x="44" y="44" width="612" height="892" stroke-dasharray="6 3"/>
    <!-- Stepped Deco Corners -->
    <path d="M36 70 L70 70 L70 36 M664 70 L630 70 L630 36 M36 910 L70 910 L70 944 M664 910 L630 910 L630 944"/>
    <polygon points="53,53 58,45 66,53 58,61" fill="${accent}"/>
    <polygon points="647,53 642,45 634,53 642,61" fill="${accent}"/>
    <polygon points="53,927 58,919 66,927 58,935" fill="${accent}"/>
    <polygon points="647,927 642,919 634,927 642,935" fill="${accent}"/>
  </g>`;
}

/* =========================================================================
   MAIN SVG RENDERER (SHARED ACROSS PREVIEW, DOWNLOAD & EXPORT WORKER)
   ========================================================================= */

export function renderSvg(d: Invitation, artworkData?: string): string {
  validateInvitation(d);
  if (d.photo?.data.startsWith('asset:')) throw new Error('Resolve the private photo before rendering.');
  if (d.canvasElements && d.canvasElements.length > 0) return renderFromCanvasElements(d, artworkData);
  const template = documentTemplate(d), [ink, paper, accent] = d.palette;
  if (template.royal) return renderRoyal(d, artworkData);

  const dark = [1, 3, 6, 9].includes(template.layout);
  const bg = dark ? ink : paper, fg = dark ? paper : ink;
  const family = d.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif';
  const italic = d.font === 'italic';
  const photo = template.photo;

  // Frame Shapes
  const frame = template.layout % 3 === 0 ? 'arch' : template.layout % 3 === 1 ? 'rect' : 'oval';
  const photoY = 228, photoH = 320, photoW = 380;
  const photoX = (700 - photoW) / 2;

  let clip = `<rect x="${photoX}" y="${photoY}" width="${photoW}" height="${photoH}" rx="8"/>`;
  let frameBorder = `<rect x="${photoX}" y="${photoY}" width="${photoW}" height="${photoH}" rx="8" fill="none" stroke="${accent}" stroke-width="2"/>`;

  if (frame === 'oval') {
    clip = `<ellipse cx="350" cy="${photoY + photoH / 2}" rx="${photoW / 2}" ry="${photoH / 2}"/>`;
    frameBorder = `<ellipse cx="350" cy="${photoY + photoH / 2}" rx="${photoW / 2}" ry="${photoH / 2}" fill="none" stroke="${accent}" stroke-width="2"/>`;
  } else if (frame === 'arch') {
    const r = photoW / 2;
    clip = `<path d="M${photoX} ${photoY + photoH}V${photoY + r}A${r} ${r} 0 0 1 ${photoX + photoW} ${photoY + r}V${photoY + photoH}Z"/>`;
    frameBorder = `<path d="M${photoX} ${photoY + photoH}V${photoY + r}A${r} ${r} 0 0 1 ${photoX + photoW} ${photoY + r}V${photoY + photoH}Z" fill="none" stroke="${accent}" stroke-width="2"/>`;
  }

  // Photo Image or High-End Silhouette Placeholder
  const image = d.photo
    ? `<image href="${esc(d.photo.data)}" x="${photoX - photoW * (d.photo.zoom - 1) * d.photo.x / 100}" y="${photoY - photoH * (d.photo.zoom - 1) * d.photo.y / 100}" width="${photoW * d.photo.zoom}" height="${photoH * d.photo.zoom}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${photoX}" y="${photoY}" width="${photoW}" height="${photoH}" fill="${paper}" opacity="0.95"/>
       <g stroke="${accent}" fill="none" stroke-width="1.3" opacity="0.8">
         <circle cx="350" cy="${photoY + photoH * 0.38}" r="${photoW * 0.14}" fill="${accent}" fill-opacity="0.22"/>
         <path d="M${350 - photoW * 0.22} ${photoY + photoH * 0.78} Q${350 - photoW * 0.2} ${photoY + photoH * 0.54} 350 ${photoY + photoH * 0.56} Q${350 + photoW * 0.2} ${photoY + photoH * 0.54} ${350 + photoW * 0.22} ${photoY + photoH * 0.78} Z" fill="${accent}" fill-opacity="0.26"/>
       </g>
       <text text-anchor="middle" x="350" y="${photoY + photoH * 0.88}" fill="${fg}" font-family="Arial, sans-serif" font-size="11" letter-spacing="2.5" opacity="0.85">ADD COUPLE PHOTOGRAPH</text>`;

  // Dynamic Event Top Badge
  const hUpper = d.fields.heading.toUpperCase();
  let topBadge = 'TOGETHER, LET’S CELEBRATE';
  let auspiciousIcon = '';
  if (hUpper.includes('HALDI') || template.occasion === 'Haldi') {
    topBadge = '|| SHUBH HALDI UTSAV ||';
    auspiciousIcon = marigoldToran(accent);
  } else if (hUpper.includes('MEHNDI') || template.occasion === 'Mehndi') {
    topBadge = '|| SHUBH MEHNDI KI RAAT ||';
    auspiciousIcon = hennaArabesque(accent);
  } else if (hUpper.includes('SANGEET') || template.occasion === 'Sangeet') {
    topBadge = '|| SANGEET & DANCE CELEBRATION ||';
    auspiciousIcon = hangingLanterns(accent);
  } else if (hUpper.includes('SAGAAI') || hUpper.includes('ENGAGED') || template.occasion === 'Engagement') {
    topBadge = '|| THE ROYAL RING CEREMONY ||';
    auspiciousIcon = `<g stroke="${accent}" fill="none" stroke-width="1.3" opacity="0.85"><circle cx="343" cy="66" r="9"/><circle cx="357" cy="66" r="9"/></g>`;
  } else if (template.occasion === 'Wedding' || hUpper.includes('WEDDING') || hUpper.includes('SHAADI') || hUpper.includes('VIVAH')) {
    topBadge = '|| SHREE GANESHAYA NAMAHA ||';
    auspiciousIcon = auspiciousKalash(accent);
  }

  // Layout Decorations
  let decorations = '';
  if (template.layout === 0) {
    // Royal Rajputana Heritage
    decorations = `${cornerFiligree(32, 32, 1, 1, accent)}${cornerFiligree(668, 32, -1, 1, accent)}${cornerFiligree(32, 948, 1, -1, accent)}${cornerFiligree(668, 948, -1, -1, accent)}
      <rect x="32" y="32" width="636" height="916" fill="none" stroke="${accent}" stroke-width="1.4"/>
      <rect x="42" y="42" width="616" height="896" fill="none" stroke="${accent}" stroke-dasharray="3 4" opacity="0.75"/>`;
  } else if (template.layout === 1) {
    // Modern Editorial Luxury
    decorations = `<rect x="36" y="36" width="628" height="908" fill="none" stroke="${accent}" stroke-width="1.1"/>
      <line x1="24" y1="36" x2="676" y2="36" stroke="${accent}" stroke-width="0.8" opacity="0.6"/>
      <line x1="24" y1="944" x2="676" y2="944" stroke="${accent}" stroke-width="0.8" opacity="0.6"/>
      <line x1="36" y1="24" x2="36" y2="956" stroke="${accent}" stroke-width="0.8" opacity="0.6"/>
      <line x1="664" y1="24" x2="664" y2="956" stroke="${accent}" stroke-width="0.8" opacity="0.6"/>`;
  } else if (template.layout === 2) {
    // Botanical Romance & Garden
    decorations = botanicalFoliage(accent);
  } else if (template.layout === 3) {
    // Midnight Luxe & Peacock
    decorations = `${peacockPlumes(accent)}
      <rect x="34" y="34" width="632" height="912" fill="none" stroke="${accent}" stroke-width="1.2"/>
      <rect x="44" y="44" width="612" height="892" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.5"/>`;
  } else if (template.layout === 4) {
    // Rajputana Jharokha
    decorations = `${cornerFiligree(35, 35, 0.85, 0.85, accent)}${cornerFiligree(665, 35, -0.85, 0.85, accent)}${cornerFiligree(35, 945, 0.85, -0.85, accent)}${cornerFiligree(665, 945, -0.85, -0.85, accent)}
      <path d="M75 260V220A275 200 0 0 1 625 220V850" fill="none" stroke="${accent}" opacity="0.6"/>
      <rect x="34" y="34" width="632" height="912" fill="none" stroke="${accent}" stroke-width="1.3"/>`;
  } else if (template.layout === 5) {
    // Vintage Royal Scroll
    decorations = `${cornerFiligree(30, 30, 1.1, 1.1, accent)}${cornerFiligree(670, 30, -1.1, 1.1, accent)}${cornerFiligree(30, 950, 1.1, -1.1, accent)}${cornerFiligree(670, 950, -1.1, -1.1, accent)}
      <rect x="34" y="34" width="632" height="912" fill="none" stroke="${accent}" stroke-width="1.2"/>
      <path d="M45 170L350 50L655 170M45 810L350 930L655 810" fill="none" stroke="${accent}" opacity="0.5"/>`;
  } else if (template.layout === 6) {
    // Art Deco Gala
    decorations = artDecoBorders(accent);
  } else if (template.layout === 7) {
    // Sacred Lotus & Mandap
    decorations = `${marigoldToran(accent)}
      <rect x="36" y="36" width="628" height="908" fill="none" stroke="${accent}" stroke-width="1.3"/>
      <circle cx="350" cy="50" r="14" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-width="1"/>`;
  } else if (template.layout === 8) {
    // Festive Mehndi Arabesque
    decorations = `${hennaArabesque(accent)}
      <rect x="34" y="34" width="632" height="912" fill="none" stroke="${accent}" stroke-width="1.2"/>`;
  } else {
    // Starlit Sangeet Night (9)
    decorations = `${hangingLanterns(accent)}
      <rect x="34" y="34" width="632" height="912" fill="none" stroke="${accent}" stroke-width="1.2"/>
      <rect x="44" y="44" width="612" height="892" fill="none" stroke="${accent}" stroke-dasharray="4 6" opacity="0.6"/>`;
  }

  // Names Position & Styling
  const nameY = photo ? 138 : 250;
  const nameSize = Math.min(photo ? 44 : 64, 520 / (Math.max(d.fields.host.length, d.fields.partner.length, 1) * 0.62));
  const names = d.fields.partner
    ? `${text(d.fields.host, nameY, nameSize, fg, 300, family, italic)}${text('&', nameY + (photo ? 32 : 52), photo ? 24 : 34, accent, 40, family, true)}${text(d.fields.partner, nameY + (photo ? 74 : 115), nameSize, fg, 300, family, italic)}`
    : text(d.fields.host, nameY + (photo ? 35 : 40), nameSize, fg, 300, family, italic);

  // Non-Photo Centerpiece
  const centerpiece = !photo
    ? `<g transform="translate(0, 420)">${royalMandalaCenterpiece(350, 0, 72, accent)}</g>`
    : '';

  // Details Position
  const detailY = photo ? 596 : 565;

  // Elegant Divider
  const divider = `<g stroke="${accent}" opacity="0.85">
    <path d="M260 ${detailY + 36}h60 M380 ${detailY + 36}h60" stroke-width="1.2"/>
    <circle cx="350" cy="${detailY + 36}" r="4" fill="${accent}"/>
    <circle cx="334" cy="${detailY + 36}" r="2" fill="${accent}"/>
    <circle cx="366" cy="${detailY + 36}" r="2" fill="${accent}"/>
  </g>`;

  const core = `<rect width="700" height="980" fill="${bg}"/>
    ${decorations}
    ${auspiciousIcon}
    ${text(topBadge, photo ? 76 : 175, 11, accent, 60, 'Arial, sans-serif', false, 3)}
    ${names}
    ${photo ? `<defs><clipPath id="photo">${clip}</clipPath></defs><g clip-path="url(#photo)">${image}</g>${frameBorder}` : centerpiece}
    ${text(d.fields.heading, detailY, 23, fg, 38, family, true)}
    ${divider}
    ${text(d.fields.date, detailY + 80, 16, fg, 45, family)}
    ${text(d.fields.time, detailY + 112, 14, fg, 50, family)}
    ${text(d.fields.venue, detailY + 160, 15, fg, 45, family)}
    ${text(d.fields.message, detailY + 236, 13, fg, 55, family, true)}
    ${text('A MOMENT TO REMEMBER', 912, 9, fg, 50, 'Arial, sans-serif', false, 3)}`;

  const { width, height } = presets[d.format];
  const ratio = width / height;
  const viewW = ratio >= 700 / 980 ? 980 * ratio : 700;
  const viewH = ratio >= 700 / 980 ? 980 : 700 / ratio;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${-(viewW - 700) / 2} ${-(viewH - 980) / 2} ${viewW} ${viewH}" role="img" aria-label="${esc(d.fields.heading)}"><rect x="${-(viewW - 700) / 2}" y="${-(viewH - 980) / 2}" width="${viewW}" height="${viewH}" fill="${bg}"/>${core}</svg>`;
}

export const svgUri = (d: Invitation, artworkData?: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderSvg(d, artworkData))}`;

function renderRoyal(d: Invitation, artworkData?: string): string {
  if (!artworkData || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(artworkData)) throw new Error('Royal artwork must be embedded before rendering.');
  const royal = documentTemplate(d).royal!, [ink, paper, gold] = d.palette;
  const positions = [ [[145,300,185,235],[370,300,185,235]], [[150,315,180,215],[370,315,180,215]], [[130,290,185,215],[385,330,185,215]], [[150,315,180,180],[370,315,180,180]], [[120,295,205,240],[375,295,205,240]] ][royal.composition];
  const frames = (['bride','groom'] as const).map((slot, index) => {
    const [x,y,w,h] = (royal.photoBoxes || positions)[index], photo = d.portraits?.[slot], id = `royal-${slot}`;
    if (photo?.data.startsWith('asset:')) throw new Error('Resolve the private portrait before rendering.');
    const shape = royal.frame === 'oval' ? `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}"/>` : `<path d="M${x} ${y+h}V${y+w/2}A${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2}V${y+h}Z"/>`;
    const content = photo ? `<image href="${esc(photo.data)}" x="${x-w*(photo.zoom-1)*photo.x/100}" y="${y-h*(photo.zoom-1)*photo.y/100}" width="${w*photo.zoom}" height="${h*photo.zoom}" preserveAspectRatio="xMidYMid slice"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${paper}"/><circle cx="${x+w/2}" cy="${y+h*.37}" r="${w*.16}" fill="${gold}" opacity=".38"/><path d="M${x+w*.18} ${y+h*.85}Q${x+w*.18} ${y+h*.5} ${x+w/2} ${y+h*.52}Q${x+w*.82} ${y+h*.5} ${x+w*.82} ${y+h*.85}Z" fill="${gold}" opacity=".3"/>`;
    return `<defs><clipPath id="${id}">${shape}</clipPath></defs><g clip-path="url(#${id})">${content}</g><g fill="none" stroke="${gold}" stroke-width="2.5">${shape}</g>`;
  }).join('');
  const family = d.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif';
  const joinedNames = `${d.fields.host}${d.fields.partner ? ' & '+d.fields.partner : ''}`;
  const nameSize = Math.min(37, 480/(Math.max(joinedNames.length,1)*.54));
  const nameY = royal.composition === 3 ? 582 : 605;
  const headingExtra = lines(d.fields.heading,42).length > 1 ? 18 : 0;
  const panel = royal.composition % 2 === 0 ? `<rect x="105" y="570" width="490" height="344" rx="12" fill="${paper}" opacity=".94"/>` : `<path d="M105 584Q350 550 595 584V915H105Z" fill="${paper}" opacity=".95"/>`;
  const core = `<image href="${artworkData}" width="700" height="980" preserveAspectRatio="xMidYMid slice"/>${frames}${panel}${text('WITH THE BLESSINGS OF OUR FAMILIES',nameY-16,8,ink,60,'Arial, sans-serif',false,1.8)}${text(joinedNames,nameY+27,nameSize,ink,100,family,d.font==='italic')}${text(d.fields.heading,nameY+70,17,ink,42,family,true)}<path d="M290 ${nameY+90+headingExtra}h120" stroke="${gold}" stroke-width="1.4"/>${text(d.fields.date,nameY+118+headingExtra,12,ink,50,family)}${text(d.fields.time,nameY+143+headingExtra,10,ink,60,family)}${text(d.fields.venue,nameY+178+headingExtra,12,ink,48,family)}${text(d.fields.message,nameY+218+headingExtra,10,ink,58,family,true)}${text('A MOMENT TO REMEMBER',900,7,ink,50,'Arial, sans-serif',false,2)}`;
  const {width,height} = presets[d.format], ratio = width/height, viewW = ratio >=700/980?980*ratio:700, viewH = ratio>=700/980?980:700/ratio;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${-(viewW-700)/2} ${-(viewH-980)/2} ${viewW} ${viewH}" role="img" aria-label="${esc(d.fields.heading)}"><rect x="${-(viewW-700)/2}" y="${-(viewH-980)/2}" width="${viewW}" height="${viewH}" fill="${paper}"/>${core}</svg>`;
}

export function renderFromCanvasElements(d: Invitation, artworkData?: string): string {
  const [ink, paper, accent] = d.palette;
  const elements = [...(d.canvasElements || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const defs: string[] = [
    `<style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&amp;family=Great+Vibes&amp;family=Kalam:wght@400;700&amp;family=Noto+Sans+Devanagari:wght@400;600&amp;family=Noto+Serif+Devanagari:wght@400;600;700&amp;family=Playfair+Display:ital,wght@0,600;1,400&amp;family=Rozha+One&amp;family=Tiro+Devanagari+Hindi:ital@0;1&amp;family=Yatra+One&amp;display=swap');
    </style>`
  ];
  const body: string[] = [];

  for (const el of elements) {
    if (el.hidden) continue;
    const opacity = el.opacity ?? 1;
    const rot = el.rotation || 0;
    const transform = rot !== 0 ? `transform="rotate(${rot} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : '';

    if (el.type === 'background') {
      if (el.src && artworkData) {
        body.push(`<image href="${esc(artworkData)}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>`);
      } else if (el.src && /^data:image\//.test(el.src)) {
        body.push(`<image href="${esc(el.src)}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>`);
      } else {
        body.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill || paper}" opacity="${opacity}"/>`);
      }
    } else if (el.type === 'image') {
      const clipId = `clip-${el.id}`;
      let clipShape = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8"/>`;
      if (el.frameShape === 'oval') {
        clipShape = `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}"/>`;
      } else if (el.frameShape === 'circle') {
        clipShape = `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${Math.min(el.width, el.height) / 2}"/>`;
      } else if (el.frameShape === 'arch') {
        const r = el.width / 2;
        clipShape = `<path d="M${el.x} ${el.y + el.height}V${el.y + r}A${r} ${r} 0 0 1 ${el.x + el.width} ${el.y + r}V${el.y + el.height}Z"/>`;
      }
      defs.push(`<clipPath id="${clipId}">${clipShape}</clipPath>`);

      const imageSrc =
        el.src ||
        (el.slot === 'bride' || el.photoSlot === 'bride'
          ? d.portraits?.bride?.data
          : el.slot === 'groom' || el.photoSlot === 'groom'
          ? d.portraits?.groom?.data
          : d.photo?.data);

      if (imageSrc && imageSrc.startsWith('data:image/')) {
        const zoom =
          el.zoom ||
          (el.slot === 'bride'
            ? d.portraits?.bride?.zoom
            : el.slot === 'groom'
            ? d.portraits?.groom?.zoom
            : d.photo?.zoom) ||
          1;
        const cropX =
          el.cropX ??
          (el.slot === 'bride'
            ? d.portraits?.bride?.x
            : el.slot === 'groom'
            ? d.portraits?.groom?.x
            : d.photo?.x) ??
          50;
        const cropY =
          el.cropY ??
          (el.slot === 'bride'
            ? d.portraits?.bride?.y
            : el.slot === 'groom'
            ? d.portraits?.groom?.y
            : d.photo?.y) ??
          50;
        const imgX = el.x - el.width * (zoom - 1) * cropX / 100;
        const imgY = el.y - el.height * (zoom - 1) * cropY / 100;
        body.push(`<g ${transform} opacity="${opacity}">
          <g clip-path="url(#${clipId})">
            <image href="${esc(imageSrc)}" x="${imgX}" y="${imgY}" width="${el.width * zoom}" height="${el.height * zoom}" preserveAspectRatio="xMidYMid slice"/>
          </g>
          <g fill="none" stroke="${el.stroke || accent}" stroke-width="${el.strokeWidth || 2}">${clipShape}</g>
        </g>`);
      } else {
        body.push(`<g ${transform} opacity="${opacity}">
          <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${paper}" opacity="0.95"/>
          <g stroke="${el.stroke || accent}" fill="none" stroke-width="1.3" opacity="0.8">
            <circle cx="${el.x + el.width / 2}" cy="${el.y + el.height * 0.38}" r="${el.width * 0.14}" fill="${el.stroke || accent}" fill-opacity="0.22"/>
            <path d="M${el.x + el.width * 0.28} ${el.y + el.height * 0.78} Q${el.x + el.width * 0.3} ${el.y + el.height * 0.54} ${el.x + el.width / 2} ${el.y + el.height * 0.56} Q${el.x + el.width * 0.7} ${el.y + el.height * 0.54} ${el.x + el.width * 0.72} ${el.y + el.height * 0.78} Z" fill="${el.stroke || accent}" fill-opacity="0.26"/>
          </g>
          <text text-anchor="middle" x="${el.x + el.width / 2}" y="${el.y + el.height * 0.88}" fill="${el.stroke || accent}" font-family="Arial, sans-serif" font-size="10" letter-spacing="2" opacity="0.85">ADD PHOTOGRAPH</text>
          <g fill="none" stroke="${el.stroke || accent}" stroke-width="${el.strokeWidth || 2}">${clipShape}</g>
        </g>`);
      }
    } else if (el.type === 'text') {
      const family = el.fontFamily || (d.font === 'modern' ? 'Arial, sans-serif' : 'Georgia, serif');
      const size = el.fontSize || 16;
      const weight = el.fontWeight || 'normal';
      const style = el.fontStyle || (d.font === 'italic' ? 'italic' : 'normal');
      const color = el.color || ink;
      const align = el.textAlign || 'center';
      const spacing = el.letterSpacing || 0;
      const textX = align === 'center' ? el.x + el.width / 2 : align === 'right' ? el.x + el.width : el.x;
      const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
      const rows = lines(el.text || '', Math.max(8, Math.floor(el.width / (size * 0.5))));

      body.push(`<g ${transform} opacity="${opacity}">
        <text text-anchor="${anchor}" fill="${color}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${style}" letter-spacing="${spacing}">
          ${rows.map((row, i) => `<tspan x="${textX}" y="${el.y + size * 0.9 + i * size * (el.lineHeight || 1.25)}">${esc(row)}</tspan>`).join('')}
        </text>
      </g>`);
    } else if (el.type === 'shape') {
      const fill = el.fill || 'none';
      const stroke = el.stroke || 'none';
      const strokeW = el.strokeWidth || 1;
      const dash = el.strokeDasharray ? `stroke-dasharray="${el.strokeDasharray}"` : '';
      if (el.shapeType === 'circle' || el.shapeType === 'ellipse') {
        body.push(`<ellipse ${transform} cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${dash} opacity="${opacity}"/>`);
      } else if (el.shapeType === 'line') {
        body.push(`<line ${transform} x1="${el.x}" y1="${el.y + el.height / 2}" x2="${el.x + el.width}" y2="${el.y + el.height / 2}" stroke="${stroke || accent}" stroke-width="${strokeW}" ${dash} opacity="${opacity}"/>`);
      } else {
        body.push(`<rect ${transform} x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${dash} opacity="${opacity}"/>`);
      }
    } else if (el.type === 'ornament') {
      const stroke = el.stroke || accent;
      const fill = el.fill || accent;
      let ornamentSvg = '';
      const tradSvg = getTraditionalOrnamentSvg(el.shapeType || '', stroke, fill);
      if (tradSvg) {
        ornamentSvg = `<g transform="translate(${el.x}, ${el.y}) scale(${el.width / 100}, ${el.height / 100})">${tradSvg}</g>`;
      } else if (el.shapeType === 'kalash') {
        ornamentSvg = auspiciousKalash(stroke);
      } else if (el.shapeType === 'mandala') {
        ornamentSvg = royalMandalaCenterpiece(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, stroke);
      } else if (el.shapeType === 'toran') {
        ornamentSvg = marigoldToran(stroke);
      } else if (el.shapeType === 'lanterns') {
        ornamentSvg = hangingLanterns(stroke);
      } else if (el.shapeType === 'peacock') {
        ornamentSvg = peacockPlumes(stroke);
      } else if (el.shapeType === 'henna') {
        ornamentSvg = hennaArabesque(stroke);
      } else if (el.shapeType === 'filigree') {
        ornamentSvg = `${cornerFiligree(32, 32, 1, 1, stroke)}${cornerFiligree(668, 32, -1, 1, stroke)}${cornerFiligree(32, 948, 1, -1, stroke)}${cornerFiligree(668, 948, -1, -1, stroke)}`;
      } else if (el.shapeType === 'border') {
        ornamentSvg = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" stroke="${stroke}" stroke-width="${el.strokeWidth || 1.2}"/>`;
      } else if (el.shapeType === 'divider') {
        ornamentSvg = `<g stroke="${stroke}" opacity="${opacity}">
          <line x1="${el.x}" y1="${el.y + el.height / 2}" x2="${el.x + el.width}" y2="${el.y + el.height / 2}" stroke-width="1.2"/>
          <circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="4" fill="${fill}"/>
          <circle cx="${el.x + el.width / 2 - 16}" cy="${el.y + el.height / 2}" r="2" fill="${fill}"/>
          <circle cx="${el.x + el.width / 2 + 16}" cy="${el.y + el.height / 2}" r="2" fill="${fill}"/>
        </g>`;
      } else if (el.svgContent) {
        ornamentSvg = `<g transform="translate(${el.x}, ${el.y})">${el.svgContent}</g>`;
      }
      body.push(`<g ${transform} opacity="${opacity}">${ornamentSvg}</g>`);
    }
  }

  const { width, height } = presets[d.format];
  const ratio = width / height;
  const viewW = ratio >= 700 / 980 ? 980 * ratio : 700;
  const viewH = ratio >= 700 / 980 ? 980 : 700 / ratio;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${-(viewW - 700) / 2} ${-(viewH - 980) / 2} ${viewW} ${viewH}" role="img" aria-label="${esc(d.fields.heading)}"><defs>${defs.join('')}</defs><rect x="${-(viewW - 700) / 2}" y="${-(viewH - 980) / 2}" width="${viewW}" height="${viewH}" fill="${paper}"/>${body.join('')}</svg>`;
}

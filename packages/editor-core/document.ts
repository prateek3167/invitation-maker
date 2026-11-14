import catalog from '../template-engine/catalog.json' with { type: 'json' };
import royalCatalog from '../template-engine/royal-catalog.json' with { type: 'json' };
import type { CanvasElement } from './canvas';

export type Fields = { host: string; partner: string; heading: string; date: string; time: string; venue: string; message: string };
export type Photo = { data: string; x: number; y: number; zoom: number };
export type RoyalDesign = { category: string; artwork: string; frame: string; composition: number; photoBoxes?: number[][] };
export type Template = { id: string; name: string; occasion: string; style: string; photo: boolean; layout: number; palette: string[]; fields: Fields; royal?: RoyalDesign };
export type Format = 'portrait' | 'square' | 'story';
export type Invitation = {
  schemaVersion: 1; id: string; templateId: string; title: string; revision: number;
  createdAt: string; updatedAt: string; fields: Fields;
  palette: string[]; font: 'serif' | 'modern' | 'italic'; format: Format;
  photo: null | Photo;
  portraits?: { bride: Photo | null; groom: Photo | null };
  templateSnapshot?: Template;
  canvasElements?: CanvasElement[];
};

export * from './canvas';
export const templates: Template[] = [...catalog, ...royalCatalog];
export const royalCategories = [...new Set(royalCatalog.map(t => t.royal.category))];
export const weddingEvents = ['Shaadi', 'Haldi', 'Mehndi', 'Sangeet', 'Sagaai'] as const;
export const royalArtworks = new Set(royalCatalog.map(t => t.royal.artwork));
export const occasions = [...new Set(templates.map(t => t.occasion))];
export const presets: Record<Format, { name: string; width: number; height: number }> = {
  portrait: { name: 'Portrait · 5 × 7 in', width: 1500, height: 2100 },
  square: { name: 'Square · 1080 × 1080', width: 1080, height: 1080 },
  story: { name: 'Story · 1080 × 1920', width: 1080, height: 1920 },
};
export function createInvitation(template: Template, id: string = crypto.randomUUID()): Invitation {
  const now = new Date().toISOString();
  return { schemaVersion: 1, id, templateId: template.id, title: template.name, revision: 0, createdAt: now, updatedAt: now,
    fields: { ...template.fields }, palette: [...template.palette], font: 'serif', format: 'portrait', photo: null, templateSnapshot: structuredClone(template), ...(template.royal ? { portraits: { bride: null, groom: null } } : {}) };
}
export function validateTemplate(value: unknown): asserts value is Template {
  if (!value || typeof value !== 'object') throw new Error('A template definition is required.');
  const t = value as Template;
  if (typeof t.id !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(t.id) || typeof t.name !== 'string' || !t.name.trim() || t.name.length > 80 || !occasions.includes(t.occasion) || typeof t.style !== 'string' || t.style.length > 80 || typeof t.photo !== 'boolean' || !Number.isInteger(t.layout) || t.layout < 0 || t.layout > 9) throw new Error('Invalid template identity, occasion or supported composition.');
  if (!Array.isArray(t.palette) || t.palette.length !== 3 || !t.palette.every(color => /^#[0-9a-f]{6}$/i.test(color))) throw new Error('A template needs three hex colors.');
  if (!t.fields || ['host', 'partner', 'heading', 'date', 'time', 'venue', 'message'].some(key => typeof t.fields[key as keyof Fields] !== 'string' || t.fields[key as keyof Fields].length > 180)) throw new Error('Invalid template default fields.');
  if (t.royal && (!t.photo || !royalArtworks.has(t.royal.artwork) || !royalCategories.includes(t.royal.category) || !['arch', 'oval'].includes(t.royal.frame) || !Number.isInteger(t.royal.composition) || t.royal.composition < 0 || t.royal.composition > 4)) throw new Error('Unsupported royal artwork or composition.');
  if(t.royal?.photoBoxes && (!Array.isArray(t.royal.photoBoxes) || t.royal.photoBoxes.length!==2 || t.royal.photoBoxes.some(box=>!Array.isArray(box)||box.length!==4||box.some(n=>!Number.isFinite(n))||box[0]<40||box[1]<100||box[2]<80||box[3]<80||box[0]+box[2]>660||box[1]+box[3]>570))) throw new Error('Invalid royal portrait placement.');
}
export function documentTemplate(document: Invitation): Template {
  if (!document.templateSnapshot) return getTemplate(document.templateId);
  validateTemplate(document.templateSnapshot);
  if (document.templateSnapshot.id !== document.templateId) throw new Error('Template snapshot identity does not match.');
  return document.templateSnapshot;
}
export function getTemplate(id: string): Template {
  const template = templates.find(t => t.id === id);
  if (!template) throw new Error('This template is not available.');
  return template;
}
export function validateInvitation(value: unknown): asserts value is Invitation {
  if (!value || typeof value !== 'object') throw new Error('Invalid invitation document.');
  const d = value as Invitation;
  if (d.schemaVersion !== 1 || typeof d.id !== 'string' || !d.id || typeof d.templateId !== 'string') throw new Error('Unsupported invitation document.');
  const t = documentTemplate(d);
  if (!Number.isSafeInteger(d.revision) || d.revision < 0 || d.revision > 2147483646 || typeof d.title !== 'string' || d.title.length > 120 ||
      typeof d.createdAt !== 'string' || typeof d.updatedAt !== 'string' || !Number.isFinite(Date.parse(d.createdAt)) || !Number.isFinite(Date.parse(d.updatedAt))) throw new Error('Invalid document metadata.');
  if (!d.fields || Object.keys(t.fields).some(k => typeof d.fields[k as keyof Fields] !== 'string' || d.fields[k as keyof Fields].length > 300)) throw new Error('Invitation fields must contain at most 300 characters.');
  if (!Array.isArray(d.palette) || d.palette.length !== 3 || !d.palette.every(c => /^#[0-9a-f]{6}$/i.test(c))) throw new Error('Invalid invitation colors.');
  if (!['serif', 'modern', 'italic'].includes(d.font) || !Object.hasOwn(presets, d.format)) throw new Error('Unsupported style or format.');
  const validPhoto = (photo: Photo) => typeof photo.data === 'string' && /^(data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+|asset:[0-9a-f-]{36})$/.test(photo.data) && photo.data.length <= 8_000_000 && Number.isFinite(photo.x) && Number.isFinite(photo.y) && Number.isFinite(photo.zoom) && photo.x >= 0 && photo.x <= 100 && photo.y >= 0 && photo.y <= 100 && photo.zoom >= 1 && photo.zoom <= 3;
  if (d.photo && (!t.photo || !validPhoto(d.photo))) throw new Error('Invalid photo or crop.');
  if (d.portraits !== undefined) {
    if (!t.royal || !d.portraits || Object.keys(d.portraits).some(key => !['bride', 'groom'].includes(key)) || !Object.hasOwn(d.portraits, 'bride') || !Object.hasOwn(d.portraits, 'groom')) throw new Error('Unsupported portrait slots.');
    for (const photo of [d.portraits.bride, d.portraits.groom]) if (photo !== null && !validPhoto(photo)) throw new Error('Invalid portrait or crop.');
    if ((d.portraits.bride?.data.length || 0) + (d.portraits.groom?.data.length || 0) > 8_000_000) throw new Error('Use smaller bride and groom photos (combined processed limit 6 MB).');
  }
  if (d.canvasElements !== undefined) {
    if (!Array.isArray(d.canvasElements) || d.canvasElements.length > 500) throw new Error('Invalid canvas elements.');
  }
}
export function contentIssues(d: Invitation): string[] {
  const issues: string[] = [];
  if (!d.fields.host.trim()) issues.push('Add a host or first name.');
  if (!d.fields.heading.trim()) issues.push('Add an event heading.');
  if (!d.fields.date.trim()) issues.push('Add the event date.');
  if (!d.fields.venue.trim()) issues.push('Add a venue or location.');
  if (d.fields.host.length + d.fields.partner.length > 85) issues.push('Shorten the names to 85 characters combined for a readable design.');
  if (d.fields.message.length > 180) issues.push('Shorten your message to 180 characters for the best fit.');
  if (d.fields.venue.length > 120) issues.push('Shorten the venue to 120 characters for the best fit.');
  if (documentTemplate(d).royal) {
    if (!d.portraits?.bride) issues.push('Add the bride photograph before downloading.');
    if (!d.portraits?.groom) issues.push('Add the groom photograph before downloading.');
  } else if (documentTemplate(d).photo && !d.photo) issues.push('Add your photo before downloading this photo design.');
  return issues;
}
export function filterTemplates(query: string, occasion: string, photo: string, catalog: Template[] = templates): Template[] {
  const q = query.trim().toLocaleLowerCase();
  return catalog.filter(t => (!q || `${t.name} ${t.occasion} ${t.style}`.toLocaleLowerCase().includes(q)) &&
    (!occasion || t.occasion === occasion) && (!photo || t.photo === (photo === 'yes')));
}

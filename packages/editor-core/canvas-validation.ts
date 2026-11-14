import { SaxesParser } from 'saxes';
import type { CanvasElement } from './canvas';

const tags = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'title', 'desc']);
const attributes = new Set(['xmlns', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform', 'shape-rendering']);
const paint = /^(?:#[0-9a-f]{3,8}|none|transparent|black|white)$/i;
const error = (): never => { throw new Error('Invalid or unsafe canvas element.'); };

/** Accept a small inert SVG subset, never active content, links, entities or CSS. */
export function validateCanvasSvg(svg: string): void {
  if (svg.length > 250_000) error();
  const parser = new SaxesParser({ xmlns: true, fragment: true });
  let count = 0;
  parser.on('error', error);
  parser.on('doctype', error);
  parser.on('processinginstruction', error);
  parser.on('opentag', node => {
    if (++count > 10_000 || !tags.has(node.name) || (node.uri && node.uri !== 'http://www.w3.org/2000/svg')) error();
    for (const [key, attribute] of Object.entries(node.attributes)) {
      const value = attribute.value;
      if (!attributes.has(key) || value.length > 200_000) error();
      if (key === 'xmlns') { if (value !== 'http://www.w3.org/2000/svg') error(); }
      else if (key === 'fill' || key === 'stroke') { if (!paint.test(value)) error(); }
      else if (key === 'shape-rendering') { if (!['crispEdges', 'geometricPrecision', 'auto'].includes(value)) error(); }
      else if (key === 'stroke-linecap') { if (!['butt', 'round', 'square'].includes(value)) error(); }
      else if (key === 'stroke-linejoin') { if (!['miter', 'round', 'bevel'].includes(value)) error(); }
      else if (key === 'transform') { if (!/^(?:(?:translate|rotate|scale|matrix)\([\d\s.,+eE-]+\)\s*)+$/.test(value)) error(); }
      else if (key === 'd') { if (!/^[MmZzLlHhVvCcSsQqTtAa\d\s.,+eE-]*$/.test(value)) error(); }
      else if (!/^[\d\s.,+eE-]+$/.test(value)) error();
    }
  });
  parser.write(svg).close();
  if (!count) error();
}

const shapeTypes = new Set('rect circle ellipse line star mandala kalash filigree toran lanterns peacock henna border divider ganesha_royal ganesha_minimal swastik om doli shehnai baarat_elephant havan_kund mangalsutra peacock_pair diya namaste marigold_garland template-decoration customSvg'.split(' '));
const keys = new Set('id type name x y width height rotation opacity locked hidden zIndex text fontFamily fontSize fontWeight fontStyle color textAlign letterSpacing lineHeight fieldBinding src cropX cropY zoom frameShape filter slot photoSlot shapeType fill stroke strokeWidth strokeDasharray svgContent'.split(' '));
export function validateCanvasElements(elements: unknown): asserts elements is CanvasElement[] {
  if (!Array.isArray(elements) || elements.length > 500) error();
  const ids = new Set<string>();
  for (const raw of elements as unknown[]) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) error();
    const el = raw as CanvasElement;
    if (Object.keys(el).some(key => !keys.has(key)) || typeof el.id !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(el.id) || ids.has(el.id)) error();
    ids.add(el.id);
    if (!['text', 'image', 'shape', 'ornament', 'background'].includes(el.type) || typeof el.name !== 'string' || el.name.length > 200) error();
    for (const key of ['x', 'y', 'width', 'height', 'zIndex'] as const) if (!Number.isFinite(el[key]) || Math.abs(el[key]) > 100_000 || ((key === 'width' || key === 'height') && el[key] < 0)) error();
    const ranges = { rotation: [-36000, 36000], opacity: [0, 1], fontSize: [1, 1000], letterSpacing: [-100, 100], lineHeight: [0.1, 10], cropX: [0, 100], cropY: [0, 100], zoom: [1, 3], strokeWidth: [0, 100] } as const;
    for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) if (el[key] !== undefined && (!Number.isFinite(el[key]) || el[key]! < ranges[key][0] || el[key]! > ranges[key][1])) error();
    for (const key of ['locked', 'hidden'] as const) if (el[key] !== undefined && typeof el[key] !== 'boolean') error();
    for (const key of ['fill', 'stroke', 'color'] as const) if (el[key] !== undefined && (typeof el[key] !== 'string' || !paint.test(el[key]!))) error();
    if (el.text !== undefined && (typeof el.text !== 'string' || el.text.length > 5000)) error();
    if (el.fontFamily !== undefined && (typeof el.fontFamily !== 'string' || el.fontFamily.length > 160 || !/^[a-zA-Z0-9 ,'\-]+$/.test(el.fontFamily))) error();
    if (el.strokeDasharray !== undefined && (typeof el.strokeDasharray !== 'string' || el.strokeDasharray.length > 100 || !/^[\d\s.,]+$/.test(el.strokeDasharray))) error();
    const enums = { fontWeight: ['normal', 'bold'], fontStyle: ['normal', 'italic'], textAlign: ['left', 'center', 'right'], fieldBinding: ['host', 'partner', 'heading', 'date', 'time', 'venue', 'message', 'badge', 'footer', 'ampersand'], frameShape: ['rect', 'circle', 'arch', 'oval'], filter: ['none', 'sepia', 'vintage', 'warm', 'grayscale'], slot: ['single', 'bride', 'groom'], photoSlot: ['single', 'bride', 'groom'] };
    for (const key of Object.keys(enums) as (keyof typeof enums)[]) if (el[key] !== undefined && !enums[key].includes(el[key]!)) error();
    if (el.shapeType !== undefined && !shapeTypes.has(el.shapeType)) error();
    if (el.svgContent !== undefined) { if (typeof el.svgContent !== 'string') error(); validateCanvasSvg(el.svgContent!); }
    if (el.src !== undefined) {
      if (typeof el.src !== 'string' || el.src.length > 8_000_000) error();
      if (el.src!.startsWith('data:image/svg+xml;charset=utf-8,')) {
        try { validateCanvasSvg(decodeURIComponent(el.src!.slice(33))); } catch { error(); }
      } else if (el.src && !/^(?:data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+|asset:[0-9a-f-]{36}|royal\/[a-z0-9-]+)$/.test(el.src)) error();
    }
  }
}

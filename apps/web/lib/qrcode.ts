import QRCode from 'qrcode';

export type QrOptions = { size?: number; color?: string; bgColor?: string; margin?: number; includeCenterBadge?: boolean; centerBadgeText?: string };
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]!));

/** Standards-based Model 2 encoding. Never truncate a payload or cover data modules. */
export function generateQrCodeSvg(text: string, options: QrOptions = {}): string {
  const { size = 200, color = '#1e1b18', bgColor = '#ffffff', margin = 4 } = options;
  if (!text || new TextEncoder().encode(text).length > 1200) throw new Error('QR content must contain between 1 and 1200 UTF-8 bytes.');
  if (![color, bgColor].every(value => /^#[0-9a-f]{6}$/i.test(value))) throw new Error('Use six-digit hex QR colors.');
  if (!Number.isFinite(size) || size < 64 || size > 4096 || !Number.isInteger(margin) || margin < 4 || margin > 20) throw new Error('Invalid QR dimensions or quiet zone.');
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const dimension = modules.size + margin * 2;
  const paths: string[] = [];
  for (let row = 0; row < modules.size; row++) for (let column = 0; column < modules.size; column++) {
    if (modules.get(row, column)) paths.push(`M${column + margin},${row + margin}h1v1h-1z`);
  }
  // Retain a descriptive badge label for accessibility, outside the encoded modules.
  const label = options.includeCenterBadge ? options.centerBadgeText || 'RSVP' : 'QR code';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimension} ${dimension}" width="${size}" height="${size}" shape-rendering="crispEdges"><title>${escape(label.slice(0, 80))}</title><rect width="${dimension}" height="${dimension}" fill="${bgColor}"/><path d="${paths.join('')}" fill="${color}"/></svg>`;
}

export function generateQrCodeDataUrl(text: string, options: QrOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateQrCodeSvg(text, options)).replace(/'/g, '%27')}`;
}

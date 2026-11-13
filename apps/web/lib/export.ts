import { presets, type Invitation } from '../../../packages/editor-core/document';
import { renderSvg } from '../../../packages/template-engine/render';
import { browserArtwork } from './royal-art';

export async function exportInvitation(doc: Invitation, format: 'png' | 'jpg' | 'pdf'): Promise<void> {
  const svg = renderSvg(doc, await browserArtwork(doc));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const { width, height } = presets[doc.format];
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot create an image. Try a current browser.');
    ctx.drawImage(image, 0, 0, width, height);
    const filename = doc.title.replace(/[^a-z0-9 -]/gi, '').trim().slice(0, 70) || 'invitation';
    if (format === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'pt', format: [width * 72 / 300, height * 72 / 300] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width * 72 / 300, height * 72 / 300);
      pdf.save(`${filename}.pdf`);
    } else {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create the download.')), format === 'jpg' ? 'image/jpeg' : 'image/png', .95));
      const download = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = download; anchor.download = `${filename}.${format}`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(download), 10000);
    }
  } finally { URL.revokeObjectURL(url); }
}

export async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('Choose a photo under 40 megapixels.');
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Photo processing is unavailable.');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .88);
  } finally { bitmap.close(); }
}

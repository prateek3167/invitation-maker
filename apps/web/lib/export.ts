import { presets, type Invitation } from '../../../packages/editor-core/document';
import { renderSvg } from '../../../packages/template-engine/render';
import { browserArtwork } from './royal-art';

async function renderCardToCanvas(doc: Invitation): Promise<HTMLCanvasElement> {
  const svg = renderSvg(doc, await browserArtwork(doc));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const { width, height } = presets[doc.format];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot create an image. Try a modern browser.');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportInvitation(doc: Invitation, format: 'png' | 'jpg' | 'pdf'): Promise<void> {
  const canvas = await renderCardToCanvas(doc);
  const { width, height } = presets[doc.format];
  const filename = doc.title.replace(/[^a-z0-9 -]/gi, '').trim().slice(0, 70) || 'invitation';

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [(width * 72) / 300, (height * 72) / 300],
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, (width * 72) / 300, (height * 72) / 300);
    pdf.save(`${filename}.pdf`);
  } else {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Could not create the download.'))),
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        0.95
      )
    );
    const download = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = download;
    anchor.download = `${filename}.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(download), 10000);
  }
}

/**
 * Exports all cards in a wedding suite into a single multi-page high-resolution print PDF booklet.
 */
export async function exportSuitePdf(suite: Invitation[], filenamePrefix = 'Wedding_Invitation_Suite'): Promise<void> {
  if (!suite.length) return;
  const { jsPDF } = await import('jspdf');

  const firstCard = suite[0];
  const { width: firstW, height: firstH } = presets[firstCard.format];
  const pdf = new jsPDF({
    orientation: firstW > firstH ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [(firstW * 72) / 300, (firstH * 72) / 300],
  });

  for (let i = 0; i < suite.length; i++) {
    const card = suite[i];
    const { width, height } = presets[card.format];
    const canvas = await renderCardToCanvas(card);
    const wPt = (width * 72) / 300;
    const hPt = (height * 72) / 300;
    const orientation = width > height ? 'landscape' : 'portrait';

    if (i > 0) {
      pdf.addPage([wPt, hPt], orientation);
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, wPt, hPt);
  }

  const cleanFilename = filenamePrefix.replace(/[^a-z0-9 -]/gi, '').trim().slice(0, 70) || 'Wedding_Suite';
  pdf.save(`${cleanFilename}.pdf`);
}

/**
 * Sequentially downloads all cards in the suite as high-resolution PNG or JPG images.
 */
export async function exportSuiteImages(suite: Invitation[], format: 'png' | 'jpg' = 'png'): Promise<void> {
  for (let i = 0; i < suite.length; i++) {
    const card = suite[i];
    const indexPrefix = String(i + 1).padStart(2, '0');
    const eventName = (card.eventTag || card.fields.heading || 'Ceremony').replace(/[^a-z0-9]/gi, '_');
    const filename = `${indexPrefix}_${eventName}`;

    const canvas = await renderCardToCanvas(card);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Could not create download.'))),
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        0.95
      )
    );
    const download = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = download;
    anchor.download = `${filename}.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(download), 10000);

    // Stagger downloads by 300ms to avoid browser download throttling
    if (i < suite.length - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

export async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('Choose a photo under 40 megapixels.');
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Photo processing is unavailable.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  } finally {
    bitmap.close();
  }
}

import { chromium } from 'playwright-core';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { getDatabase, workspaceRoot, type Database } from '../../../../packages/database/client';
import { claimExport, digest, finishExport, rendererVersion, type ExportJob } from '../../../../packages/database/exports';

export function exportDirectory() {
  if (process.env.PUBLIC_DEPLOYMENT === 'true' && !process.env.PRIVATE_EXPORT_DIRECTORY) throw new Error('Configure a durable private export mount.');
  return path.resolve(workspaceRoot(), process.env.PRIVATE_EXPORT_DIRECTORY || '.data/exports');
}
export function artifactPath(job: Pick<ExportJob, 'id' | 'leaseToken' | 'format'>) {
  if (!/^[0-9a-f-]{36}$/.test(job.id) || !job.leaseToken || !/^[0-9a-f-]{36}$/.test(job.leaseToken) || !['png', 'jpg', 'pdf'].includes(job.format)) throw new Error('Invalid export artifact identity');
  return path.join(exportDirectory(), `${job.id}-${job.leaseToken}.${job.format}`);
}
export async function renderExport(job: ExportJob): Promise<Buffer> {
  if (job.rendererVersion !== rendererVersion || digest(job.snapshotSvg) !== job.snapshotHash) throw new Error('Unsupported or damaged export snapshot');
  const browser = await chromium.launch({ channel: process.env.EXPORT_BROWSER_CHANNEL || 'chrome', executablePath: process.env.EXPORT_BROWSER_EXECUTABLE || undefined, headless: true, timeout: 20000 });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.route('**/*', route => route.abort());
    const page = await context.newPage(); page.setDefaultTimeout(30000);
    const result = await page.evaluate(async ({ svg, width, height, format }) => {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      try {
        const image = new Image(); image.src = url;
        await Promise.race([image.decode(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Image decoding timeout')), 20000))]);
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(image, 0, 0, width, height);
        return canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', .95).split(',')[1];
      } finally { URL.revokeObjectURL(url); }
    }, { svg: job.snapshotSvg, width: job.width, height: job.height, format: job.format });
    const image = Buffer.from(result, 'base64');
    if (job.format !== 'pdf') return image;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: job.width > job.height ? 'landscape' : 'portrait', unit: 'pt', format: [job.width * 72 / 300, job.height * 72 / 300] });
    pdf.addImage(new Uint8Array(image), 'PNG', 0, 0, job.width * 72 / 300, job.height * 72 / 300);
    return Buffer.from(pdf.output('arraybuffer'));
  } finally { await browser.close(); }
}
export async function runExportJob(db: Database, render = renderExport) {
  const job = await claimExport(db); if (!job) return false;
  try {
    const bytes = await render(job);
    await mkdir(exportDirectory(), { recursive: true, mode: 0o700 });
    await writeFile(artifactPath(job), bytes, { flag: 'wx', mode: 0o600 });
    const accepted = await finishExport(db, job, true);
    if (!accepted) await unlink(artifactPath(job));
    console.info(JSON.stringify({ event: accepted ? 'export.completed' : 'export.lease_lost', jobId: job.id, attempt: job.attempts }));
  } catch {
    await finishExport(db, job, false);
    console.error(JSON.stringify({ event: 'export.render_failed', jobId: job.id, attempt: job.attempts }));
  }
  return true;
}
const state = globalThis as typeof globalThis & { invitationExportWorker?: Promise<void> };
export function kickLocalExports() {
  if (process.env.PUBLIC_DEPLOYMENT === 'true' || state.invitationExportWorker) return;
  const work = (async () => { const db = await getDatabase(); while (await runExportJob(db)) { /* Single bounded local worker. */ } })();
  state.invitationExportWorker = work;
  void work.catch(() => console.error(JSON.stringify({ event: 'export.worker_failed' }))).finally(() => { if (state.invitationExportWorker === work) state.invitationExportWorker = undefined; });
}

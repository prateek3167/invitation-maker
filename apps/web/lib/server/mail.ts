import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { workspaceRoot } from '../../../../packages/database/client';

export type TransactionalMessage = { to: string; subject: string; text: string };
export function mailReady(): boolean { return process.env.PUBLIC_DEPLOYMENT !== 'true' || Boolean(process.env.SMTP_URL && process.env.MAIL_FROM); }
export async function sendMail(message: TransactionalMessage): Promise<void> {
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(message.to) || message.to.length > 254 || /[\r\n]/.test(message.subject)) throw new Error('Invalid mail recipient or subject.');
  if (process.env.SMTP_URL) {
    if (!process.env.MAIL_FROM || /[\r\n]/.test(process.env.MAIL_FROM)) throw new Error('Configure a valid MAIL_FROM.');
    const url = new URL(process.env.SMTP_URL);
    if (!['smtp:', 'smtps:'].includes(url.protocol)) throw new Error('Unsupported mail transport.');
    const transport = nodemailer.createTransport({ host: url.hostname, port: Number(url.port || (url.protocol === 'smtps:' ? 465 : 587)),
      secure: url.protocol === 'smtps:', requireTLS: true,
      auth: url.username ? { user: decodeURIComponent(url.username), pass: decodeURIComponent(url.password) } : undefined,
      connectionTimeout: 10000, socketTimeout: 15000, greetingTimeout: 10000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    try { await transport.sendMail({ from: process.env.MAIL_FROM, to: message.to, subject: message.subject, text: message.text }); }
    finally { transport.close(); }
    return;
  }
  if (process.env.PUBLIC_DEPLOYMENT === 'true') throw new Error('Transactional email is not configured.');
  // A local development mailbox, not a delivered email or HTTP-accessible inbox.
  const directory = path.resolve(workspaceRoot(), process.env.MAIL_CAPTURE_DIRECTORY || '.data/mailbox');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, `${Date.now()}-${randomUUID()}.json`), JSON.stringify({ ...message, createdAt: new Date().toISOString() }), { mode: 0o600, flag: 'wx' });
}

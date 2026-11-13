import { expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
export async function mailLink(email: string, subject = 'Verify') {
  const directory = process.env.MAIL_CAPTURE_DIRECTORY;
  if (!directory) throw new Error('Use npm run test:e2e for the isolated mailbox.');
  let link = '';
  await expect.poll(async () => {
    const files = await readdir(directory).catch(() => []);
    for (const file of files.sort().reverse()) {
      const message = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
      if (message.to === email && message.subject.includes(subject)) { link = message.text.match(/https?:\/\/\S+/)?.[0] || ''; break; }
    }
    return Boolean(link);
  }, { timeout: 15000 }).toBe(true);
  return link;
}

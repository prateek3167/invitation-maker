import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mailLink } from './helpers/mail';
import { createInvitation, templates } from '../../packages/editor-core/document';
import { renderSvg } from '../../packages/template-engine/render';
import { readFile } from 'node:fs/promises';
import { serverArtwork } from '../../packages/template-engine/artwork';

test('private media and immutable background PNG/JPG/PDF exports with pixel parity', async ({ page, playwright }) => {
  test.setTimeout(120000);
  const baseURL = 'http://127.0.0.1:3005', email = `exports-${Date.now()}@example.test`, password = 'An export test passphrase 123!';
  const owner = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } });
  const stranger = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } });
  try {
    await owner.post('/api/auth/sign-up/email', { data: { name: 'Exporter', email, password } }); await owner.get(await mailLink(email));
    const event = (await (await owner.post('/api/v1/projects', { data: { title: 'Export event', occasion: 'Wedding' } })).json()).project;
    const source = createInvitation(templates.find(template => template.photo)!);
    const image = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#c1bb92' } }).png().toBuffer();
    source.photo = { data: `data:image/png;base64,${image.toString('base64')}`, x: 25, y: 70, zoom: 1.2 };
    const created = await owner.post(`/api/v1/projects/${event.id}/invitations`, { data: { document: source } }); expect(created.status(), await created.text()).toBe(201);
    const card = (await created.json()).invitation; expect(card.photo.data).toMatch(/^data:image\/jpeg/);
    const malformed = await owner.put(`/api/v1/invitations/${card.id}`, { data: { document: { ...card, photo: { ...card.photo, data: 'data:image/png;base64,PHN2ZyBvbmxvYWQ9ImV2aWwiPjwvc3ZnPg==' } } } }); expect(malformed.status()).toBe(400);
    await page.goto('/'); const svg = renderSvg(card);
    const expectedPng = await page.evaluate(async svg => {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = 1500; canvas.height = 2100; canvas.getContext('2d')!.drawImage(image, 0, 0, 1500, 2100); URL.revokeObjectURL(url);
      return canvas.toDataURL('image/png').split(',')[1];
    }, svg);
    for (const format of ['png', 'jpg', 'pdf']) {
      const input = { invitationId: card.id, revision: card.revision, format, idempotencyKey: randomUUID() };
      const queued = await owner.post('/api/v1/exports', { data: input }); expect(queued.status(), await queued.text()).toBe(202); const job = (await queued.json()).export;
      expect((await (await owner.post('/api/v1/exports', { data: input })).json()).export.id).toBe(job.id);
      expect((await stranger.get(`/api/v1/exports/${job.id}`)).status()).toBe(401);
      await expect.poll(async () => (await (await owner.get(`/api/v1/exports/${job.id}`)).json()).export.status, { timeout: 45000, intervals: [500, 1000] }).toBe('completed');
      const downloaded = await owner.get(`/api/v1/exports/${job.id}/download`); expect(downloaded.status()).toBe(200); expect(downloaded.headers()['cache-control']).toBe('private, no-store');
      const bytes = await downloaded.body();
      if (format === 'pdf') expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
      else { const metadata = await sharp(bytes).metadata(); expect([metadata.width, metadata.height]).toEqual([1500, 2100]); }
      if (format === 'png') {
        const actualPixels = await sharp(bytes).ensureAlpha().raw().toBuffer(); const expectedPixels = await sharp(Buffer.from(expectedPng, 'base64')).ensureAlpha().raw().toBuffer(); expect(actualPixels.equals(expectedPixels)).toBe(true);
      }
    }
    const royalSource=createInvitation(templates.find(template=>template.royal)!);
    royalSource.portraits={bride:{data:`data:image/webp;base64,${(await readFile('apps/web/public/royal/demo-bride.webp')).toString('base64')}`,x:30,y:40,zoom:1.2},groom:{data:`data:image/webp;base64,${(await readFile('apps/web/public/royal/demo-groom.webp')).toString('base64')}`,x:60,y:55,zoom:1.4}};
    const royalResponse=await owner.post(`/api/v1/projects/${event.id}/invitations`,{data:{document:royalSource}});expect(royalResponse.status()).toBe(201);const royal=(await royalResponse.json()).invitation;
    const royalSvg=renderSvg(royal,await serverArtwork(royal));expect(royalSvg.match(/<image /g)).toHaveLength(3);
    for(const format of ['png','pdf']){
      const queued=await owner.post('/api/v1/exports',{data:{invitationId:royal.id,revision:royal.revision,format,idempotencyKey:randomUUID()}});expect(queued.status()).toBe(202);const job=(await queued.json()).export;
      await expect.poll(async()=>(await(await owner.get(`/api/v1/exports/${job.id}`)).json()).export.status,{timeout:45000}).toBe('completed');
      const response=await owner.get(`/api/v1/exports/${job.id}/download`);expect(response.status()).toBe(200);const bytes=await response.body();
      if(format==='pdf')expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
      else {
        const expected=await page.evaluate(async svg=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=2100;canvas.getContext('2d')!.drawImage(image,0,0);URL.revokeObjectURL(url);return canvas.toDataURL('image/png').split(',')[1];},royalSvg);
        expect((await sharp(bytes).ensureAlpha().raw().toBuffer()).equals(await sharp(Buffer.from(expected,'base64')).ensureAlpha().raw().toBuffer())).toBe(true);
      }
    }
    const exported = await owner.get('/api/v1/account/export'); expect(await exported.text()).toContain('data:image/jpeg;base64,'); expect(await exported.text()).not.toContain('asset:');
    expect((await owner.post('/api/auth/delete-user', { data: { password } })).status()).toBe(200);
  } finally { await owner.dispose(); await stranger.dispose(); }
});

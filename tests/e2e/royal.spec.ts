import {expect,test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {templates,weddingEvents} from '../../packages/editor-core/document';
test('every royal design is discoverable, editable, dual-photo persistent and exportable on desktop/mobile',async({page},testInfo)=>{
  test.setTimeout(240000);page.setDefaultTimeout(10000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const bride=await readFile('apps/web/public/royal/demo-bride.webp'),groom=await readFile('apps/web/public/royal/demo-groom.webp');
  await page.goto('/');await page.getByLabel('Royal collection',{exact:true}).selectOption('all');await expect(page.locator('.template-card')).toHaveCount(20);
  const royal=templates.filter(t=>t.royal);
  for(const [index,template] of royal.entries()){
    await page.setViewportSize(index%2?{width:393,height:852}:{width:1440,height:1000});
    await page.getByRole('button',{name:`Preview ${template.name}`,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Make it yours',exact:true}).click();
    await page.getByLabel('Bride name',{exact:true}).fill('Ananya');await page.getByLabel('Groom name',{exact:true}).fill('Vikram');await page.getByLabel('Wedding event').selectOption(weddingEvents[index%5]);
    await page.getByLabel('Venue / location').fill('The Royal Courtyard, Jaipur');await page.getByLabel('Draft name',{exact:true}).fill(`Royal proof ${template.name}`);
    await page.getByRole('button',{name:'Design',exact:true}).click();await page.getByLabel('Typography').selectOption(index%2?'italic':'modern');await page.getByRole('button',{name:'Rose',exact:true}).click();
    await page.getByRole('button',{name:'Photo',exact:true}).click();await page.getByLabel('Upload bride photograph').setInputFiles({name:'bride.webp',mimeType:'image/webp',buffer:bride});await page.getByLabel('Upload groom photograph').setInputFiles({name:'groom.webp',mimeType:'image/webp',buffer:groom});
    await page.getByLabel('Bride zoom',{exact:true}).fill('1.2');await page.getByLabel('Groom zoom',{exact:true}).fill('1.5');await page.getByLabel('Bride horizontal position').fill('20');await page.getByLabel('Groom horizontal position').fill('80');
    await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();const preview=page.locator('.editor-canvas .invitation-preview');await expect.poll(()=>preview.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth===1500)).toBe(true);
    const svg=await preview.evaluate(async(img:HTMLImageElement)=>await(await fetch(img.src)).text());expect(svg.match(/<image /g)).toHaveLength(3);expect(svg).toContain('Ananya');expect(svg).toContain('The Royal Courtyard');
    await page.getByRole('button',{name:'Download',exact:true}).click();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download PNG',exact:true}).click();const download=await downloadPromise,path=testInfo.outputPath(`${template.id}.png`);await download.saveAs(path);const bytes=await readFile(path),metadata=await sharp(bytes).metadata();expect([metadata.width,metadata.height]).toEqual([1500,2100]);
    const pixels=await sharp(bytes).raw().stats();expect(pixels.channels.some(channel=>channel.stdev>25)).toBe(true);
    await page.getByRole('button',{name:'Back to studio',exact:true}).click();
  }
  await page.getByRole('button',{name:/My projects/}).click();await expect(page.locator('.project-card')).toHaveCount(20);await page.locator('.project-art').last().click();await page.getByRole('button',{name:'Photo',exact:true}).click();await expect(page.getByLabel('Bride zoom',{exact:true})).toHaveValue('1.2');await expect(page.getByLabel('Groom zoom',{exact:true})).toHaveValue('1.5');expect(errors).toEqual([]);
});

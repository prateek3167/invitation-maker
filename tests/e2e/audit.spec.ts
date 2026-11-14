import { expect, test } from '@playwright/test';
import { templates } from '../../packages/editor-core/document';
import { writeFile } from 'node:fs/promises';

async function openNonPhoto(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('Photo preference').selectOption('no');
  await page.locator('.template-card').first().getByRole('button', { name: /Preview/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Make it yours', exact: true }).click();
}

test('every catalog design opens an actual rendered editor preview', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.template-card')).toHaveCount(80);
  for (let index = 0; index < templates.length; index++) {
    await page.locator('.template-card').nth(index).getByRole('button', { name: /Preview/ }).click();
    let selectedComposition: string | undefined;
    if (!templates[index].royal) {
      const selected = page.getByRole('dialog').locator('img.invitation-preview');
      await expect.poll(() => selected.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      selectedComposition = await selected.evaluate(async (image: HTMLImageElement) => (await fetch(image.src)).text());
    }
    await page.getByRole('dialog').getByRole('button', { name: 'Make it yours', exact: true }).click();
    await expect(page.getByLabel(templates[index].royal ? 'Bride name' : 'First name / host', { exact: true })).toHaveValue(templates[index].fields.host);
    const preview = page.locator('.editor-dialog img.invitation-preview');
    await expect(preview).toBeVisible();
    await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    if (selectedComposition) expect(await preview.evaluate(async (image: HTMLImageElement) => (await fetch(image.src)).text())).toBe(selectedComposition);
    await page.getByRole('button', { name: 'Back to studio' }).click();
  }
  expect(errors).toEqual([]);
});

test('five-card suite edits, undo/redo and persistence retain the root draft identity', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await openNonPhoto(page);
  await page.getByLabel('Draft name', { exact: true }).fill('Suite audit');
  await expect(page.getByText('Saved on this device', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Visual Studio' }).click();
  await page.getByRole('button', { name: 'Generate 5-Card Suite', exact: true }).click();
  await expect(page.locator('.suite-card-thumb')).toHaveCount(5);
  await page.getByRole('button', { name: 'Select Shubh Haldi', exact: true }).click();
  await page.getByRole('tab', { name: 'Guided Details' }).click();
  await page.getByLabel('First name / host').fill('Suite Bride');
  await expect(page.getByText('Saved on this device', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Visual Studio' }).click();
  await page.locator('.suite-card-thumb').nth(1).hover();
  await page.locator('.suite-card-thumb').nth(1).getByTitle('Duplicate Card', { exact: true }).click();
  await expect(page.locator('.suite-card-thumb')).toHaveCount(6);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.locator('.suite-card-thumb')).toHaveCount(5);
  await page.keyboard.press('Control+y');
  await expect(page.locator('.suite-card-thumb')).toHaveCount(6);
  await page.getByRole('button', { name: 'Back to studio' }).click();
  await page.reload();
  await page.getByRole('button', { name: /My projects/ }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open Suite audit', exact: true }).click();
  await expect(page.getByLabel('First name / host')).toHaveValue('Suite Bride');
  await page.getByRole('tab', { name: 'Visual Studio' }).click();
  await expect(page.locator('.suite-card-thumb')).toHaveCount(6);
  expect(errors).toEqual([]);
});

test('visual text drag is one undo step and matches the canonical preview composition', async ({ page }) => {
  await openNonPhoto(page);
  await page.getByRole('tab', { name: 'Visual Studio' }).click();
  const target = page.locator('[data-element-id="text-host"]');
  const before = await target.getAttribute('x');
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 15, { steps: 12 });
  await page.mouse.up();
  await expect(target).not.toHaveAttribute('x', before!);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(target).toHaveAttribute('x', before!);
  await target.dblclick();
  const inline = page.locator('.inline-text-editor, .canvas-inline-textarea, textarea').first();
  await inline.fill('Edited visually');
  await inline.blur();
  await page.getByRole('tab', { name: 'Guided Details' }).click();
  await expect(page.getByLabel('First name / host')).toHaveValue('Edited visually');
});

test('unknown invitation links never fabricate a wedding or collect guest data', async ({ page }) => {
  await page.goto('/invite/unknown-audit-id');
  await expect(page.getByRole('heading', { name: 'Invitation Not Found' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Submit RSVP/ })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('resize, rotate, layer controls, font selection and responsive visual access', async ({ page }) => {
  await openNonPhoto(page);
  await page.getByRole('tab', { name: 'Visual Studio' }).click();
  const target = page.locator('[data-element-id="text-host"]');
  await target.click();
  const before = Number(await target.getAttribute('width'));
  const handle = (await page.locator('[data-resize-handle="se"]').boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 24, handle.y + handle.height / 2 + 8, { steps: 5 });
  await page.mouse.up();
  expect(Number(await target.getAttribute('width'))).toBeGreaterThan(before);
  await page.getByLabel(/^Rotation:/).fill('30');
  await expect(target).toHaveAttribute('transform', /^rotate\(30 /);
  await page.getByRole('combobox', { name: 'Font Family', exact: true }).selectOption('Arial, sans-serif');
  await page.getByTitle('Bring to Front', { exact: true }).click();
  const ids = await page.locator('[data-element-id]').evaluateAll(elements => elements.map(element => element.getAttribute('data-element-id')));
  expect(ids.at(-1)).toBe('text-host');
  await page.getByTitle('Send to Back', { exact: true }).click();
  await expect(page.locator('[data-element-id]').first()).toHaveAttribute('data-element-id', 'text-host');
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({width, height:900});
    await expect(page.getByRole('tab', { name:'Guided Details' })).toBeVisible();
    await page.getByRole('tab', { name:'Guided Details' }).click();
    await expect(page.getByLabel('First name / host')).toBeVisible();
    await page.getByRole('tab', { name:'Visual Studio' }).click();
    await expect(page.getByRole('complementary', { name:'Element properties inspector' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:'test-results/audit-visual-' + width + '.png'});
  }
  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return { ttfbMs:entry.responseStart-entry.requestStart, domContentLoadedMs:entry.domContentLoadedEventEnd, loadMs:entry.loadEventEnd };
  });
  await writeFile('test-results/audit-performance.json', JSON.stringify({environment:'Local headless Chrome, unthrottled, not a production SLO',navigation},null,2));
});

test('manual guests persist and export CSV while unavailable public sharing is clearly explained', async ({ page }) => {
  await openNonPhoto(page);
  await page.getByLabel('Draft name', { exact: true }).fill('Guest audit');
  await page.getByTitle('Guest RSVP & Sharing Hub', {exact:true}).click();
  const dialog = page.getByRole('dialog', {name:'Guest manager', exact:true});
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name:/Add.*Guest/ }).click();
  await dialog.getByLabel('Guest / Family Name *', {exact:true}).fill('Audit family');
  await dialog.getByRole('button', {name:'Save Guest RSVP', exact:true}).click();
  await expect(dialog.getByRole('cell', {name:'Audit family', exact:true})).toBeVisible();
  const download = page.waitForEvent('download');
  await dialog.getByRole('button', {name:'Export CSV', exact:true}).click();
  expect((await download).suggestedFilename()).toMatch(/guest_list\.csv$/);
  await dialog.getByRole('button', {name:'Device preview & calendar', exact:true}).click();
  await expect(dialog.getByRole('status')).toContainText('Online publishing and guest RSVP delivery are not connected');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Draft name', {exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Back to studio'}).click();
  await page.reload();
  await page.getByRole('button', {name:/My projects/}).click();
  await page.getByRole('button', {name:'Open Guest audit', exact:true}).click();
  await page.getByTitle('Guest RSVP & Sharing Hub', {exact:true}).click();
  await expect(dialog.getByRole('cell', {name:'Audit family', exact:true})).toBeVisible();
});

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mailLink } from './helpers/mail';

test('verified account controls, recovery, session revocation and deletion', async ({ page, playwright }) => {
  const email = `controls-${Date.now()}@example.test`, password = 'A secure test passphrase 123!', baseURL = 'http://127.0.0.1:3005';
  const client = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } });
  try {
    expect((await client.post('/api/auth/sign-up/email', { data: { name: 'Controls', email, password } })).status()).toBe(200);
    await page.goto(await mailLink(email)); await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Your event studio.' })).toBeVisible();
    expect((await page.request.get('/api/v1/admin/templates')).status()).toBe(403);
    expect((await page.request.post('/api/v1/admin/templates', { headers: { origin: baseURL }, data: {} })).status()).toBe(403);
    await client.post('/api/auth/sign-in/email', { data: { email, password } });
    await page.getByRole('button', { name: 'Account & security', exact: true }).click();
    await page.getByLabel('Profile name').fill('Updated owner'); await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByText('Profile updated.', { exact: true })).toBeVisible();
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(accessibility.violations).toEqual([]);
    const safeSessions = await (await client.get('/api/v1/account/sessions')).json();
    expect(safeSessions.sessions).toHaveLength(2); expect(JSON.stringify(safeSessions)).not.toContain('token');
    await page.getByRole('button', { name: 'Sign out device', exact: true }).click();
    await expect(page.getByText('Session revoked.', { exact: true })).toBeVisible();
    expect((await client.get('/api/v1/projects')).status()).toBe(401);
    const downloadPromise = page.waitForEvent('download'); await page.getByRole('link', { name: 'Download account data' }).click();
    expect((await downloadPromise).suggestedFilename()).toBe('invitation-maker-account.ndjson');
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.getByRole('button', { name: 'Forgot your password?', exact: true }).click();
    await page.getByLabel('Email address').fill(email); await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
    await expect(page.getByText('If an account matches this address, a password-reset link will arrive shortly.')).toBeVisible();
    await page.goto(await mailLink(email, 'Reset')); await page.getByLabel('New password', { exact: true }).fill(password + ' changed');
    await page.getByRole('button', { name: 'Set new password', exact: true }).click();
    await expect(page.getByText('Password updated. Sign in with your new password.')).toBeVisible();
    await page.getByLabel('Email address').fill(email); await page.getByLabel('Password', { exact: true }).fill(password + ' changed');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('button', { name: 'Account & security', exact: true }).click();
    await page.getByText('Delete account permanently', { exact: true }).click();
    await page.getByLabel('Current password', { exact: true }).fill(password + ' changed'); await page.getByLabel('Type DELETE to confirm').fill('DELETE');
    await page.getByRole('button', { name: 'Delete my account', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    expect((await client.post('/api/auth/sign-in/email', { data: { email, password: password + ' changed' } })).status()).toBe(401);
  } finally { await client.dispose(); }
});

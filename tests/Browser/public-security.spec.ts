import { expect, test } from '@playwright/test';

test('public home presents the complete club identity', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Rotary Renaissance/i);
    await expect(page.getByRole('img', { name: /Rotary Club of Taytay Renaissance/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /member sign in|open dashboard/i })).toBeVisible();
});

test('private dashboard redirects to sign in and public registration is disabled', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /register|sign up/i })).toHaveCount(0);
});

test('security headers protect browser responses', async ({ request }) => {
    const response = await request.get('/login');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBeTruthy();
    expect(response.headers()['referrer-policy']).toBeTruthy();
});

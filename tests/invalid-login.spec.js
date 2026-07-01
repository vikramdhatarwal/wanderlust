import { test, expect } from '@playwright/test';

test('User cannot login with invalid credentials', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Username:' }).fill('demo');
  await page.getByRole('textbox', { name: 'Password:' }).fill('wrongpassword');

  await page.getByRole('button', { name: 'Login' }).click();

  // Verify user is NOT logged in
  await expect(page.getByRole('link', { name: 'Logout' })).not.toBeVisible();

  // Verify user is still on the login page
  await expect(page).toHaveURL(/login/);
});
import { test, expect } from '@playwright/test';
import { login } from './utils/login';

test('User can login and logout', async ({ page }) => {
  await login(page);

  // Verify login
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();

  // Verify logout
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});
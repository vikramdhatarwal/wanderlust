import { test, expect } from '@playwright/test';

test('Guest cannot access Create Listing page', async ({ page }) => {
  await page.goto('/listings/new');

  // Should be redirected because user is not logged in
  await expect(page).toHaveURL(/login/);

  // Login page should be visible
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});
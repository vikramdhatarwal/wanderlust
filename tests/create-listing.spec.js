import { test, expect } from '@playwright/test';
import { login } from './utils/login';
import { createListing, deleteOpenListing, openListingByTitle, uniqueListingTitle } from './utils/listings';

test('User can create a listing', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

  const listing = await createListing(page, {
    title: uniqueListingTitle('demo'),
    description: 'Playwright automated test',
  });

  await openListingByTitle(page, listing.title);
  await deleteOpenListing(page);
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

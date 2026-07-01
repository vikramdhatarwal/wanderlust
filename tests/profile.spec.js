import { test, expect } from '@playwright/test';
import { login } from './utils/login';
import { createListing, deleteOpenListing, openListingByTitle } from './utils/listings';

test('logged in user can view profile and their listings', async ({ page }) => {
  await login(page);

  const listing = await createListing(page, {
    title: `qa-profile-${Date.now()}`,
    category: 'Rooms',
  });

  await page.locator('a[href="/profile"]').click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Your profile')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your listings' })).toBeVisible();
  await expect(page.getByText(listing.title)).toBeVisible();

  await openListingByTitle(page, listing.title);
  await deleteOpenListing(page);
});

import { test, expect } from '@playwright/test';
import { login } from './utils/login';
import { createListing, deleteOpenListing, openListingByTitle } from './utils/listings';

test('User can edit a listing', async ({ page }) => {
  await login(page);

  const listing = await createListing(page, {
    title: `qa-edit-${Date.now()}`,
  });
  const updatedTitle = `Updated Listing ${Date.now()}`;

  await openListingByTitle(page, listing.title);
  await page.getByRole('link', { name: 'Edit Listing' }).click();

  await page.getByRole('textbox', { name: 'Title' }).fill(updatedTitle);
  await page.getByRole('button', { name: 'Update Listing' }).click();

  await expect(page).toHaveURL(/\/listings\/[^/]+$/);
  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();

  await deleteOpenListing(page);
});

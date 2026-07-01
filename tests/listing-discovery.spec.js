import { test, expect } from '@playwright/test';
import { login } from './utils/login';
import { createListing, deleteOpenListing, openListingByTitle } from './utils/listings';

test('user can search listings by title', async ({ page }) => {
  await login(page);

  const listing = await createListing(page, {
    title: `qa-search-${Date.now()}`,
    category: 'Nature',
    location: 'Udaipur',
  });

  await page.getByRole('searchbox', { name: 'Search destinations' }).fill(listing.title);
  await page.getByRole('button', { name: 'Search listings' }).click();

  await expect(page).toHaveURL(/\/listings\?q=/);
  await expect(page.getByText(`for "${listing.title}"`)).toBeVisible();
  await expect(page.locator('.listing-card').filter({ hasText: listing.title })).toBeVisible();

  await openListingByTitle(page, listing.title);
  await deleteOpenListing(page);
});

test('user can filter listings by category', async ({ page }) => {
  await page.goto('/listings');

  await page.getByRole('link', { name: 'Show Nature listings' }).click();

  await expect(page).toHaveURL(/category=Nature/);
  await expect(page.locator('.filter.active', { hasText: 'Nature' })).toBeVisible();
});

test('tax switch toggles GST details on listing cards', async ({ page }) => {
  await page.goto('/listings');

  const taxInfo = page.locator('.tax-info').first();
  await expect(taxInfo).toBeHidden();

  await page.getByRole('switch', { name: 'Display total after taxes' }).check();

  await expect(taxInfo).toBeVisible();
});

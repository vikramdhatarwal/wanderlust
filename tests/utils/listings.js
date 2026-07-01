import { expect } from '@playwright/test';

export function uniqueListingTitle(prefix = 'qa-listing') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export async function createListing(page, overrides = {}) {
  const listing = {
    title: uniqueListingTitle(),
    description: 'Playwright automated listing created for feature coverage.',
    price: '123',
    country: 'India',
    category: 'Other',
    location: 'Rajasthan',
    imagePath: 'tests/assets/random.jpg',
    ...overrides,
  };

  await page.goto('/listings/new');
  await expect(page.getByRole('heading', { name: 'Create New Listing' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Title' }).fill(listing.title);
  await page.getByRole('textbox', { name: 'Description' }).fill(listing.description);
  await page.getByLabel('Upload Image').setInputFiles(listing.imagePath);
  await page.getByRole('spinbutton', { name: 'Price' }).fill(listing.price);
  await page.getByRole('textbox', { name: 'Country' }).fill(listing.country);
  await page.getByLabel('Category').selectOption(listing.category);
  await page.getByRole('textbox', { name: 'Location / Address' }).fill(listing.location);
  await page.getByRole('button', { name: 'Create Listing' }).click();

  await expect(page).toHaveURL(/\/listings$/);
  await expect(page.getByText('Successfully created a new listing!')).toBeVisible();

  return listing;
}

export async function openListingByTitle(page, title) {
  await page.goto(`/listings?q=${encodeURIComponent(title)}`);
  await expect(page.locator('.listing-card').filter({ hasText: title })).toBeVisible();
  await page.locator('.listing-card').filter({ hasText: title }).first().click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

export async function deleteOpenListing(page) {
  await page.getByRole('button', { name: 'Delete Listing' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm Delete' })).toBeVisible();
  await page.locator('form[action*="_method=DELETE"]').getByRole('button', { name: 'Delete Listing' }).click();
  await expect(page).toHaveURL(/\/listings$/);
  await expect(page.getByText('Successfully deleted the listing!')).toBeVisible();
}

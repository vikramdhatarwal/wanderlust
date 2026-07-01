import { test, expect } from '@playwright/test';
import { login } from './utils/login';
import { createListing, deleteOpenListing, openListingByTitle } from './utils/listings';

test('logged in user can add and delete a review', async ({ page }) => {
  await login(page);

  const listing = await createListing(page, {
    title: `qa-review-${Date.now()}`,
  });
  const comment = `Excellent test stay ${Date.now()}`;

  await openListingByTitle(page, listing.title);
  await page.locator('#first-rate5').check({ force: true });
  await page.getByRole('textbox', { name: 'Comment' }).fill(comment);
  await page.getByRole('button', { name: 'Submit Review' }).click();

  await expect(page.getByText('Successfully created a new review!')).toBeVisible();
  const reviewCard = page.locator('.listing-review-card').filter({ hasText: comment });
  await expect(reviewCard).toBeVisible();
  await expect(reviewCard.getByText('5 / 5')).toBeVisible();

  await reviewCard.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Successfully deleted the review!')).toBeVisible();
  await expect(page.getByText(comment)).not.toBeVisible();

  await deleteOpenListing(page);
});

test('guest cannot see the review form', async ({ page }) => {
  await page.goto('/listings');
  await page.locator('.listing-card').first().click();

  await expect(page.getByRole('button', { name: 'Submit Review' })).not.toBeVisible();
});

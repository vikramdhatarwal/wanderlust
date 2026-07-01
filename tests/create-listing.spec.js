import { test, expect } from '@playwright/test';
import { login } from './utils/login';

test('User can create a listing', async ({ page }) => {
  const title = `demo-${Date.now()}`;



  // Login
  await login(page);

  // Verify login
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();

  // Create Listing
  await page.getByRole('link', { name: 'Create Listing' }).click();

  await expect(page).toHaveURL(/new/);

  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Description' }).fill('Playwright automated test');

  await page
    .getByRole('button', { name: 'Upload Image' })
    .setInputFiles('tests/assets/random.jpg');

  await page.getByRole('spinbutton', { name: 'Price' }).fill('123');
  await page.getByRole('textbox', { name: 'Country' }).fill('India');
  await page.getByLabel('Category').selectOption('Other');
  await page.getByRole('textbox', { name: 'Location / Address' }).fill('Rajasthan');

  await page.getByRole('button', { name: 'Create Listing' }).click();

  // Verify redirect to listings page
  await expect(page).toHaveURL(/\/listings$/);

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();

  // Verify logout
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});
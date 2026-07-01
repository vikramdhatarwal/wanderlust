import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

test('login redirects guests back to the protected page they requested', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('You must be logged in to do that')).toBeVisible();

  await page.getByRole('textbox', { name: 'Username:' }).fill(process.env.TEST_USERNAME);
  await page.getByRole('textbox', { name: 'Password:' }).fill(process.env.TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText('Your profile')).toBeVisible();
});

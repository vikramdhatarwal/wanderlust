import { test, expect } from '@playwright/test';

test('new user can sign up and is logged in', async ({ page }) => {
  const unique = Date.now();
  const username = `qauser${unique}`;

  await page.goto('/register');

  await page.getByRole('textbox', { name: 'Username:' }).fill(username);
  await page.getByRole('textbox', { name: 'Email:' }).fill(`${username}@example.com`);
  await page.getByLabel('Password:').fill(`Password-${unique}`);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page.getByText('Welcome to WonderLust!')).toBeVisible();
  await expect(page.getByRole('link', { name: new RegExp(username) })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});

test('duplicate signup stays on register page with an error', async ({ page }) => {
  const unique = Date.now();
  const username = `duplicate${unique}`;
  const email = `${username}@example.com`;
  const password = `Password-${unique}`;

  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Username:' }).fill(username);
  await page.getByRole('textbox', { name: 'Email:' }).fill(email);
  await page.getByLabel('Password:').fill(password);
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Username:' }).fill(username);
  await page.getByRole('textbox', { name: 'Email:' }).fill(email);
  await page.getByLabel('Password:').fill(password);
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByText('Already registered with this email or username. Please try again.')).toBeVisible();
});

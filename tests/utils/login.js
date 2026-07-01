import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });
console.log(process.env.TEST_USERNAME);
export async function login(page) {
  await page.goto('/');

  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Username:' }).fill(process.env.TEST_USERNAME);

  await page.getByRole('textbox', { name: 'Password:' }).fill(process.env.TEST_PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();
}
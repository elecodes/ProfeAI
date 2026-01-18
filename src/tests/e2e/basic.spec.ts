import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Profe AI/i);
});

test('navigation to dialogues', async ({ page }) => {
  await page.goto('/');

  // Click the "Diálogos" link.
  await page.getByTestId('nav-dialogues-btn').click();

  // Expects page to show restricted access message since we are not logged in
  const heading = page.getByRole('heading', { level: 2, name: /Acceso Restringido/i });
  await expect(heading).toBeVisible();
});

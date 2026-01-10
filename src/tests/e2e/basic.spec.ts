import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/tutor-idiomas/i);
});

test('navigation to dialogues', async ({ page }) => {
  await page.goto('/');

  // Click the "Diálogos" link.
  await page.getByRole('button', { name: /Diálogos/i }).click();

  // Expects page to show restricted access message since we are not logged in
  const heading = page.getByRole('heading', { level: 2, name: /Acceso Restringido/i });
  await expect(heading).toBeVisible();
});

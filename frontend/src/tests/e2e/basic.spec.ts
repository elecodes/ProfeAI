import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Profe AI/i);
});

test('navigation to dialogues', async ({ page }) => {
  await page.goto('/');

  // Click the "Diálogos" link.
  // We use .first() because it might be in both Sidebar and HomePage tabs
  const dialogueBtn = page.getByTestId('nav-dialogues-btn').first();
  // Scroll into view first (needed for webkit which may render a narrow viewport)
  await dialogueBtn.scrollIntoViewIfNeeded();
  await dialogueBtn.waitFor({ state: 'visible' });
  await dialogueBtn.click();

  // Expects page to show restricted access message since we are not logged in
  const heading = page.getByRole('heading', { level: 2, name: /Acceso Restringido/i });
  await expect(heading).toBeVisible();
});


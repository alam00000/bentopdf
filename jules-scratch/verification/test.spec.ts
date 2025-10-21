import { test, expect } from '@playwright/test';

test('Add Form Fields tool loads after file upload', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Click the "Add Form Fields" tool card.
  await page.click('[data-tool-id="add-form"]');

  // Upload a PDF file.
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('test.pdf');

  // Wait for the form options to become visible.
  await page.waitForSelector('#form-options', { state: 'visible' });

  // Take a screenshot to verify the UI.
  await page.screenshot({ path: 'jules-scratch/verification/bug-fix-verification.png' });
});

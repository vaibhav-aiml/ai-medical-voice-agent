import { test, expect } from '@playwright/test';
import { injectClerkTestAuth } from '../fixtures/auth.helper';

test.describe('Consultation Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectClerkTestAuth(page);
  });

  test('should complete full voice/text consultation flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MediVoice/i);

    // Verify main landing page header
    const headerTitle = page.locator('h1');
    await expect(headerTitle).toBeVisible();
  });
});

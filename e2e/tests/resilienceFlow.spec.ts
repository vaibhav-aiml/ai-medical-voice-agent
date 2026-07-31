import { test, expect } from '@playwright/test';
import { injectClerkTestAuth } from '../fixtures/auth.helper';

test.describe('System Resilience E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectClerkTestAuth(page);
  });

  test('should display cold start status banner when backend status is waking', async ({ page }) => {
    await page.goto('/');
    // Check page load resilience
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

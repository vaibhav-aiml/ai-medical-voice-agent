import { Page } from '@playwright/test';

export async function injectClerkTestAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem('clerk_test_user_id', 'dev-user-123');
    window.sessionStorage.setItem('clerk_test_authenticated', 'true');
  });
}

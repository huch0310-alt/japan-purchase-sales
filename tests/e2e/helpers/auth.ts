import { Page } from '@playwright/test';

export async function loginAs(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function logout(page: Page): Promise<void> {
  await page.click('button:has-text("退出登录")');
  await page.click('button:has-text("确定")');
  await page.waitForURL('**/login');
}

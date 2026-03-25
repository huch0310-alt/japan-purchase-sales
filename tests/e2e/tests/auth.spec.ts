import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testUsers } from '../helpers/data';

test.describe('认证测试', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('super_admin 登录成功', async ({ page }) => {
    await loginPage.login(testUsers.super_admin.username, testUsers.super_admin.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin 登录成功', async ({ page }) => {
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('sales 登录成功', async ({ page }) => {
    await loginPage.login(testUsers.sales.username, testUsers.sales.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('无效凭据登录失败', async ({ page }) => {
    await loginPage.goto();
    await page.fill('.el-input__inner[type="text"]', 'invalid');
    await page.fill('.el-input__inner[type="password"]', 'wrongpassword');
    await page.click('button.el-button--primary');
    await loginPage.expectError();
  });
});

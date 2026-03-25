import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { StaffPage } from '../pages/StaffPage';
import { testUsers, generateStaffData } from '../helpers/data';

test.describe('员工管理测试', () => {
  let page: Page;
  let staffPage: StaffPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    staffPage = new StaffPage(page);
    loginPage = new LoginPage(page);

    // Login as super_admin
    await loginPage.goto();
    await loginPage.login(testUsers.super_admin.username, testUsers.super_admin.password);
    await page.waitForURL('**/dashboard');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('创建新员工', async () => {
    const staffData = generateStaffData();
    await staffPage.goto();
    await staffPage.clickCreate();
    await staffPage.fillStaffForm(staffData);
    await staffPage.save();

    // Verify success message or new staff in list
    await expect(page.locator('text=/成功|已创建/i')).toBeVisible({ timeout: 5000 });
  });

  test('编辑员工信息', async () => {
    // First create a staff
    const staffData = generateStaffData();
    await staffPage.goto();
    await staffPage.clickCreate();
    await staffPage.fillStaffForm(staffData);
    await staffPage.save();
    await page.waitForTimeout(1000);

    // Then edit - pass isEdit=true to skip username field (disabled in edit mode)
    await staffPage.editStaff(staffData.username);
    await staffPage.fillStaffForm({ ...staffData, name: '更新后的名称' }, true);
    await staffPage.save();

    await expect(page.locator('text=/成功|已更新/i')).toBeVisible({ timeout: 5000 });
  });

  test('删除员工', async () => {
    // First create a staff
    const staffData = generateStaffData();
    await staffPage.goto();
    await staffPage.clickCreate();
    await staffPage.fillStaffForm(staffData);
    await staffPage.save();
    await page.waitForTimeout(1000);

    // Then delete
    await staffPage.deleteStaff(staffData.username);
    await page.waitForTimeout(500);
  });

  test('按角色筛选员工', async () => {
    await staffPage.goto();
    await staffPage.filterByRole('admin');
    await page.waitForTimeout(500);
  });
});

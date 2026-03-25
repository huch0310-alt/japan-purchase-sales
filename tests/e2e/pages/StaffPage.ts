import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class StaffPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/staff`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('.el-table', { timeout: 10000 });
  }

  async clickCreate() {
    await this.page.click('button:has-text("新增员工")');
    await this.page.waitForSelector('.el-dialog', { timeout: 5000 });
  }

  async fillStaffForm(data: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }, isEdit = false) {
    // Get all form items with labels
    const formItems = this.page.locator('.el-dialog .el-form-item');

    // Fill username only if not editing (it's disabled in edit mode)
    if (!isEdit) {
      const usernameItem = formItems.filter({ hasText: '账号' });
      const usernameInput = usernameItem.locator('input');
      if (await usernameInput.isEnabled()) {
        await usernameInput.fill(data.username);
      }
    }

    // Fill password (optional for edit)
    if (data.password) {
      const passwordItem = formItems.filter({ hasText: '密码' });
      await passwordItem.locator('input').fill(data.password);
    }

    // Fill name (姓名)
    const nameItem = formItems.filter({ hasText: '姓名' });
    await nameItem.locator('input').fill(data.name);

    // Fill phone if provided (电话)
    if (data.phone) {
      const phoneItem = formItems.filter({ hasText: '电话' });
      await phoneItem.locator('input').fill(data.phone);
    }

    // Select role
    const roleItem = formItems.filter({ hasText: '角色' });
    await roleItem.locator('.el-select').click();
    await this.page.waitForSelector('.el-select-dropdown', { timeout: 5000 });

    // Map role names
    const roleMap: { [key: string]: string } = {
      'admin': '管理员',
      'super_admin': '超级管理员',
      'sales': '销售',
      'procurement': '采购',
    };
    const roleText = roleMap[data.role] || data.role;
    await this.page.click(`.el-select-dropdown__item:has-text("${roleText}")`);
  }

  async save() {
    // Click confirm button
    await this.page.locator('.el-dialog__footer button:has-text("确认")').click();

    // Wait for dialog to close or error to appear (max 10 seconds)
    await Promise.race([
      this.page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 }),
      this.page.waitForSelector('.el-message--error', { timeout: 10000 }),
    ]).catch(() => {
      // Ignore timeout, dialog might already be closed
    });
  }

  async editStaff(username: string) {
    const row = this.page.locator(`.el-table__row:has-text("${username}")`);
    await row.hover();
    await row.locator('button:has-text("编辑")').click();
    await this.page.waitForSelector('.el-dialog', { timeout: 5000 });
  }

  async deleteStaff(username: string) {
    const row = this.page.locator(`.el-table__row:has-text("${username}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.waitForTimeout(500);
    // Handle confirmation dialog - check if it's a MessageBox or a confirm button
    const confirmButton = this.page.locator('button:has-text("确定")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
  }

  async filterByRole(role: string) {
    // The filter select is likely in the header area, not in a dialog
    const filterSelect = this.page.locator('.card-header .el-select, .toolbar .el-select').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await this.page.waitForSelector('.el-select-dropdown', { timeout: 5000 });

      const roleMap: { [key: string]: string } = {
        'admin': '管理员',
        'super_admin': '超级管理员',
        'sales': '销售',
        'procurement': '采购',
      };
      const roleText = roleMap[role] || role;
      await this.page.click(`.el-select-dropdown__item:has-text("${roleText}")`);
    }
  }
}

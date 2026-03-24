import { Page } from '@playwright/test';

export class StaffPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/staff');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增员工")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillStaffForm(data: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }) {
    await this.page.fill('input[name="username"]', data.username);
    await this.page.fill('input[name="password"]', data.password);
    await this.page.fill('input[name="name"]', data.name);
    if (data.phone) {
      await this.page.fill('input[name="phone"]', data.phone);
    }
    await this.page.click('.el-dialog .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${data.role}")`);
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async deleteStaff(username: string) {
    const row = this.page.locator(`.el-table__row:has-text("${username}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }
}

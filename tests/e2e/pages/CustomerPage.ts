import { Page } from '@playwright/test';

export class CustomerPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/customer');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增客户")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillCustomerForm(data: {
    username: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    address?: string;
    vipDiscount?: string;
  }) {
    await this.page.fill('input[name="username"]', data.username);
    await this.page.fill('input[name="companyName"]', data.companyName);
    await this.page.fill('input[name="contactPerson"]', data.contactPerson);
    await this.page.fill('input[name="phone"]', data.phone);
    if (data.address) {
      await this.page.fill('input[name="address"]', data.address);
    }
    if (data.vipDiscount) {
      await this.page.fill('input[name="vipDiscount"]', data.vipDiscount);
    }
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async deleteCustomer(companyName: string) {
    const row = this.page.locator(`.el-table__row:has-text("${companyName}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }
}

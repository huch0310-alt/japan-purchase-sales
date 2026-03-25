import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class InvoiceGeneratePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/invoice-generate`);
    await this.page.waitForLoadState('networkidle');
  }

  async selectCustomer(customerId: string) {
    await this.page.click('.filter-section .el-select input');
    await this.page.waitForSelector('.el-select-dropdown');
    // Try to find and click the customer option
    const option = this.page.locator(`.el-select-dropdown__item:has-text("${customerId}")`).first();
    if (await option.isVisible()) {
      await option.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async selectOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('.el-checkbox__input').click();
  }

  async clickGenerate() {
    await this.page.click('button:has-text("生成请求书")');
    await this.page.waitForTimeout(1000);
  }

  async getAvailableOrdersCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}

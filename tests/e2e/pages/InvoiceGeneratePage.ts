import { Page } from '@playwright/test';

export class InvoiceGeneratePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/invoice-generate');
    await this.page.waitForLoadState('networkidle');
  }

  async selectCustomer(companyName: string) {
    await this.page.click('.filter-section .el-select input');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${companyName}")`);
    await this.page.waitForTimeout(1000);
  }

  async selectOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('.el-checkbox__input').click();
  }

  async clickGenerateButton() {
    await this.page.click('button:has-text("生成请求书")');
    await this.page.waitForSelector('.el-dialog');
  }

  async setDueDate(daysFromNow: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const dateStr = date.toISOString().split('T')[0];
    await this.page.fill('.el-date-editor input', dateStr);
  }

  async confirmGenerate() {
    await this.page.click('.el-dialog button:has-text("确认")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async getAvailableOrdersCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}

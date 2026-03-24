import { Page } from '@playwright/test';

export class InvoicePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/invoice');
    await this.page.waitForLoadState('networkidle');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async viewInvoice(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    await row.locator('button:has-text("查看")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async markAsPaid(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    await row.locator('button:has-text("标记付款")').click();
    await this.page.waitForTimeout(500);
  }
}

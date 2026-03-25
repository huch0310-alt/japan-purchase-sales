import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class InvoicePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/invoice`);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: string) {
    // Find status filter dropdown in the page header or toolbar
    const filterSelect = this.page.locator('.card-header .el-select').first();
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await this.page.waitForSelector('.el-select-dropdown');
      const statusMap: { [key: string]: string } = {
        'unpaid': '未付款',
        'paid': '已付款',
        'overdue': '已逾期',
      };
      await this.page.click(`.el-select-dropdown__item:has-text("${statusMap[status] || status}")`);
      await this.page.waitForTimeout(500);
    }
  }

  async viewInvoice(invoiceNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${invoiceNo}")`);
    await row.locator('button:has-text("查看")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}

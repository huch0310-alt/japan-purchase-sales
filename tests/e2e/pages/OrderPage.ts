import { Page } from '@playwright/test';

export class OrderPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/order');
    await this.page.waitForLoadState('networkidle');
  }

  async confirmOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("确认")').click();
    await this.page.waitForTimeout(500);
  }

  async completeOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("完成")').click();
    await this.page.waitForTimeout(500);
  }

  async viewOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("详情")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async getInvoiceStatus(orderNo: string): Promise<string> {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    const invoiceCell = row.locator('td').nth(6);
    return invoiceCell.textContent();
  }

  async filterByStatus(status: string) {
    await this.page.click('.el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    const statusMap: { [key: string]: string } = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消',
    };
    await this.page.click(`.el-select-dropdown__item:has-text("${statusMap[status] || status}")`);
    await this.page.waitForTimeout(500);
  }
}

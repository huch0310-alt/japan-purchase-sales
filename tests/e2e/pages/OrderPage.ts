import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class OrderPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/order`);
    await this.page.waitForLoadState('networkidle');
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

  async viewOrder(orderNo: string) {
    const row = this.page.locator(`.el-table__row:has-text("${orderNo}")`);
    await row.locator('button:has-text("详情")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}

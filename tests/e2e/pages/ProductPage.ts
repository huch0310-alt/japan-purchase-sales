import { Page } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/product');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddButton() {
    await this.page.click('button:has-text("新增商品")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillProductForm(data: {
    name: string;
    category: string;
    unit: string;
    purchasePrice: string;
    salePrice: string;
    quantity: string;
    description?: string;
  }) {
    await this.page.fill('input[name="name"]', data.name);
    await this.page.click('.el-dialog .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    await this.page.click(`.el-select-dropdown__item:has-text("${data.category}")`);
    await this.page.fill('input[name="unit"]', data.unit);
    await this.page.fill('input[name="purchasePrice"]', data.purchasePrice);
    await this.page.fill('input[name="salePrice"]', data.salePrice);
    await this.page.fill('input[name="quantity"]', data.quantity);
    if (data.description) {
      await this.page.fill('textarea[name="description"]', data.description);
    }
  }

  async submit() {
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async approveProduct(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.locator('button:has-text("审核")').click();
    await this.page.click('button:has-text("通过")');
  }

  async activateProduct(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.locator('button:has-text("上架")').click();
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }

  async filterByStatus(status: string) {
    await this.page.click('.filter-section .el-select');
    await this.page.waitForSelector('.el-select-dropdown');
    const statusMap: { [key: string]: string } = {
      'pending': '待审核',
      'approved': '已通过',
      'active': '上架',
      'inactive': '下架',
    };
    await this.page.click(`.el-select-dropdown__item:has-text("${statusMap[status] || status}")`);
    await this.page.waitForTimeout(500);
  }
}

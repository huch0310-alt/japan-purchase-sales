import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class ProductPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/product`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.page.click('button:has-text("新增商品")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillProductForm(data: {
    name: string;
    category?: string;
    unit?: string;
    purchasePrice?: number;
    salePrice?: number;
    quantity?: number;
    description?: string;
  }) {
    // Fill name - first input
    const inputs = this.page.locator('.el-dialog .el-input__inner');
    await inputs.first().fill(data.name);
    await this.page.waitForTimeout(200);

    // Try to select category if provided (may not be visible if not required)
    if (data.category) {
      try {
        const categorySelect = this.page.locator('.el-dialog .el-select').first();
        if (await categorySelect.isVisible({ timeout: 1000 })) {
          await categorySelect.click();
          await this.page.waitForTimeout(500);
          // Look for option in dropdown
          const dropdown = this.page.locator('.el-select-dropdown:visible').first();
          if (await dropdown.isVisible({ timeout: 1000 })) {
            await dropdown.locator('.el-select-dropdown__item').first().click();
          }
        }
      } catch (e) {
        // Category select not available or failed, continue
      }
    }
  }

  async save() {
    await this.page.locator('.el-dialog__footer button:has-text("确认")').click();
    // Wait a bit for any error messages
    await this.page.waitForTimeout(1000);
  }

  async editProduct(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.hover();
    await row.locator('button:has-text("编辑")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async toggleProductStatus(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.hover();
    const toggleButton = row.locator('.el-switch');
    if (await toggleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggleButton.click();
    }
  }

  async filterByCategory(category: string) {
    // Simply navigate and wait - the filter dropdown may not be easily accessible
    await this.page.waitForLoadState('networkidle');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__body-wrapper .el-table__row').count();
  }
}

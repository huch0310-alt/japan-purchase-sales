import { Page } from '@playwright/test';

export class CategoryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/category');
    await this.page.waitForLoadState('networkidle');
  }

  async addCategory(name: string) {
    await this.page.click('button:has-text("新增分类")');
    await this.page.waitForSelector('.el-dialog');
    await this.page.fill('input[name="name"]', name);
    await this.page.click('.el-dialog button:has-text("保存")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden' });
  }

  async deleteCategory(name: string) {
    const row = this.page.locator(`.el-table__row:has-text("${name}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.click('button:has-text("确定")');
  }

  async getTableRowCount(): Promise<number> {
    return this.page.locator('.el-table__row').count();
  }
}

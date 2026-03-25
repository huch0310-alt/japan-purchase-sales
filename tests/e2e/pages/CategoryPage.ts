import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class CategoryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/category`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.page.click('button:has-text("新增分类")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillCategoryForm(data: { name: string; sort?: number }) {
    // Use label-based selection for Element Plus forms
    const formItems = this.page.locator('.el-dialog .el-form-item');

    // Fill name - Element Plus inputs don't have name attribute
    const nameItem = formItems.filter({ hasText: '名称' });
    await nameItem.locator('.el-input__inner').fill(data.name);

    // Fill sort if provided
    if (data.sort !== undefined) {
      const sortItem = formItems.filter({ hasText: '排序' });
      await sortItem.locator('.el-input__inner').fill(String(data.sort));
    }
  }

  async save() {
    await this.page.click('.el-dialog button:has-text("确认")');
    await this.page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 5000 });
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

import { Page } from '@playwright/test';

const BASE_URL = 'http://43.153.155.76:3000';

export class CustomerPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/customer`);
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.page.click('button:has-text("新增客户")');
    await this.page.waitForSelector('.el-dialog');
  }

  async fillCustomerForm(data: {
    username?: string;
    companyName: string;
    invoiceName?: string;
    contactPerson: string;
    phone: string;
    invoicePhone?: string;
    address?: string;
    invoiceAddress?: string;
  }) {
    const formItems = this.page.locator('.el-dialog .el-form-item');

    // Fill username if provided (required for create)
    if (data.username) {
      const usernameItem = formItems.filter({ hasText: '账号' });
      const usernameInput = usernameItem.locator('.el-input__inner').first();
      if (await usernameInput.isVisible()) {
        await usernameInput.fill(data.username);
      }
    }

    // Fill company name
    const companyNameItem = formItems.filter({ hasText: '公司名称' });
    const companyInput = companyNameItem.locator('.el-input__inner').first();
    if (await companyInput.isVisible()) {
      await companyInput.fill(data.companyName);
    }

    // Fill contact person
    const contactItem = formItems.filter({ hasText: '联系人' });
    const contactInput = contactItem.locator('.el-input__inner').first();
    if (await contactInput.isVisible()) {
      await contactInput.fill(data.contactPerson);
    }

    // Fill phone
    const phoneItem = formItems.filter({ hasText: '电话' }).first();
    const phoneInput = phoneItem.locator('.el-input__inner').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(data.phone);
    }
  }

  async save() {
    await this.page.locator('.el-dialog__footer button:has-text("确认")').click();
    await Promise.race([
      this.page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 }),
      this.page.waitForSelector('.el-message--error', { timeout: 10000 }),
    ]).catch(() => {});
  }

  async editCustomer(companyName: string) {
    const row = this.page.locator(`.el-table__row:has-text("${companyName}")`);
    await row.hover();
    await row.locator('button:has-text("编辑")').click();
    await this.page.waitForSelector('.el-dialog');
  }

  async deleteCustomer(companyName: string) {
    const row = this.page.locator(`.el-table__row:has-text("${companyName}")`);
    await row.hover();
    await row.locator('button:has-text("删除")').click();
    await this.page.waitForTimeout(500);
    const confirmButton = this.page.locator('button:has-text("确定")').last();
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
  }

  async searchByName(name: string) {
    const searchInput = this.page.locator('.el-input__inner').first();
    await searchInput.fill(name);
    await this.page.waitForTimeout(500);
  }
}

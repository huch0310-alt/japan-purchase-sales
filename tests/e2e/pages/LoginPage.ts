import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://43.153.155.76:3000/login');
    // Wait for Vue app to mount
    await this.page.waitForSelector('.el-form', { timeout: 10000 });
  }

  async login(username: string, password: string) {
    // Wait for input fields to be visible
    await this.page.waitForSelector('.el-input__inner[type="text"]', { timeout: 10000 });
    await this.page.waitForSelector('.el-input__inner[type="password"]', { timeout: 10000 });

    await this.page.fill('.el-input__inner[type="text"]', username);
    await this.page.fill('.el-input__inner[type="password"]', password);
    await this.page.click('button.el-button--primary');
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  async expectError() {
    await this.page.waitForSelector('.el-message--error', { timeout: 5000 });
  }

  async getErrorMessage(): Promise<string> {
    return this.page.locator('.el-message--error').textContent() || '';
  }
}

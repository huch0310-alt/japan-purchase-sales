import { Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getStatCardValue(label: string): Promise<string> {
    const card = this.page.locator(`.el-card:has-text("${label}")`);
    return card.locator('.number').textContent() || '0';
  }
}

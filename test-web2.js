const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    console.log('Opening http://localhost:8080...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(8000);

    const screenshot = await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/screenshot2.png', fullPage: true });
    console.log('Screenshot saved');

    const errors2 = await page.evaluate(() => {
      return {
        networkRequests: window.performance ? window.performance.getEntriesByType('resource').length : 0,
        title: document.title
      };
    });

    console.log('Console messages:', consoleMessages.slice(0, 10));
    console.log('Page errors:', errors);
    console.log('Page info:', errors2);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

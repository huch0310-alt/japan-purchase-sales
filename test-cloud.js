const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const screenshot = await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/cloud-test.png', fullPage: true });
    console.log('Screenshot saved to cloud-test.png');

    const title = await page.title();
    console.log('Page title:', title);
    console.log('Page errors:', errors.length > 0 ? errors : 'None');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const errors = [];
  const logs = [];
  page.on('pageerror', error => errors.push('PAGE: ' + error.message));
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push('ERR: ' + text);
    if (text.includes('Error') || text.includes('error')) logs.push(text.substring(0, 100));
  });

  try {
    console.log('Opening Flutter web app...');
    const response = await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Status:', response.status());

    // Wait for Flutter to initialize
    console.log('Waiting for Flutter to load...');
    await page.waitForTimeout(10000);

    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/final-test.png', fullPage: true });
    console.log('Screenshot saved');

    const content = await page.content();
    console.log('Contains ログイン:', content.includes('ログイン'));
    console.log('Contains Material App:', content.includes('material') || content.includes('flutter'));

    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(e => console.log('  -', e.substring(0, 150)));
    } else {
      console.log('\nNo errors!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

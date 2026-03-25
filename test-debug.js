const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push('PAGE ERROR: ' + error.message);
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'networkidle', timeout: 60000 });
    console.log('Page loaded, waiting for Flutter...');
    await page.waitForTimeout(10000);

    const screenshot = await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/debug-test.png', fullPage: true });
    console.log('Screenshot saved');

    // Check page content
    const content = await page.content();
    console.log('Page has flutter-app:', content.includes('flutter-app') ? 'YES' : 'NO');
    console.log('Page has login text:', content.includes('登录') ? 'YES' : 'NO');

    // Check console messages
    console.log('\nConsole messages:');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 200)}`));

    console.log('\nErrors:');
    if (errors.length > 0) {
      errors.forEach(e => console.log('  -', e.substring(0, 300)));
    } else {
      console.log('  None');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/debug-error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', error => errors.push('PAGE ERROR: ' + error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text());
  });

  try {
    console.log('1. Opening login page...');
    await page.goto('http://43.153.155.76:3000/', { timeout: 120000 });
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/step1-login.png' });
    console.log('   Login page screenshot saved');

    console.log('2. Looking for login form...');
    const loginButton = await page.$('button');
    if (loginButton) {
      const buttonText = await loginButton.textContent();
      console.log('   Found button:', buttonText);
    }

    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/step2-filled.png' });

    const html = await page.content();
    console.log('   Page has login form:', html.includes('ログイン') ? 'YES' : 'NO');

    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(e => console.log('  -', e.substring(0, 200)));
    } else {
      console.log('\nNo errors!');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
})();

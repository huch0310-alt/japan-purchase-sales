const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-service-worker']
  });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const jsErrors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    jsErrors.push('PAGE ERROR: ' + error.message);
  });

  const allRequests = [];
  page.on('response', response => {
    allRequests.push({ url: response.url(), status: response.status() });
  });

  try {
    console.log('Opening http://43.153.155.76:3000 (service worker disabled)...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    console.log('\nWaiting for Flutter (30s)...');
    await page.waitForTimeout(30000);

    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 300)}`));

    console.log('\n=== JS Errors ===');
    if (jsErrors.length > 0) {
      jsErrors.forEach(e => console.log(`  - ${e.substring(0, 300)}`));
    } else {
      console.log('  None');
    }

    console.log('\n=== Network Requests ===');
    allRequests.forEach(r => console.log(`  ${r.status} ${r.url}`));

    // Check Flutter state
    const flutterState = await page.evaluate(() => {
      return {
        hasFlutter: !!window.flutter,
        hasFlutterLoader: !!window.flutter?.loader,
        flutterAppHTML: document.querySelector('flutter-app')?.innerHTML?.substring(0, 100)
      };
    });
    console.log('\n=== Flutter State ===');
    console.log(JSON.stringify(flutterState, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

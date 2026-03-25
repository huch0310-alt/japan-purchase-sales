const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const networkErrors = [];
  const consoleMessages = [];

  // Capture failed requests
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText
    });
  });

  // Capture all console messages
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleMessages.push({ type: 'pageerror', text: error.message });
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    const response = await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded, status:', response.status());

    console.log('Waiting for Flutter to initialize...');
    await page.waitForTimeout(20000);

    console.log('\n=== Network Errors ===');
    if (networkErrors.length > 0) {
      networkErrors.forEach(e => console.log(`  ${e.url}: ${e.failure}`));
    } else {
      console.log('  None');
    }

    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 300)}`));

    // Get detailed page info
    const info = await page.evaluate(() => {
      const flutterApp = document.querySelector('flutter-app');
      const scripts = Array.from(document.querySelectorAll('script'));
      return {
        flutterAppExists: !!flutterApp,
        flutterAppInnerHTML: flutterApp?.innerHTML?.substring(0, 200),
        scriptCount: scripts.length,
        scriptSrcs: scripts.map(s => s.src || 'inline')
      };
    });
    console.log('\n=== Page Info ===');
    console.log(JSON.stringify(info, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

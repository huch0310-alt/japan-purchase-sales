const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-logging', '--v=1']
  });
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 }
  });
  const page = await context.newPage();

  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', error => {
    consoleMessages.push({ type: 'pageerror', text: 'PAGE ERROR: ' + error.message });
  });

  // Listen for all requests
  page.on('response', response => {
    if (response.url().includes('dart.js') || response.url().includes('flutter')) {
      console.log(`  [NETWORK] ${response.url()} - ${response.status()}`);
    }
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    console.log('\nWaiting for Flutter (30s)...');
    await page.waitForTimeout(30000);

    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 400)}`));

    // Check if Flutter loaded
    const flutterLoaded = await page.evaluate(() => {
      return {
        hasFlutter: !!window.flutter,
        hasFlutterLoader: !!window.flutter?.loader,
        hasFlutterBuildConfig: !!window._flutter?.buildConfig,
        flutterAppHTML: document.querySelector('flutter-app')?.innerHTML?.substring(0, 100)
      };
    });
    console.log('\n=== Flutter State ===');
    console.log(JSON.stringify(flutterLoaded, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

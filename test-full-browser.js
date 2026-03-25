const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--use-gl=swiftshader'
    ]
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

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded, waiting 20s...');
    await page.waitForTimeout(20000);

    const flutterState = await page.evaluate(() => {
      const flutterApp = document.querySelector('flutter-app');
      const shadowRoot = flutterApp?.shadowRoot;
      return {
        hasFlutterApp: !!flutterApp,
        flutterAppHTML: flutterApp?.innerHTML?.substring(0, 200),
        hasShadowRoot: !!shadowRoot,
        shadowHTML: shadowRoot?.innerHTML?.substring(0, 200)
      };
    });

    console.log('\nFlutter State:', JSON.stringify(flutterState, null, 2));
    console.log('\nConsole Messages:');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 200)}`));

    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/full-browser-test.png' });
    console.log('\nScreenshot saved');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

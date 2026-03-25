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

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    // Wait for Flutter to initialize
    await page.waitForTimeout(15000);

    // Check Flutter state
    const flutterState = await page.evaluate(() => {
      // Check if flutter app element exists
      const flutterApp = document.querySelector('flutter-app');
      if (!flutterApp) return { error: 'No flutter-app element' };

      // Check shadow root
      const shadowRoot = flutterApp.shadowRoot;
      if (!shadowRoot) return { error: 'No shadow root', flutterAppHTML: flutterApp.innerHTML };

      // Check for elements in shadow DOM
      const body = shadowRoot.querySelector('flt-glass-pane');
      if (!body) return { error: 'No flt-glass-pane', shadowHTML: shadowRoot.innerHTML.substring(0, 500) };

      return {
        hasFlutterApp: true,
        hasShadowRoot: true,
        hasGlassPane: true,
        glassPaneHTML: body.innerHTML.substring(0, 500)
      };
    });

    console.log('\nFlutter state:');
    console.log(JSON.stringify(flutterState, null, 2));

    console.log('\nConsole messages:');
    consoleMessages.forEach(m => console.log(`  [${m.type}] ${m.text.substring(0, 200)}`));

    await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/flutter-state.png', fullPage: true });
    console.log('\nScreenshot saved');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

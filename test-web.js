const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('Opening http://localhost:8080...');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const screenshot = await page.screenshot({ path: 'C:/Users/Administrator/japan-purchase-sales/screenshot.png', fullPage: true });
    console.log('Screenshot saved to screenshot.png');

    const pageInfo = await page.evaluate(() => {
      const body = document.body;
      return {
        bodyWidth: body.offsetWidth,
        bodyHeight: body.offsetHeight,
        flutterAppCount: document.querySelectorAll('flutter-app').length,
        phoneFrameCount: document.querySelectorAll('.phone-frame').length,
        desktopWrapperCount: document.querySelectorAll('.desktop-wrapper').length,
        innerHTML: body.innerHTML.substring(0, 500)
      };
    });
    console.log('Page info:', JSON.stringify(pageInfo, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

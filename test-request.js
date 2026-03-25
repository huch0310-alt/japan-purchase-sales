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

  const allRequests = [];

  page.on('response', response => {
    allRequests.push({
      url: response.url(),
      status: response.status()
    });
  });

  try {
    console.log('Opening http://43.153.155.76:3000...');
    await page.goto('http://43.153.155.76:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Page loaded');

    console.log('\nWaiting for Flutter (30s)...');
    await page.waitForTimeout(30000);

    console.log('\n=== All Network Requests ===');
    allRequests.forEach(r => console.log(`  ${r.status} ${r.url}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();

const { chromium } = require('playwright');

const BASE_URL = 'http://43.153.155.76';
const TEST_TIMEOUT = 30000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('Starting comprehensive system tests...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Track test results
  const results = [];

  function logTest(name, passed, error = null) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    results.push({ name, passed, error });
    console.log(`${status}: ${name}`);
    if (error) console.log(`   Error: ${error}`);
  }

  try {
    // ========== 1. Login Page Tests ==========
    console.log('\n--- 1. Login Page Tests ---');

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    logTest('Login page loads', page.url().includes('/login') || (await page.content()).includes('登录'));

    // Check for customer login option (should be removed)
    const loginContent = await page.content();
    logTest('Customer login option removed', !loginContent.includes('客户登录') && !loginContent.includes('customerLogin'));

    // Try to login with test credentials
    await page.fill('input[type="text"], input[placeholder*="账号"], input[placeholder*="username"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');

    await page.click('button[type="submit"], button:has-text("登录"), button:has-text("Login")');
    await sleep(3000);

    const afterLoginUrl = page.url();
    logTest('Login successful - redirected from login', !afterLoginUrl.includes('/login'));

    // ========== 2. Dashboard Tests ==========
    console.log('\n--- 2. Dashboard Tests ---');

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(1000);

    const dashboardContent = await page.content();
    logTest('Dashboard loads', dashboardContent.includes('Dashboard') || dashboardContent.includes('信息统计') || dashboardContent.includes('情報統計'));

    // Check dashboard statistics cards
    logTest('Dashboard has stats cards', dashboardContent.includes('客户') || dashboardContent.includes('Customer') || dashboardContent.includes('顧客'));

    // ========== 3. Language Switching Tests ==========
    console.log('\n--- 3. Language Switching Tests ---');

    // Look for language switcher
    const langSwitcher = await page.$('select, .language-switch, [class*="language"], [class*="lang"]');
    if (langSwitcher) {
      logTest('Language switcher found', true);

      // Switch to English
      const options = await page.$$('select option, .el-select-option');
      for (const opt of options) {
        const text = await opt.textContent();
        if (text.includes('English') || text.includes('EN')) {
          await opt.click();
          break;
        }
      }
      await sleep(1000);

      const enContent = await page.content();
      logTest('English language works', enContent.includes('Dashboard') || enContent.includes('Customer'));
    } else {
      logTest('Language switcher found', false, 'No language switcher element found');
    }

    // ========== 4. Customer Management Tests ==========
    console.log('\n--- 4. Customer Management Tests ---');

    await page.goto(`${BASE_URL}/customers`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const customerContent = await page.content();
    logTest('Customer page loads', customerContent.includes('Customer') || customerContent.includes('客户') || customerContent.includes('顧客'));

    // Check if customer table exists
    logTest('Customer table/grid exists', customerContent.includes('el-table') || customerContent.includes('table'));

    // ========== 5. Product Management Tests ==========
    console.log('\n--- 5. Product Management Tests ---');

    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const productContent = await page.content();
    logTest('Product page loads', productContent.includes('Product') || productContent.includes('商品') || productContent.includes('商品管理'));

    // Check for Add Product button
    logTest('Add Product button exists', productContent.includes('addProduct') || productContent.includes('新增商品') || productContent.includes('商品を追加') || productContent.includes('Add Product'));

    // Click Add Product button
    const addProductBtn = await page.$('button:has-text("Add"), button:has-text("新增"), button:has-text("追加")');
    if (addProductBtn) {
      await addProductBtn.click();
      await sleep(1000);

      const dialogContent = await page.content();
      logTest('Add Product dialog opens', dialogContent.includes('el-dialog') || dialogContent.includes('商品'));

      // Fill in some test data
      const nameInput = await page.$('input[placeholder*="商品"], input[placeholder*="product"], input[placeholder*="商品名"]');
      if (nameInput) {
        await nameInput.fill('Test Product テスト商品');

        // Try to submit
        const submitBtn = await page.$('button:has-text("Confirm"), button:has-text("确认"), button:has-text("確認")');
        if (submitBtn) {
          await submitBtn.click();
          await sleep(2000);
          logTest('Add Product form can be filled', true);
        }
      }

      // Close dialog
      const cancelBtn = await page.$('button:has-text("Cancel"), button:has-text("取消"), button:has-text("キャンセル")');
      if (cancelBtn) await cancelBtn.click();
    }

    // ========== 6. Order Management Tests ==========
    console.log('\n--- 6. Order Management Tests ---');

    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const orderContent = await page.content();
    logTest('Order page loads', orderContent.includes('Order') || orderContent.includes('订单') || orderContent.includes('注文'));

    // ========== 7. Invoice Management Tests ==========
    console.log('\n--- 7. Invoice Management Tests ---');

    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const invoiceContent = await page.content();
    logTest('Invoice page loads', invoiceContent.includes('Invoice') || invoiceContent.includes('账单') || invoiceContent.includes('請求書'));

    // ========== 8. Category Management Tests ==========
    console.log('\n--- 8. Category Management Tests ---');

    await page.goto(`${BASE_URL}/categories`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const categoryContent = await page.content();
    logTest('Category page loads', categoryContent.includes('Category') || categoryContent.includes('分类') || categoryContent.includes('カテゴリ'));

    // ========== 9. Unit Management Tests ==========
    console.log('\n--- 9. Unit Management Tests ---');

    await page.goto(`${BASE_URL}/units`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const unitContent = await page.content();
    logTest('Unit page loads', unitContent.includes('Unit') || unitContent.includes('单位') || unitContent.includes('単位'));

    // ========== 10. Staff Management Tests ==========
    console.log('\n--- 10. Staff Management Tests ---');

    await page.goto(`${BASE_URL}/staff`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const staffContent = await page.content();
    logTest('Staff page loads', staffContent.includes('Staff') || staffContent.includes('员工') || staffContent.includes('従業員'));

    // ========== 11. Reports Tests ==========
    console.log('\n--- 11. Reports Tests ---');

    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const reportContent = await page.content();
    logTest('Reports page loads', reportContent.includes('Report') || reportContent.includes('报表') || reportContent.includes('レポート'));

    // ========== 12. Settings Tests ==========
    console.log('\n--- 12. Settings Tests ---');

    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const settingsContent = await page.content();
    logTest('Settings page loads', settingsContent.includes('Settings') || settingsContent.includes('设置') || settingsContent.includes('設定'));

    // ========== 13. Logs Tests ==========
    console.log('\n--- 13. Logs Tests ---');

    await page.goto(`${BASE_URL}/logs`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(2000);

    const logsContent = await page.content();
    logTest('Logs page loads', logsContent.includes('Logs') || logsContent.includes('日志') || logsContent.includes('ログ'));

    // ========== 14. API Tests ==========
    console.log('\n--- 14. API Tests ---');

    // Test stats API
    const statsResponse = await page.request.get(`${BASE_URL}/api/stats`);
    logTest('Stats API returns 200', statsResponse.status() === 200);

    // Test products API
    const productsResponse = await page.request.get(`${BASE_URL}/api/products`);
    logTest('Products API returns 200', productsResponse.status() === 200);

    // Test customers API
    const customersResponse = await page.request.get(`${BASE_URL}/api/customers`);
    logTest('Customers API returns 200', customersResponse.status() === 200);

    // ========== 15. Navigation Tests ==========
    console.log('\n--- 15. Navigation Tests ---');

    // Test direct URL access (SPA routing)
    await page.goto(`${BASE_URL}/customers`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(1000);
    logTest('Direct URL /customers works', page.url().includes('/customers'));

    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(1000);
    logTest('Direct URL /products works', page.url().includes('/products'));

    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle', timeout: TEST_TIMEOUT });
    await sleep(1000);
    logTest('Direct URL /orders works', page.url().includes('/orders'));

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    logTest('Test execution', false, error.message);
  }

  // Report results
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (consoleErrors.length > 0) {
    console.log(`\nConsole Errors (${consoleErrors.length}):`);
    consoleErrors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\nNo console errors detected');
  }

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`);
    });
  }

  await browser.close();

  console.log('\n========================================');
  console.log(failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED');
  console.log('========================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(console.error);

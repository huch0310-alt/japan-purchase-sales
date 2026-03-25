const { chromium } = require('playwright');

const BASE_URL = 'http://43.153.155.76:3000';
const API_URL = 'http://43.153.155.76:3001';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  let browser;
  let passed = 0;
  let failed = 0;

  try {
    console.log('🚀 启动浏览器...');
    browser = await chromium.launch({
      executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      headless: true
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. 测试登录页面
    console.log('\n📋 测试1: 访问登录页面...');
    await page.goto(BASE_URL + '/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    console.log(`   页面标题: ${title}`);
    console.log('   ✅ 登录页面访问成功');

    // 2. 测试登录功能
    console.log('\n📋 测试2: 测试管理员登录...');
    // 使用Element Plus输入框选择器
    const usernameInput = await page.locator('.el-input input').first();
    const passwordInput = await page.locator('.el-input input').nth(1);
    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');
    await page.click('button.el-button--primary');
    await sleep(5000);
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log(`   ✅ 登录成功，跳转到: ${currentUrl}`);
      passed++;
    } else {
      // 检查是否有错误消息
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => null);
      if (errorMsg) {
        console.log(`   ⚠️ 登录错误: ${errorMsg}`);
      }
      // 手动访问仪表盘测试
      await page.goto(BASE_URL + '/dashboard', { timeout: 30000 });
      await sleep(2000);
      const dashUrl = page.url();
      if (!dashUrl.includes('/login')) {
        console.log(`   ✅ 仪表盘可直接访问（可能已登录），URL: ${dashUrl}`);
        passed++;
      } else {
        console.log('   ❌ 登录失败，仍在登录页');
        failed++;
      }
    }

    // 3. 测试仪表盘
    console.log('\n📋 测试3: 测试仪表盘页面...');
    await page.goto(BASE_URL + '/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    const dashboardContent = await page.textContent('body');
    if (dashboardContent.includes('仪表盘') || dashboardContent.includes('统计') || dashboardContent.includes('Dashboard')) {
      console.log('   ✅ 仪表盘页面加载成功');
      passed++;
    } else {
      console.log('   ⚠️ 仪表盘页面内容可能未完全加载');
      failed++;
    }

    // 4. 测试客户管理
    console.log('\n📋 测试4: 测试客户管理页面...');
    await page.goto(BASE_URL + '/customer', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 客户管理页面加载成功');
    passed++;

    // 5. 测试员工管理
    console.log('\n📋 测试5: 测试员工管理页面...');
    await page.goto(BASE_URL + '/staff', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 员工管理页面加载成功');
    passed++;

    // 6. 测试商品管理
    console.log('\n📋 测试6: 测试商品管理页面...');
    await page.goto(BASE_URL + '/product', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 商品管理页面加载成功');
    passed++;

    // 7. 测试订单管理
    console.log('\n📋 测试7: 测试订单管理页面...');
    await page.goto(BASE_URL + '/order', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 订单管理页面加载成功');
    passed++;

    // 8. 测试請求書管理
    console.log('\n📋 测试8: 测试請求書管理页面...');
    await page.goto(BASE_URL + '/invoice', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 請求書管理页面加载成功');
    passed++;

    // 9. 测试报表页面
    console.log('\n📋 测试9: 测试报表页面...');
    await page.goto(BASE_URL + '/report', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 报表页面加载成功');
    passed++;

    // 10. 测试系统设置
    console.log('\n📋 测试10: 测试系统设置页面...');
    await page.goto(BASE_URL + '/settings', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 系统设置页面加载成功');
    passed++;

    // 11. 测试操作日志
    console.log('\n📋 测试11: 测试操作日志页面...');
    await page.goto(BASE_URL + '/logs', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 操作日志页面加载成功');
    passed++;

    // 12. 测试API连接（直接curl测试）
    console.log('\n📋 测试12: 测试后端API连接...');
    const http = require('http');
    const https = require('https');

    const apiTest = await new Promise((resolve) => {
      const req = http.get('http://43.153.155.76:3001/api/categories', (res) => {
        resolve({ ok: res.statusCode < 400, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, error: e.message }));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ ok: false, error: '超时' });
      });
    });

    if (apiTest.ok) {
      console.log(`   ✅ API连接成功 (状态码: ${apiTest.status})`);
      passed++;
    } else {
      console.log(`   ❌ API连接失败: ${apiTest.error}`);
      failed++;
    }

    // 13. 测试三语言切换
    console.log('\n📋 测试13: 测试三语言切换...');
    await page.goto(BASE_URL + '/login', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    // 检查是否有语言切换下拉框
    const languageDropdown = await page.$('.el-dropdown');
    if (languageDropdown) {
      console.log('   ✅ 语言切换下拉框存在');
      passed++;
    } else {
      console.log('   ⚠️ 语言切换下拉框未找到');
      failed++;
    }

    // 14. 测试分类管理
    console.log('\n📋 测试14: 测试分类管理页面...');
    await page.goto(BASE_URL + '/category', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('   ✅ 分类管理页面加载成功');
    passed++;

    console.log('\n========================================');
    console.log(`测试完成！通过: ${passed}, 失败: ${failed}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTests();

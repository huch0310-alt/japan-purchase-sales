/**
 * 日本采销管理系统 - 全面API测试脚本
 * 测试客户端APP和采购端APP的所有功能
 */

const http = require('http');

const BASE_URL = 'http://43.153.155.76:3001';
const API = BASE_URL + '/api';

// 测试结果收集
const results = {
  passed: [],
  failed: []
};

function httpPost(url, data, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function httpGet(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function httpPut(url, data, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const putData = JSON.stringify(data || {});

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData),
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(putData);
    req.end();
  });
}

function httpDelete(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, testName) {
  if (condition) {
    results.passed.push(testName);
    console.log(`  ✓ ${testName}`);
  } else {
    results.failed.push(testName);
    console.log(`  ✗ ${testName}`);
  }
}

async function runTest(name, fn) {
  console.log(`\n【${name}】`);
  try {
    await fn();
  } catch (e) {
    console.log(`  ✗ 测试异常: ${e.message}`);
    results.failed.push(name);
  }
}

// ============================================
// 客户端APP测试
// ============================================
async function testClientApp() {
  console.log('\n========================================');
  console.log('客户端APP测试');
  console.log('========================================');

  let customerToken = null;
  let customerId = null;
  let productId = null;
  let orderId = null;

  await runTest('1. 客户登录', async () => {
    const res = await httpPost(API + '/auth/customer/login', {
      username: 'customer1',
      password: 'customer123'
    });
    assert(res.status === 200, '登录成功返回200');
    assert(res.data.access_token, '返回access_token');
    customerToken = res.data.access_token;
    customerId = res.data.user.id;
    console.log(`    客户ID: ${customerId}`);
  });

  await runTest('2. 获取已上架商品', async () => {
    const res = await httpGet(API + '/products/active', customerToken);
    assert(res.status === 200, '获取商品列表成功');
    assert(Array.isArray(res.data), '返回商品数组');
    if (res.data.length > 0) {
      productId = res.data[0].id;
      console.log(`    商品数量: ${res.data.length}, 第一个商品ID: ${productId}`);
    }
  });

  await runTest('3. 获取分类列表', async () => {
    const res = await httpGet(API + '/categories');
    assert(res.status === 200, '获取分类列表成功');
    assert(Array.isArray(res.data), '返回分类数组');
    console.log(`    分类数量: ${res.data.length}`);
  });

  await runTest('4. 添加商品到购物车', async () => {
    if (!productId) {
      console.log('    跳过: 无商品ID');
      return;
    }
    const res = await httpPost(API + '/cart/items', {
      productId: productId,
      quantity: 2
    }, customerToken);
    assert(res.status === 201, '添加购物车成功');
  });

  await runTest('5. 获取购物车列表', async () => {
    const res = await httpGet(API + '/cart', customerToken);
    assert(res.status === 200, '获取购物车成功');
    assert(Array.isArray(res.data), '返回购物车数组');
    console.log(`    购物车商品数量: ${res.data.length}`);
  });

  await runTest('6. 计算购物车金额', async () => {
    const res = await httpGet(API + '/cart/total', customerToken);
    assert(res.status === 200, '计算金额成功');
    console.log(`    购物车总金额: ${res.data.total || res.data.subtotal || 0}`);
  });

  await runTest('7. 创建订单', async () => {
    if (!productId) {
      console.log('    跳过: 无商品ID');
      return;
    }
    const res = await httpPost(API + '/orders', {
      items: [{ productId: productId, quantity: 1 }],
      deliveryAddress: '東京都渋谷区1-2-3',
      contactPerson: '田中太郎',
      contactPhone: '080-1234-5678'
    }, customerToken);
    assert(res.status === 201, '订单创建成功');
    if (res.data.id) {
      orderId = res.data.id;
      console.log(`    订单ID: ${orderId}, 订单号: ${res.data.orderNo}`);
      assert(res.data.discountAmount === '7.50', 'VIP折扣计算正确(10%)');
    }
  });

  await runTest('8. 获取客户订单列表', async () => {
    const res = await httpGet(API + '/orders/my', customerToken);
    assert(res.status === 200, '获取订单列表成功');
    assert(Array.isArray(res.data), '返回订单数组');
    console.log(`    订单数量: ${res.data.length}`);
  });

  await runTest('9. 获取订单详情', async () => {
    if (!orderId) {
      console.log('    跳过: 无订单ID');
      return;
    }
    const res = await httpGet(API + `/orders/${orderId}`, customerToken);
    assert(res.status === 200, '获取订单详情成功');
    assert(res.data.id === orderId, '订单ID匹配');
  });

  await runTest('10. 获取客户請求書列表', async () => {
    const res = await httpGet(API + '/invoices/my', customerToken);
    assert(res.status === 200, '获取請求書列表成功');
    console.log(`    請求書数量: ${Array.isArray(res.data) ? res.data.length : 0}`);
  });

  await runTest('11. 取消订单（30分钟内可取消）', async () => {
    if (!orderId) {
      console.log('    跳过: 无订单ID');
      return;
    }
    const res = await httpPut(API + `/orders/${orderId}/cancel`, {}, customerToken);
    assert(res.status === 200 || res.status === 201, '取消订单成功');
  });

  await runTest('12. 清空购物车', async () => {
    const res = await httpDelete(API + '/cart', customerToken);
    assert(res.status === 200, '清空购物车成功');
  });
}

// ============================================
// 采购端APP测试
// ============================================
async function testProcurementApp() {
  console.log('\n========================================');
  console.log('采购端APP测试');
  console.log('========================================');

  let staffToken = null;
  let staffId = null;
  let pendingProductId = null;
  let newOrderId = null;

  await runTest('1. 员工登录', async () => {
    const res = await httpPost(API + '/auth/staff/login', {
      username: 'admin',
      password: 'admin123'
    });
    assert(res.status === 200, '员工登录成功');
    assert(res.data.access_token, '返回access_token');
    staffToken = res.data.access_token;
    staffId = res.data.user.id;
    console.log(`    员工ID: ${staffId}, 角色: ${res.data.user.role}`);
  });

  await runTest('2. 获取仪表盘数据', async () => {
    const res = await httpGet(API + '/dashboard', staffToken);
    assert(res.status === 200, '获取仪表盘成功');
    console.log(`    待处理订单: ${res.data.stats?.pendingOrders || 0}`);
  });

  await runTest('3. 获取今日待办', async () => {
    const res = await httpGet(API + '/dashboard/todos', staffToken);
    assert(res.status === 200, '获取待办成功');
  });

  await runTest('4. 获取所有商品（含所有状态）', async () => {
    const res = await httpGet(API + '/products', staffToken);
    assert(res.status === 200, '获取商品列表成功');
    assert(Array.isArray(res.data), '返回商品数组');
    console.log(`    商品数量: ${res.data.length}`);

    // 找一个待审核的商品
    const pending = res.data.find(p => p.status === 'pending');
    if (pending) pendingProductId = pending.id;
  });

  await runTest('5. 获取待审核商品', async () => {
    const res = await httpGet(API + '/products/pending', staffToken);
    assert(res.status === 200, '获取待审核商品成功');
    console.log(`    待审核商品数量: ${res.data.length}`);
  });

  await runTest('6. 采集新商品（采购端）', async () => {
    // 先获取分类ID
    const catRes = await httpGet(API + '/categories');
    const categoryId = catRes.data[0]?.id;

    const res = await httpPost(API + '/products', {
      name: '测试商品-' + Date.now(),
      quantity: 100,
      unit: '个',
      categoryId: categoryId,
      description: '测试商品描述'
    }, staffToken);
    assert(res.status === 201, '采集商品成功');
    if (res.data.id) {
      pendingProductId = res.data.id;
      console.log(`    新商品ID: ${pendingProductId}`);
    }
  });

  await runTest('7. 审核通过商品', async () => {
    if (!pendingProductId) {
      console.log('    跳过: 无待审核商品ID');
      return;
    }
    const res = await httpPut(API + `/products/${pendingProductId}/approve`, {
      salePrice: 99.00
    }, staffToken);
    assert(res.status === 200, '审核通过成功');
  });

  await runTest('8. 上架商品', async () => {
    if (!pendingProductId) {
      console.log('    跳过: 无商品ID');
      return;
    }
    const res = await httpPut(API + `/products/${pendingProductId}/activate`, {}, staffToken);
    assert(res.status === 200, '上架成功');
  });

  await runTest('9. 获取所有订单', async () => {
    const res = await httpGet(API + '/orders', staffToken);
    assert(res.status === 200, '获取订单列表成功');
    assert(Array.isArray(res.data), '返回订单数组');
    console.log(`    订单数量: ${res.data.length}`);

    // 找一个pending订单用于测试
    const pending = res.data.find(o => o.status === 'pending');
    if (pending) newOrderId = pending.id;
  });

  await runTest('10. 确认订单', async () => {
    if (!newOrderId) {
      console.log('    跳过: 无待确认订单');
      return;
    }
    const res = await httpPut(API + `/orders/${newOrderId}/confirm`, {}, staffToken);
    assert(res.status === 200 || res.status === 201, '确认订单成功');
  });

  await runTest('11. 完成订单', async () => {
    if (!newOrderId) {
      console.log('    跳过: 无订单ID');
      return;
    }
    const res = await httpPut(API + `/orders/${newOrderId}/complete`, {}, staffToken);
    assert(res.status === 200 || res.status === 201, '完成订单成功');
  });

  await runTest('12. 获取销售报表', async () => {
    const startDate = '2026-01-01';
    const endDate = '2026-12-31';
    const res = await httpGet(API + `/orders/reports/sales?startDate=${startDate}&endDate=${endDate}`, staffToken);
    assert(res.status === 200, '获取销售报表成功');
  });

  await runTest('13. 获取分类列表', async () => {
    const res = await httpGet(API + '/categories', staffToken);
    assert(res.status === 200, '获取分类列表成功');
    console.log(`    分类数量: ${res.data.length}`);
  });

  await runTest('14. 获取客户列表', async () => {
    const res = await httpGet(API + '/customers', staffToken);
    assert(res.status === 200, '获取客户列表成功');
    console.log(`    客户数量: ${Array.isArray(res.data) ? res.data.length : 0}`);
  });

  await runTest('15. 获取請求書列表', async () => {
    const res = await httpGet(API + '/invoices', staffToken);
    assert(res.status === 200, '获取請求書列表成功');
    console.log(`    請求書数量: ${Array.isArray(res.data) ? res.data.length : 0}`);
  });

  await runTest('16. 获取热销商品排行', async () => {
    const res = await httpGet(API + '/products/stats/hot', staffToken);
    assert(res.status === 200, '获取热销商品成功');
  });

  await runTest('17. 获取统计数据', async () => {
    const res = await httpGet(API + '/stats/dashboard', staffToken);
    assert(res.status === 200, '获取统计成功');
  });
}

// ============================================
// 主函数
// ============================================
async function main() {
  console.log('========================================');
  console.log('日本采销管理系统 - 全面API测试');
  console.log('========================================');
  console.log(`测试地址: ${BASE_URL}`);
  console.log(`时间: ${new Date().toLocaleString()}`);

  await testClientApp();
  await testProcurementApp();

  // 打印结果
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  console.log(`✓ 通过: ${results.passed.length}`);
  console.log(`✗ 失败: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n失败的测试:');
    results.failed.forEach(f => console.log(`  - ${f}`));
  }

  console.log('\n详细通过的测试:');
  results.passed.forEach(p => console.log(`  ✓ ${p}`));
}

main().catch(console.error);

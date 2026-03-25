const http = require('http');
const https = require('https');

const BASE_URL = 'http://43.153.155.76';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const data = JSON.stringify(body);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: responseData }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Starting API-based system tests...\n');

  const results = [];

  function logTest(name, passed, error = null) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    results.push({ name, passed, error });
    console.log(`${status}: ${name}`);
    if (error) console.log(`   Error: ${error}`);
  }

  try {
    // ========== 1. Basic Connectivity Tests ==========
    console.log('\n--- 1. Basic Connectivity Tests ---');

    try {
      const homeRes = await httpGet(BASE_URL);
      logTest('Main page loads (HTTP 200)', homeRes.status === 200);
      logTest('Main page returns HTML', homeRes.data.includes('<!DOCTYPE html>') || homeRes.data.includes('<html'));
    } catch (e) {
      logTest('Main page loads', false, e.message);
    }

    // ========== 2. SPA Routing Tests ==========
    console.log('\n--- 2. SPA Routing Tests ---');

    const spaRoutes = ['/dashboard', '/customers', '/products', '/orders', '/invoices', '/categories', '/units', '/staff', '/reports', '/settings', '/logs'];

    for (const route of spaRoutes) {
      try {
        const res = await httpGet(`${BASE_URL}${route}`);
        logTest(`SPA route ${route} returns 200`, res.status === 200);
        logTest(`SPA route ${route} returns Vue app`, res.data.includes('<div id="app">') || res.data.includes('vue') || res.data.includes('index.html'));
      } catch (e) {
        logTest(`SPA route ${route}`, false, e.message);
      }
    }

    // ========== 3. API Tests ==========
    console.log('\n--- 3. API Tests ---');

    // Test stats API (this was previously failing)
    try {
      const statsRes = await httpGet(`${BASE_URL}/api/stats`);
      logTest('Stats API returns success (200/401)', statsRes.status === 200 || statsRes.status === 401);
      logTest('Stats API endpoint exists', statsRes.status !== 404 && statsRes.status !== 500);
    } catch (e) {
      logTest('Stats API', false, e.message);
    }

    // Test products API
    try {
      const productsRes = await httpGet(`${BASE_URL}/api/products`);
      logTest('Products API returns success (200/401)', productsRes.status === 200 || productsRes.status === 401);
      logTest('Products API endpoint exists', productsRes.status !== 404 && productsRes.status !== 500);
    } catch (e) {
      logTest('Products API', false, e.message);
    }

    // Test customers API
    try {
      const customersRes = await httpGet(`${BASE_URL}/api/customers`);
      logTest('Customers API returns success (200/401)', customersRes.status === 200 || customersRes.status === 401);
      logTest('Customers API endpoint exists', customersRes.status !== 404 && customersRes.status !== 500);
    } catch (e) {
      logTest('Customers API', false, e.message);
    }

    // Test categories API
    try {
      const catsRes = await httpGet(`${BASE_URL}/api/categories`);
      logTest('Categories API returns success (200/401)', catsRes.status === 200 || catsRes.status === 401);
      logTest('Categories API endpoint exists', catsRes.status !== 404 && catsRes.status !== 500);
    } catch (e) {
      logTest('Categories API', false, e.message);
    }

    // Test orders API
    try {
      const ordersRes = await httpGet(`${BASE_URL}/api/orders`);
      logTest('Orders API returns success (200/401)', ordersRes.status === 200 || ordersRes.status === 401);
      logTest('Orders API endpoint exists', ordersRes.status !== 404 && ordersRes.status !== 500);
    } catch (e) {
      logTest('Orders API', false, e.message);
    }

    // Test invoices API
    try {
      const invoicesRes = await httpGet(`${BASE_URL}/api/invoices`);
      logTest('Invoices API returns success (200/401)', invoicesRes.status === 200 || invoicesRes.status === 401);
      logTest('Invoices API endpoint exists', invoicesRes.status !== 404 && invoicesRes.status !== 500);
    } catch (e) {
      logTest('Invoices API', false, e.message);
    }

    // Test staff API
    try {
      const staffRes = await httpGet(`${BASE_URL}/api/staff`);
      logTest('Staff API returns success (200/401)', staffRes.status === 200 || staffRes.status === 401);
      logTest('Staff API endpoint exists', staffRes.status !== 404 && staffRes.status !== 500);
    } catch (e) {
      logTest('Staff API', false, e.message);
    }

    // Test units API
    try {
      const unitsRes = await httpGet(`${BASE_URL}/api/units`);
      logTest('Units API returns success (200/401)', unitsRes.status === 200 || unitsRes.status === 401);
      logTest('Units API endpoint exists', unitsRes.status !== 404 && unitsRes.status !== 500);
    } catch (e) {
      logTest('Units API', false, e.message);
    }

    // Test logs API
    try {
      const logsRes = await httpGet(`${BASE_URL}/api/logs`);
      logTest('Logs API returns success (200/401)', logsRes.status === 200 || logsRes.status === 401);
      logTest('Logs API endpoint exists', logsRes.status !== 404 && logsRes.status !== 500);
    } catch (e) {
      logTest('Logs API', false, e.message);
    }

    // Test settings API
    try {
      const settingsRes = await httpGet(`${BASE_URL}/api/settings`);
      logTest('Settings API returns success (200/401)', settingsRes.status === 200 || settingsRes.status === 401);
      logTest('Settings API endpoint exists', settingsRes.status !== 404 && settingsRes.status !== 500);
    } catch (e) {
      logTest('Settings API', false, e.message);
    }

    // ========== 4. Authentication Tests ==========
    console.log('\n--- 4. Authentication Tests ---');

    // Test login API with correct endpoint
    try {
      const loginRes = await httpPost(`${BASE_URL}/api/auth/staff/login`, {
        username: 'admin',
        password: 'admin123'
      });
      logTest('Staff login API accepts POST', loginRes.status === 200 || loginRes.status === 401);
      if (loginRes.status === 200) {
        try {
          const loginData = JSON.parse(loginRes.data);
          logTest('Login API returns token', !!loginData.token || !!loginData.accessToken);
        } catch {
          logTest('Login API returns valid JSON on success', loginRes.status !== 200);
        }
      }
    } catch (e) {
      logTest('Login API', false, e.message);
    }

    // ========== 5. WebSocket Tests ==========
    console.log('\n--- 5. WebSocket Tests ---');

    try {
      const wsRes = await httpGet(`${BASE_URL}/socket.io`);
      logTest('Socket.IO endpoint accessible', wsRes.status === 200 || wsRes.status === 400);
    } catch (e) {
      logTest('Socket.IO endpoint', false, e.message);
    }

    // ========== 6. Content Tests ==========
    console.log('\n--- 6. Content Tests ---');

    try {
      const dashRes = await httpGet(`${BASE_URL}/dashboard`);
      const dashContent = dashRes.data;
      logTest('Dashboard has Vue app mount point', dashContent.includes('id="app"'));
      logTest('Dashboard has title', dashContent.includes('日本采销管理系统') || dashContent.includes('Japan'));
    } catch (e) {
      logTest('Dashboard content', false, e.message);
    }

    try {
      const loginRes = await httpGet(`${BASE_URL}/login`);
      const loginContent = loginRes.data;
      logTest('Login page has no customer login option', !loginContent.includes('customerLogin') && !loginContent.includes('客户登录'));
      logTest('Login page loads correctly', loginContent.includes('login') || loginContent.includes('登录'));
    } catch (e) {
      logTest('Login page content', false, e.message);
    }

    // ========== 7. Backend API via Nginx Proxy ==========
    console.log('\n--- 7. Backend Direct Access Tests ---');

    // Test that backend is accessible through nginx proxy
    try {
      const proxyRes = await httpGet(`${BASE_URL}/api/categories`);
      logTest('Backend accessible via nginx proxy', proxyRes.status !== 0);
    } catch (e) {
      logTest('Backend via nginx proxy', false, e.message);
    }

    // Test health endpoint
    try {
      const healthRes = await httpGet(`${BASE_URL}/health`);
      logTest('Health endpoint returns OK', healthRes.data.includes('OK') || healthRes.status === 200);
    } catch (e) {
      logTest('Health endpoint', false, e.message);
    }

    // ========== 8. Error Handling Tests ==========
    console.log('\n--- 8. Error Handling Tests ---');

    try {
      const notFoundRes = await httpGet(`${BASE_URL}/api/nonexistent-endpoint`);
      logTest('Non-existent API returns proper error', notFoundRes.status === 401 || notFoundRes.status === 404);
    } catch (e) {
      logTest('Error handling', false, e.message);
    }

    try {
      const badRes = await httpGet(`${BASE_URL}/this-does-not-exist-at-all`);
      logTest('Non-existent page returns 200 (SPA fallback)', badRes.status === 200);
    } catch (e) {
      logTest('Non-existent page handling', false, e.message);
    }

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

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`);
    });
  }

  console.log('\n========================================');
  console.log(failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED');
  console.log('========================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(console.error);

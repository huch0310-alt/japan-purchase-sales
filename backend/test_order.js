const http = require('http');

const BASE_URL = 'http://43.153.155.76:3001';
const API = BASE_URL + '/api';

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

    console.log('POST', url);
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body.substring(0, 500));
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

    console.log('GET', url);
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
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

async function test() {
  // Step 1: Login
  console.log('=== Step 1: Customer Login ===');
  const loginRes = await httpPost(API + '/auth/customer/login', {
    username: 'customer1',
    password: 'customer123'
  });

  if (loginRes.status !== 200 || !loginRes.data?.access_token) {
    console.log('Login failed');
    return;
  }

  const token = loginRes.data.access_token;
  console.log('Got token:', token.substring(0, 50) + '...');

  // Step 2: Get products
  console.log('\n=== Step 2: Get Active Products ===');
  const productsRes = await httpGet(API + '/products/active', token);
  if (productsRes.status !== 200 || !productsRes.data?.length) {
    console.log('No products found');
    return;
  }

  const product = productsRes.data[0];
  console.log('Using product:', product.name, product.id);

  // Step 3: Create order directly with known product
  console.log('\n=== Step 3: Create Order ===');
  const orderData = {
    items: [
      { productId: product.id, quantity: 1 }
    ],
    deliveryAddress: '東京都渋谷区1-2-3',
    contactPerson: '田中太郎',
    contactPhone: '080-1234-5678'
  };

  console.log('Order data:', JSON.stringify(orderData, null, 2));
  const orderRes = await httpPost(API + '/orders', orderData, token);
  console.log('Order status:', orderRes.status);
  console.log('Order response:', JSON.stringify(orderRes.data, null, 2));
}

test().catch(console.error);

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const client = new Client({
    host: 'japan-sales-postgres',
    port: 5432,
    database: 'japan_purchase_sales',
    user: 'postgres',
    password: 'postgres123'
  });

  try {
    await client.connect();

    // Create staff admin
    const staffHash = await bcrypt.hash('admin123', 10);
    console.log('Staff hash generated, length:', staffHash.length);

    const staffRes = await client.query({
      text: 'INSERT INTO staff (id, username, "passwordHash", name, phone, role, "isActive", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())',
      values: ['admin', staffHash, '管理员', '13800138000', 'super_admin', true]
    });
    console.log('Staff created, rows affected:', staffRes.rowCount);

    // Create test customer
    const custHash = await bcrypt.hash('customer123', 10);

    const custRes = await client.query({
      text: 'INSERT INTO customers (id, username, "passwordHash", "companyName", phone, "isActive", "createdAt", "updatedAt") VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())',
      values: ['testcustomer', custHash, '测试公司', '13800138000', true]
    });
    console.log('Customer created, rows affected:', custRes.rowCount);

    // Verify
    const verifyStaff = await client.query('SELECT username, "passwordHash" FROM staff WHERE username = $1', ['admin']);
    console.log('Staff verify - hash length:', verifyStaff.rows[0]?.passwordHash?.length);

    const verifyCust = await client.query('SELECT username, "passwordHash" FROM customers WHERE username = $1', ['testcustomer']);
    console.log('Customer verify - hash length:', verifyCust.rows[0]?.passwordHash?.length);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();

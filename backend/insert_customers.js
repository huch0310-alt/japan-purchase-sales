const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Creating customer accounts...');

  // Create a script to insert customers with hashed passwords
  const testScript = `
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function insertCustomers() {
  const client = new Client({
    host: 'japan-sales-postgres',
    user: 'postgres',
    database: 'japan_purchase_sales',
    password: 'japan2024'
  });
  await client.connect();

  // Hash password
  const passwordHash = await bcrypt.hash('customer123', 10);
  console.log('Password hash:', passwordHash);

  // Insert customer 1 - using correct column names
  const sql1 = 'INSERT INTO customers (id, username, "passwordHash", "companyName", "contactPerson", "phone", "address", "invoiceName", "invoiceAddress", "invoicePhone", "invoiceBank", "vipDiscount", "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())';

  await client.query(sql1, [
    'customer1',
    passwordHash,
    '株式会社サンプル',
    '田中太郎',
    '080-1234-5678',
    '東京都渋谷区1-2-3',
    '株式会社サンプル',
    '東京都渋谷区1-2-3',
    '03-1234-5678',
    '1234-5678-9012',
    0.10,
    true
  ]);
  console.log('Customer 1 inserted');

  // Insert customer 2
  await client.query(sql1, [
    'customer2',
    passwordHash,
    'テスト会社',
    '山本花子',
    '090-9876-5432',
    '大阪府大阪市北区',
    'テスト会社',
    '大阪府大阪市北区',
    '06-9876-5432',
    '9876-5432-1098',
    0.15,
    true
  ]);
  console.log('Customer 2 inserted');

  // Check customers
  const result = await client.query('SELECT id, username, "companyName" FROM customers');
  console.log('Customers:', result.rows);

  await client.end();
  console.log('Done!');
}
insertCustomers().catch(e => { console.error('Error:', e.message); process.exit(1); });
`;

  // Write to local temp file
  fs.writeFileSync('C:/tmp/insert_customers.js', testScript);

  // Upload via SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    sftp.fastPut('C:/tmp/insert_customers.js', '/home/ubuntu/insert_customers.js', {}, (err) => {
      if (err) {
        console.error('Upload error:', err);
        conn.end();
        return;
      }
      console.log('Uploaded');

      // Copy to container
      conn.exec('sudo docker cp /home/ubuntu/insert_customers.js japan-sales-backend:/tmp/insert_customers.js', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          // Run the script
          conn.exec('sudo docker exec -e NODE_PATH=/app/node_modules japan-sales-backend node /tmp/insert_customers.js 2>&1', (err, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Result:');
              console.log(output2);
              conn.end();
            });
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});
const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Inserting test products...');

  const testScript = `
const { Client } = require('pg');

async function insertProducts() {
  const client = new Client({
    host: 'japan-sales-postgres',
    user: 'postgres',
    database: 'japan_purchase_sales',
    password: 'japan2024'
  });
  await client.connect();

  // Get category IDs
  const cats = await client.query('SELECT id, name FROM categories');
  console.log('Categories:', cats.rows);

  // Get unit IDs
  const units = await client.query('SELECT id, name FROM units LIMIT 1');
  const unitId = units.rows[0]?.id;

  // Insert products
  const products = [
    ['味精', '食品类', 100, '袋', 8.5, 12.0],
    ['白糖', '食品类', 200, '袋', 6.0, 9.0],
    ['食盐', '食品类', 300, '袋', 3.0, 5.0],
    ['酱油', '食品类', 80, '瓶', 10.0, 15.0],
    ['可乐', '饮料类', 150, '箱', 45.0, 65.0],
    ['矿泉水', '饮料类', 200, '箱', 30.0, 45.0],
    ['绿茶', '饮料类', 120, '箱', 50.0, 75.0],
  ];

  for (const [name, catName, qty, unit, purchasePrice, salePrice] of products) {
    const cat = cats.rows.find(c => c.name === catName);
    if (!cat) continue;

    const sql = 'INSERT INTO products (id, name, "categoryId", quantity, unit, "purchasePrice", "salePrice", status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())';
    await client.query(sql, [name, cat.id, qty, unit, purchasePrice, salePrice, 'active']);
    console.log('Inserted:', name);
  }

  // Check products
  const result = await client.query('SELECT id, name, status FROM products');
  console.log('\\nProducts:', result.rows);

  await client.end();
  console.log('\\nDone!');
}
insertProducts().catch(e => { console.error('Error:', e.message); process.exit(1); });
`;

  // Write to local temp file
  fs.writeFileSync('C:/tmp/insert_products.js', testScript);

  // Upload via SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    sftp.fastPut('C:/tmp/insert_products.js', '/home/ubuntu/insert_products.js', {}, (err) => {
      if (err) {
        console.error('Upload error:', err);
        conn.end();
        return;
      }
      console.log('Uploaded');

      conn.exec('sudo docker cp /home/ubuntu/insert_products.js japan-sales-backend:/tmp/insert_products.js', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          conn.exec('sudo docker exec -e NODE_PATH=/app/node_modules japan-sales-backend node /tmp/insert_products.js 2>&1', (err, stream2) => {
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
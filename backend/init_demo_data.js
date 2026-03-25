const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Creating demo data...');
  
  // Create the demo data SQL
  const sql = `
-- Insert categories
INSERT INTO categories (id, name, sort, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '食品类', 1, NOW(), NOW()),
  (gen_random_uuid(), '饮料类', 2, NOW(), NOW()),
  (gen_random_uuid(), '日用品类', 3, NOW(), NOW()),
  (gen_random_uuid(), '电子产品类', 4, NOW(), NOW()),
  (gen_random_uuid(), '服装类', 5, NOW(), NOW());

-- Insert units
INSERT INTO units (id, name, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '个', NOW(), NOW()),
  (gen_random_uuid(), '箱', NOW(), NOW()),
  (gen_random_uuid(), '袋', NOW(), NOW()),
  (gen_random_uuid(), 'kg', NOW(), NOW()),
  (gen_random_uuid(), 'g', NOW(), NOW()),
  (gen_random_uuid(), 'ml', NOW(), NOW()),
  (gen_random_uuid(), 'L', NOW(), NOW()),
  (gen_random_uuid(), '盒', NOW(), NOW()),
  (gen_random_uuid(), '瓶', NOW(), NOW());

-- Insert customers
INSERT INTO customers (id, username, "passwordHash", company_name, contact_person, contact_phone, delivery_address, invoice_name, invoice_address, bank_account, vip_discount, is_active, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'customer1', '$2b$10$rQZ8K7qQJ5qXQqQJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqO', '株式会社サンプル', '田中太郎', '080-1234-5678', '東京都渋谷区...' , '株式会社サンプル', '東京都渋谷区...', '1234-5678-9012', 0.1, true, NOW(), NOW()),
  (gen_random_uuid(), 'customer2', '$2b$10$rQZ8K7qQJ5qXQqQJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqOJ5qXQqO', 'テスト会社', '山本花子', '090-9876-5432', '大阪府大阪市...', 'テスト会社', '大阪府大阪市...', '9876-5432-1098', 0.15, true, NOW(), NOW());

-- Insert products
INSERT INTO products (id, name, category_id, quantity, unit, "purchasePrice", "salePrice", description, status, photo_url, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
 unnest(ARRAY['味精','白糖','食盐','酱油','醋','料酒','食用油','大米','面粉','方便面']),
  (SELECT id FROM categories WHERE name = '食品类' LIMIT 1),
  (random() * 1000)::int,
  '袋',
  (random() * 10 + 5)::numeric(10,2),
  (random() * 15 + 8)::numeric(10,2),
  '优质商品',
  'active',
  NULL,
  NOW(),
  NOW()
FROM generate_series(1, 10);

-- Insert more products
INSERT INTO products (id, name, category_id, quantity, unit, "purchasePrice", "salePrice", description, status, photo_url, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  unnest(ARRAY['可乐','矿泉水','绿茶','红茶','果汁','啤酒','咖啡']),
  (SELECT id FROM categories WHERE name = '饮料类' LIMIT 1),
  (random() * 500)::int,
  '箱',
  (random() * 5 + 2)::numeric(10,2),
  (random() * 8 + 4)::numeric(10,2),
  '畅销饮品',
  'active',
  NULL,
  NOW(),
  NOW()
FROM generate_series(1, 7);

-- Insert settings
INSERT INTO settings (id, company_name, representative, company_address, fax, email, "legalRepresentative", bank_account, "taxRate", "defaultPaymentDays", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '株式会社日本采銷', '佐藤一郎', '東京都千代田區...', '03-1234-5678', 'info@example.com', '佐藤一郎', '1234-5678-9012', 10, 30, NOW(), NOW());
`;
  
  // Write SQL to file
  const b64 = Buffer.from(sql).toString('base64');
  
  conn.exec(`echo "${b64}" | base64 -d > /tmp/demo_data.sql`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('SQL file created');
      
      // Execute SQL
      conn.exec('sudo docker exec -i japan-sales-postgres psql -U postgres -d japan_purchase_sales -f /tmp/demo_data.sql', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('SQL result:', output2.trim());
          
          // Verify
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT COUNT(*) as count FROM categories; SELECT COUNT(*) as count FROM products; SELECT COUNT(*) as count FROM customers;"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('=== VERIFICATION ===');
              console.log(output3);
              conn.end();
            });
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});

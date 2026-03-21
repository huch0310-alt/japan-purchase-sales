const bcrypt = require('bcrypt');

async function test() {
  const hash1 = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const result1 = await bcrypt.compare('admin123', hash1);
  console.log('Hash 1:', result1);

  const hash2 = await bcrypt.hash('admin123', 10);
  console.log('New hash:', hash2);
  const result2 = await bcrypt.compare('admin123', hash2);
  console.log('New hash result:', result2);
}

test();

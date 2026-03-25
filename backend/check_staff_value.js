const { Client } = require('pg');

async function checkStaff() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'japan_purchase_sales'
  });

  await client.connect();

  const result = await client.query('SELECT id, username, passwordHash FROM staff WHERE username = $1', ['admin']);
  console.log('Staff rows:', JSON.stringify(result.rows, null, 2));

  if (result.rows.length > 0) {
    const hash = result.rows[0].passwordHash;
    console.log('\nHash length:', hash ? hash.length : 'NULL');
    console.log('Hash value:', hash);

    // Test bcrypt
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare('admin123', hash);
    console.log('\nbcrypt.compare(\'admin123\', hash):', isValid);
  }

  await client.end();
}

checkStaff().catch(console.error);
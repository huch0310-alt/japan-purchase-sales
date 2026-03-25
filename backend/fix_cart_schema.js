const { DataSource } = require('typeorm');

async function fixSchema() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
  });

  await ds.initialize();
  console.log('Connected');

  // Check current columns
  const cols = await ds.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Current columns:', cols.map(c => c.column_name));

  // Drop redundant columns
  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS customerId');
    console.log('Dropped customerId');
  } catch (e) {
    console.log('Error dropping customerId:', e.message);
  }

  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS productId');
    console.log('Dropped productId');
  } catch (e) {
    console.log('Error dropping productId:', e.message);
  }

  // Verify
  const cols2 = await ds.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Final columns:', cols2.map(c => c.column_name));

  await ds.destroy();
}

fixSchema().catch(console.error);
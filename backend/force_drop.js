const { DataSource } = require('typeorm');

async function forceDrop() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
  });

  await ds.initialize();

  // Force drop using CASCADE
  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN customerId CASCADE');
    console.log('Dropped customerId CASCADE');
  } catch (e) {
    console.log('Error dropping customerId:', e.message);
  }

  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN productId CASCADE');
    console.log('Dropped productId CASCADE');
  } catch (e) {
    console.log('Error dropping productId:', e.message);
  }

  // Check result
  const cols = await ds.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Final columns:', cols.map(c => c.column_name));

  await ds.destroy();
}

forceDrop().catch(console.error);
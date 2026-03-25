const { DataSource } = require('typeorm');

async function checkFK() {
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

  // Get FK details
  const fks = await ds.query(`
    SELECT conname, conrelid::regclass AS table, confrelid::regclass AS referenced,
           pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE contype = 'f' AND conrelid = 'cart_items'::regclass
  `);
  console.log('Foreign keys:', JSON.stringify(fks, null, 2));

  // Try dropping the columns with CASCADE
  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS customerId CASCADE');
    console.log('Dropped customerId with CASCADE');
  } catch (e) {
    console.log('Error dropping customerId:', e.message);
  }

  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS productId CASCADE');
    console.log('Dropped productId with CASCADE');
  } catch (e) {
    console.log('Error dropping productId:', e.message);
  }

  // Check columns again
  const cols = await ds.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Final columns:', cols.map(c => c.column_name));

  await ds.destroy();
}

checkFK().catch(console.error);
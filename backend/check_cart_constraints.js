const { DataSource } = require('typeorm');

async function checkConstraints() {
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

  // Check constraints
  const constraints = await ds.query(`
    SELECT conname, contype, conrelid::regclass
    FROM pg_constraint
    WHERE conrelid = 'cart_items'::regclass
  `);
  console.log('Constraints:', JSON.stringify(constraints, null, 2));

  // Check if customerId is referenced
  const refs = await ds.query(`
    SELECT * FROM information_schema.column_usage
    WHERE table_name = 'cart_items' AND column_name = 'customerId'
  `);
  console.log('References to customerId:', JSON.stringify(refs, null, 2));

  // Try to drop with CASCADE
  try {
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS customerId CASCADE');
    console.log('Dropped with CASCADE');
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Check again
  const cols = await ds.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Final columns:', cols.map(c => c.column_name));

  await ds.destroy();
}

checkConstraints().catch(console.error);
const { DataSource } = require('typeorm');

async function rebuild() {
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

  // Start transaction
  const queryRunner = ds.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Check current state
    const before = await ds.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
    );
    console.log('Before:', before.map(c => c.column_name));

    // Drop all constraints first
    await ds.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'cart_items'::regclass) LOOP
          EXECUTE 'ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END LOOP;
      END $$;
    `);
    console.log('Dropped constraints');

    // Now try dropping columns
    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS customer_id');
    console.log('Dropped customer_id');

    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS product_id');
    console.log('Dropped product_id');

    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS customerId');
    console.log('Dropped customerId');

    await ds.query('ALTER TABLE cart_items DROP COLUMN IF EXISTS productId');
    console.log('Dropped productId');

    // Check after
    const after = await ds.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
    );
    console.log('After:', after.map(c => c.column_name));

    await queryRunner.commitTransaction();
  } catch (e) {
    console.log('Error:', e.message);
    await queryRunner.rollbackTransaction();
  }

  await ds.destroy();
}

rebuild().catch(console.error);
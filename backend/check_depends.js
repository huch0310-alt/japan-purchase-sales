const { DataSource } = require('typeorm');

async function checkDepends() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
  });

  await ds.initialize();

  // Check for dependent objects
  const deps = await ds.query(`
    SELECT class::regclass AS object, objid::regclass AS dependent
    FROM pg_depend
    WHERE refobjid = 'cart_items'::regclass
  `);
  console.log('Dependencies:', JSON.stringify(deps, null, 2));

  // Check what depends on customerId specifically
  const customerIdDeps = await ds.query(`
    SELECT pg_describe_object(class, objid, 0) AS description
    FROM pg_depend
    WHERE refobjid = 'cart_items'::regclass
      AND refobjsubid IN (SELECT attnum FROM pg_attribute WHERE attrelid = 'cart_items'::regclass AND attname = 'customerId')
  `);
  console.log('customerId dependencies:', JSON.stringify(customerIdDeps, null, 2));

  await ds.destroy();
}

checkDepends().catch(console.error);
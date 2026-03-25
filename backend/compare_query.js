const { DataSource } = require('typeorm');

async function compare() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
    logging: true,
  });

  await ds.initialize();

  console.log('=== TypeORM Query ===');
  const typeormResult = await ds.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('TypeORM result:', JSON.stringify(typeormResult, null, 2));

  await ds.destroy();
}

compare().catch(console.error);
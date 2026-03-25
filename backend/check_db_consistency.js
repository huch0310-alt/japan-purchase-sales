const { DataSource } = require('typeorm');

async function checkBoth() {
  // From backend container's perspective
  console.log('=== From backend container ===');
  const backendDs = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
  });

  await backendDs.initialize();
  const backendCols = await backendDs.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items'"
  );
  console.log('Columns:', backendCols.map(c => c.column_name));
  await backendDs.destroy();
}

checkBoth().catch(console.error);
const { DataSource } = require('typeorm');

async function diagnose() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'japan-sales-postgres',
    port: 5432,
    username: 'postgres',
    password: 'japan2024',
    database: 'japan_purchase_sales',
    entities: ['/app/dist/**/entities/*.entity.js'],
  });

  await ds.initialize();
  console.log('Connected to DB');

  // 1. 检查 cart_items 表
  const cartItems = await ds.query('SELECT * FROM cart_items LIMIT 5');
  console.log('\n1. Cart items:');
  console.log(JSON.stringify(cartItems, null, 2));

  // 2. 检查 products 表中是否存在这些 product_id
  if (cartItems.length > 0) {
    const productIds = cartItems.map(ci => ci.product_id);
    console.log('\n2. Product IDs in cart:', productIds);

    const products = await ds.query(
      'SELECT id, name, status FROM products WHERE id = ANY($1)',
      [productIds]
    );
    console.log('\n3. Products from cart:');
    console.log(JSON.stringify(products, null, 2));
  }

  // 3. 使用 TypeORM repository 查询
  console.log('\n4. Using TypeORM find (with relations):');
  const { CartItem } = require('/app/dist/cart/entities/cart-item.entity');
  const cartRepo = ds.getRepository(CartItem);
  const items = await cartRepo.find({
    relations: ['product'],
    take: 5
  });
  console.log(JSON.stringify(items.map(i => ({
    id: i.id,
    productId: i.productId,
    hasProduct: !!i.product,
    productName: i.product?.name
  })), null, 2));

  await ds.destroy();
}

diagnose().catch(console.error);
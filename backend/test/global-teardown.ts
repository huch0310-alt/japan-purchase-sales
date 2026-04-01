import { DataSource } from 'typeorm';

/**
 * E2E测试全局清理
 * 在所有测试结束后执行
 */
export default async function globalTeardown() {
  console.log('🧹 E2E测试全局清理开始...');

  // 创建测试数据库连接
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'japan_purchase_sales_test',
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    
    // 清空测试数据库
    await dataSource.synchronize(true);
    console.log('✅ 测试数据库已清空');
    
    await dataSource.destroy();
    console.log('✅ E2E测试全局清理完成');
  } catch (error) {
    console.error('❌ E2E测试全局清理失败:', error);
    throw error;
  }
}

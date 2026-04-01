import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

/**
 * E2E测试全局设置
 * 在所有测试开始前执行
 */
export default async function globalSetup() {
  console.log('🚀 E2E测试全局设置开始...');

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
    console.log('✅ 测试数据库连接成功');
    
    // 清空测试数据库
    await dataSource.synchronize(true);
    console.log('✅ 测试数据库已清空');
    
    await dataSource.destroy();
    console.log('✅ E2E测试全局设置完成');
  } catch (error) {
    console.error('❌ E2E测试全局设置失败:', error);
    throw error;
  }
}

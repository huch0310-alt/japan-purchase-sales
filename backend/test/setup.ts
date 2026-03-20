import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

/**
 * 全局测试设置
 */
export async function globalSetup() {
  // 测试前的全局设置
}

export async function globalTeardown() {
  // 测试后的全局清理
}

/**
 * 获取测试数据源
 */
export function getTestDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'japan_purchase_sales_test',
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });
}

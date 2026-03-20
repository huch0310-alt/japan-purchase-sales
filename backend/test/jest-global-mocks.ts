import { ConfigService } from '@nestjs/config';

/**
 * 全局测试Mock
 */

// Mock ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        JWT_SECRET: 'test-jwt-secret-key',
        JWT_EXPIRES_IN: '1d',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'postgres',
        DB_DATABASE: 'japan_purchase_sales_test',
        DB_SYNCHRONIZE: true,
        DB_LOGGING: false,
      };
      return config[key] ?? defaultValue;
    }),
  })),
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({}),
  },
}));

// Mock TypeORM
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn(),
    forFeature: jest.fn(),
  },
}));

// 全局超时设置
jest.setTimeout(30000);

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * 创建测试模块
 */
export async function createTestingModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [AppModule],
  }).compile();
}

/**
 * 创建带验证管道的测试应用
 */
export async function createTestApp(): Promise<INestApplication> {
  const module = await createTestingModule();
  const app = module.createNestApplication();

  // 添加验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * 登录并获取Token
 */
export async function loginAndGetToken(
  app: INestApplication,
  username: string = 'admin',
  password: string = 'admin123',
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/staff/login')
    .send({ username, password })
    .expect(201);

  return response.body.accessToken;
}

/**
 * 客户登录并获取Token
 */
export async function loginCustomerAndGetToken(
  app: INestApplication,
  username: string = 'test-customer',
  password: string = 'test123',
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/customer/login')
    .send({ username, password })
    .expect(201);

  return response.body.accessToken;
}

/**
 * 带认证的请求
 */
export function authenticatedRequest(
  app: INestApplication,
  token: string,
) {
  const httpServer = app.getHttpServer();
  return request(httpServer).set('Authorization', `Bearer ${token}`);
}

/**
 * 清理测试数据（通过删除所有表）
 */
export async function clearDatabase(app: INestApplication) {
  // 在测试环境中使用synchronize: true，自动清理
  // 如需手动清理，可在这里添加逻辑
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * 生成随机邮箱
 */
export function randomEmail(): string {
  return `test-${randomString()}@example.com`;
}

/**
 * 等待指定毫秒
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

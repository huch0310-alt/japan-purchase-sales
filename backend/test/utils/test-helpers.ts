import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';

/**
 * 测试辅助工具函数
 */

/**
 * 创建测试应用实例
 */
export async function createTestApp(moduleFixture: any): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  await app.init();
  return app;
}

/**
 * 生成哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 登录并获取token（员工）
 */
export async function loginStaff(app: INestApplication, username: string, password: string): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/staff/login')
    .send({ username, password });
  
  return response.body.access_token;
}

/**
 * 登录并获取token（客户）
 */
export async function loginCustomer(app: INestApplication, username: string, password: string): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/customer/login')
    .send({ username, password });
  
  return response.body.access_token;
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(repositories: any[], conditions: any[]) {
  for (let i = 0; i < repositories.length; i++) {
    await repositories[i].delete(conditions[i]);
  }
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}-${randomString(8)}`;
}

/**
 * 创建测试用户名
 */
export function createTestUsername(prefix: string = 'test'): string {
  return `${prefix}-${generateUniqueId()}`;
}

/**
 * 断言API错误响应
 */
export function assertErrorResponse(response: any, statusCode: number, message?: string) {
  expect(response.status).toBe(statusCode);
  if (message) {
    expect(response.body.message).toContain(message);
  }
}

/**
 * 断言分页响应
 */
export function assertPaginatedResponse(response: any, page: number, pageSize: number) {
  expect(response.body.data).toBeDefined();
  expect(response.body.total).toBeDefined();
  expect(response.body.page).toBe(page);
  expect(response.body.pageSize).toBe(pageSize);
  expect(response.body.totalPages).toBeDefined();
}

/**
 * 创建带认证的请求
 */
export function authRequest(app: INestApplication, token: string) {
  return {
    get: (url: string) => 
      request(app.getHttpServer())
        .get(url)
        .set('Authorization', `Bearer ${token}`),
    
    post: (url: string) => 
      request(app.getHttpServer())
        .post(url)
        .set('Authorization', `Bearer ${token}`),
    
    put: (url: string) => 
      request(app.getHttpServer())
        .put(url)
        .set('Authorization', `Bearer ${token}`),
    
    delete: (url: string) => 
      request(app.getHttpServer())
        .delete(url)
        .set('Authorization', `Bearer ${token}`),
    
    patch: (url: string) => 
      request(app.getHttpServer())
        .patch(url)
        .set('Authorization', `Bearer ${token}`),
  };
}

/**
 * 测试数据清理助手
 */
export class TestDataCleaner {
  private cleanupTasks: Array<() => Promise<void>> = [];

  addTask(task: () => Promise<void>) {
    this.cleanupTasks.push(task);
  }

  async cleanup() {
    for (const task of this.cleanupTasks) {
      try {
        await task();
      } catch (error) {
        console.error('清理任务失败:', error);
      }
    }
    this.cleanupTasks = [];
  }
}

/**
 * 测试数据库助手
 */
export class TestDatabaseHelper {
  constructor(private dataSource: any) {}

  async cleanAllTables() {
    const entities = this.dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.delete({});
    }
  }

  async cleanTables(tableNames: string[]) {
    for (const tableName of tableNames) {
      await this.dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }
  }
}

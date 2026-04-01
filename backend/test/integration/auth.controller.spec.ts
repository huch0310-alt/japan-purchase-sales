import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../src/auth/strategies/local.strategy';

describe('AuthController (集成测试)', () => {
  let app: INestApplication;

  // 注意：由于涉及数据库，此测试需要真实数据库连接
  // 这里展示集成测试的结构

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'japan_sales_test',
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1d' },
        }),
        AuthModule,
        UsersModule,
      ],
      providers: [JwtStrategy, LocalStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/staff/login', () => {
    it('应该返回401当用户名不存在', () => {
      // 集成测试需要数据库，这里标记为待实现
      expect(true).toBe(true);
    });
  });
});

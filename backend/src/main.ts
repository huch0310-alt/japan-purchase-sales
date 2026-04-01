import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

const logger = new Logger('Bootstrap');

/**
 * 日本采销管理系统 - 后端服务入口点
 * 启动命令: npm run start:dev
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 反向代理场景信任代理（Nginx/TLS终止场景下 secure cookie、限流按IP都需要）
  // 生产建议按实际拓扑调整该值（例如 1）
  app.set('trust proxy', 1);

  // 安全中间件 - 使用helmet设置安全HTTP头
  const helmet = (await import('helmet')).default;
  app.use(helmet());

  // 启用CORS - 支持开发和生产环境
  // 生产环境必须通过 CORS_ORIGINS 环境变量配置，禁止硬编码IP
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || [];
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:80',
  ];
  // 只有在非生产环境才使用 localhost 回退
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? configuredOrigins  // 生产环境：必须配置 CORS_ORIGINS
    : [...configuredOrigins, ...devOrigins];

  // 生产环境安全警告：未配置 CORS_ORIGINS
  if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
    logger.warn('⚠️ 安全警告: 生产环境未配置 CORS_ORIGINS，CORS 将阻止所有跨域请求！');
  }
  
  app.enableCors({
    origin: (origin, callback) => {
      // 允许无origin的请求（如移动应用、Postman等）
      if (!origin) return callback(null, true);
      
      // 检查origin是否在允许列表中，或匹配localhost模式
      if (corsOrigins.includes(origin) || /^http:\/\/localhost(:[0-9]+)?$/.test(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 静态文件服务（上传的文件）
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Cookie 解析器（CSRF 防护需要）
  app.use(cookieParser());

  // ==================== CSRF 防护（生产启用）====================
  // 保护 Cookie 会话请求：对 Bearer Token（移动端/脚本）跳过，避免无谓阻断
  const cookieSameSite = (process.env.COOKIE_SAMESITE || 'lax') as 'lax' | 'strict' | 'none';
  const cookieSecure = (process.env.COOKIE_SECURE || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';
  const csrfProtection = csurf({
    cookie: {
      key: process.env.CSRF_SECRET_COOKIE_NAME || '_csrf',
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    },
  });

  app.use((req: any, res: any, next: any) => {
    const url: string = req.originalUrl || req.url || '';
    const isCsrfEndpoint = url.startsWith('/api/security/csrf');
    const isAuthLoginEndpoint = url.startsWith('/api/auth/staff/login') || url.startsWith('/api/auth/customer/login');
    const hasBearer = typeof req.headers?.authorization === 'string' && req.headers.authorization.startsWith('Bearer ');

    // CSRF token 获取端点必须经过 csrfProtection，才能生成 req.csrfToken()
    if (isCsrfEndpoint) {
      return csrfProtection(req, res, next);
    }

    // 登录接口为了兼容首次登录（尚未获取 CSRF token）与非浏览器客户端，暂时跳过 CSRF
    if (isAuthLoginEndpoint) {
      return next();
    }

    // Bearer Token 客户端跳过 CSRF（主要是移动端与脚本）
    if (hasBearer) {
      return next();
    }

    // 其余请求按 csurf 默认规则校验（对非安全方法生效）
    return csrfProtection(req, res, next);
  });

  // CSRF token 获取端点（前端启动时调用一次）
  app.use('/api/security/csrf', (req: any, res: any) => {
    const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
    res.setHeader('Cache-Control', 'no-store');
    if (csrfToken) {
      // 注意：XSRF-TOKEN 必须允许前端读取（HttpOnly=false），供 axios 写入 header
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        path: '/',
      });
    }
    res.status(200).json({ csrfToken });
  });

  // 全局性能监控拦截器（最先执行，记录请求开始时间）
  app.useGlobalInterceptors(new PerformanceInterceptor());

  // 全局响应拦截器（包装响应格式）
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器（统一错误处理和监控）
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger API文档配置（仅在开发环境启用）
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('日本采销管理系统 API')
      .setDescription('采购、销售、订单管理、請求書生成API文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // 健康检查端点（在全局前缀之前）
  app.use('/health', (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`日本采销管理系统后端服务已启动: http://localhost:${port}`);
  logger.log(`API文档地址: http://localhost:${port}/api`);
  logger.log(`文件上传目录: http://localhost:${port}/uploads`);
}

bootstrap();

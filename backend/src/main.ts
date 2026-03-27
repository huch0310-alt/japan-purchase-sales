import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

/**
 * 日本采销管理系统 - 后端服务入口点
 * 启动命令: npm run start:dev
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 安全中间件 - 使用helmet设置安全HTTP头
  const helmet = (await import('helmet')).default;
  app.use(helmet());

  // 启用CORS - 仅允许同源请求（通过nginx反向代理）
  app.enableCors({
    origin: /http:\/\/localhost(:[0-9]+)?$/,
    credentials: true,
  });

  // 静态文件服务（上传的文件）
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('日本采销管理系统 API')
    .setDescription('采购、销售、订单管理、請求書生成API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 健康检查端点（在全局前缀之前）
  app.use('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`日本采销管理系统后端服务已启动: http://localhost:${port}`);
  console.log(`API文档地址: http://localhost:${port}/api`);
  console.log(`文件上传目录: http://localhost:${port}/uploads`);
}

bootstrap();

# 监控系统集成指南

## 快速集成

### 1. 在 main.ts 中注册监控组件

```typescript
// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MonitoringService } from './common/services/monitoring.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 创建性能监控拦截器实例
  const performanceInterceptor = new PerformanceInterceptor();

  // 注册性能监控拦截器
  app.useGlobalInterceptors(performanceInterceptor);

  // 注册全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 设置性能拦截器引用到监控服务
  const monitoringService = app.get(MonitoringService);
  monitoringService.setPerformanceInterceptor(performanceInterceptor);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`监控系统已启用: http://localhost:${port}/monitoring/health`);
}

bootstrap();
```

### 2. 在 app.module.ts 中导入监控模块

```typescript
// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { MonitoringModule } from './common/monitoring.module';
// ... 其他导入

@Module({
  imports: [
    MonitoringModule, // 导入监控模块
    // ... 其他模块
  ],
  // ...
})
export class AppModule {}
```

### 3. 验证监控功能

启动应用后，访问以下端点验证监控功能：

```bash
# 健康检查
curl http://localhost:3001/monitoring/health

# 性能摘要
curl http://localhost:3001/monitoring/performance

# 完整监控数据
curl http://localhost:3001/monitoring/metrics
```

## 监控端点说明

### GET /monitoring/health

**功能**: 系统健康检查

**响应示例**:
```json
{
  "status": "healthy",
  "checks": {
    "memory": {
      "status": "ok",
      "usage": "45.23%",
      "heapUsed": "120.5 MB",
      "heapTotal": "266.5 MB"
    },
    "performance": {
      "status": "ok",
      "averageResponseTime": "145ms",
      "errorRate": "2.3%",
      "slowRequests": 23
    },
    "uptime": {
      "status": "ok",
      "value": "2d 5h 30m 45s"
    }
  }
}
```

### GET /monitoring/performance

**功能**: 获取性能摘要

**响应示例**:
```json
{
  "totalRequests": 1523,
  "averageResponseTime": 145,
  "slowRequests": 23,
  "errorRate": 2.3,
  "requestsPerMinute": 45
}
```

### GET /monitoring/metrics

**功能**: 获取完整监控数据

**响应示例**:
```json
{
  "timestamp": "2026-04-01T10:35:00.000Z",
  "performance": {
    "summary": {
      "totalRequests": 1523,
      "averageResponseTime": 145,
      "slowRequests": 23,
      "errorRate": 2.3,
      "requestsPerMinute": 45
    },
    "recentMetrics": [
      {
        "timestamp": "2026-04-01T10:34:55.123Z",
        "method": "GET",
        "url": "/api/products",
        "statusCode": 200,
        "duration": 45.23,
        "userId": "user123",
        "ip": "192.168.1.100"
      }
    ]
  },
  "system": {
    "uptime": 189045.123,
    "memoryUsage": {
      "rss": 150000000,
      "heapTotal": 280000000,
      "heapUsed": 120000000,
      "external": 5000000
    },
    "cpuUsage": {
      "user": 123456,
      "system": 78901
    }
  }
}
```

## 日志输出示例

### 正常请求日志
```
[2026-04-01 10:30:45] [LOG] [PerformanceInterceptor] GET /api/products 200 - 45.23ms
```

### 慢请求告警
```
[2026-04-01 10:32:00] [WARN] [PerformanceInterceptor] ⚠️ 慢请求告警: GET /api/reports 耗时 1523.45ms
```

### 错误日志
```
[2026-04-01 10:33:00] [ERROR] [AllExceptionsFilter] [req_1234567890_abc123] POST /api/orders 500 | User: user123 | IP: 192.168.1.100
Error: Database connection failed
    at DatabaseService.connect (database.service.ts:45)
```

## 生产环境配置建议

### 1. 日志持久化

安装 winston 日志库：
```bash
npm install winston winston-daily-rotate-file
```

创建日志配置：
```typescript
// backend/src/common/logger/winston.logger.ts

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const winstonConfig = {
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `[${timestamp}] [${level}] [${context}] ${message}`;
        }),
      ),
    }),
    
    // 错误日志文件
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    
    // 所有日志文件
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
};
```

在 main.ts 中使用：
```typescript
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  
  // ...
}
```

### 2. 环境变量配置

创建 `.env` 文件：
```bash
# 监控配置
MONITORING_ENABLED=true
SLOW_REQUEST_THRESHOLD=1000
ERROR_RATE_THRESHOLD=5
MAX_METRICS_SIZE=1000

# 日志配置
LOG_LEVEL=info
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m

# 告警配置
ALERT_EMAIL=admin@example.com
ALERT_DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
```

### 3. 监控数据持久化

生产环境建议将监控数据持久化到数据库或时序数据库：

```typescript
// 使用 TypeORM 存储性能指标
@Entity('performance_metrics')
export class PerformanceMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column()
  statusCode: number;

  @Column('decimal')
  duration: number;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  ip: string;
}
```

## 监控最佳实践

### 1. 定期检查监控数据

- 每日查看错误率和慢请求数量
- 每周分析性能趋势
- 每月生成监控报告

### 2. 设置合理的告警阈值

- 慢请求阈值: 1000ms（可根据业务调整）
- 错误率阈值: 5%
- 内存使用率阈值: 85%

### 3. 监控数据保留策略

- 详细指标: 保留7天
- 摘要数据: 保留30天
- 历史趋势: 保留1年

### 4. 告警通知策略

- P0级告警: 立即电话 + 邮件 + 钉钉
- P1级告警: 邮件 + 钉钉
- P2级告警: 邮件
- P3级告警: 仅日志

## 故障排查指南

### 问题1: 监控数据不准确

**检查步骤**:
1. 确认拦截器已正确注册
2. 检查性能拦截器引用是否设置
3. 验证监控服务是否正常工作

### 问题2: 日志未输出

**检查步骤**:
1. 确认日志级别配置正确
2. 检查日志文件权限
3. 验证 winston 配置是否正确

### 问题3: 告警未发送

**检查步骤**:
1. 确认告警阈值配置正确
2. 检查邮件/钉钉配置
3. 验证网络连接

## 下一步改进

1. ✅ 基础监控功能已实现
2. ⏳ 集成 ELK 日志系统
3. ⏳ 接入 Prometheus + Grafana
4. ⏳ 实现分布式追踪
5. ⏳ 机器学习异常检测

---

**文档版本**: v1.0  
**最后更新**: 2026-04-01

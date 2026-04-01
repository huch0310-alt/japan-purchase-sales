# 日本采销管理系统 - 监控告警系统文档

## 📋 目录

1. [系统概述](#系统概述)
2. [监控架构](#监控架构)
3. [日志系统](#日志系统)
4. [性能监控](#性能监控)
5. [错误追踪](#错误追踪)
6. [告警配置](#告警配置)
7. [使用指南](#使用指南)

---

## 系统概述

### 监控目标

为日本采销管理系统建立完善的监控告警体系，确保：

- **系统稳定性**：实时监控服务健康状态
- **性能优化**：识别性能瓶颈和慢请求
- **快速定位**：错误追踪和日志分析
- **主动告警**：及时发现并通知异常情况

### 监控维度

| 维度 | 指标 | 说明 |
|------|------|------|
| **请求监控** | 响应时间、吞吐量、错误率 | HTTP请求性能指标 |
| **系统监控** | CPU、内存、磁盘、网络 | 服务器资源使用情况 |
| **数据库监控** | 连接数、查询性能、慢查询 | PostgreSQL数据库性能 |
| **业务监控** | 订单量、用户活跃度、销售额 | 业务关键指标 |

---

## 监控架构

### 组件架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端请求                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   NestJS 应用层                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PerformanceInterceptor (性能监控拦截器)              │  │
│  │  - 记录请求响应时间                                    │  │
│  │  - 监控慢请求 (>1000ms)                               │  │
│  │  - 收集性能指标                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  业务逻辑处理                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AllExceptionsFilter (全局异常过滤器)                 │  │
│  │  - 统一异常处理                                        │  │
│  │  - 错误分类和追踪                                      │  │
│  │  - 告警通知                                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    日志和监控系统                            │
│  - 日志文件存储                                             │
│  - 性能指标收集                                             │
│  - 错误追踪记录                                             │
│  - 告警通知发送                                             │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

- **日志框架**: NestJS Logger (基于 winston)
- **性能监控**: 自定义拦截器 + 性能指标收集
- **错误追踪**: 全局异常过滤器 + 堆栈记录
- **告警通知**: 邮件/钉钉/企业微信 (待集成)

---

## 日志系统

### 日志分类

#### 1. 请求日志

记录所有HTTP请求的基本信息。

**格式**:
```
[时间戳] [日志级别] [上下文] HTTP方法 URL 状态码 - 响应时间ms
```

**示例**:
```
[2026-04-01 10:30:45] [LOG] [PerformanceInterceptor] GET /api/products 200 - 45.23ms
[2026-04-01 10:30:46] [LOG] [PerformanceInterceptor] POST /api/orders 201 - 123.56ms
```

#### 2. 错误日志

记录异常和错误的详细信息。

**格式**:
```
[时间戳] [ERROR] [上下文] 错误消息
堆栈信息
```

**示例**:
```
[2026-04-01 10:31:00] [ERROR] [AllExceptionsFilter] [req_1234567890_abc123] POST /api/orders 500 | User: user123 | IP: 192.168.1.100
Error: Database connection failed
    at DatabaseService.connect (database.service.ts:45)
    at async OrderService.create (order.service.ts:67)
```

#### 3. 性能日志

记录性能相关的关键指标。

**慢请求告警**:
```
[2026-04-01 10:32:00] [WARN] [PerformanceInterceptor] ⚠️ 慢请求告警: GET /api/reports 耗时 1523.45ms
```

**错误响应告警**:
```
[2026-04-01 10:33:00] [WARN] [PerformanceInterceptor] ⚠️ 错误响应: POST /api/products 400
```

#### 4. 业务日志

记录关键业务操作。

**示例**:
```
[2026-04-01 10:34:00] [LOG] [OrderService] 订单创建成功: OrderID=ORD-2026-001, User=user123, Amount=¥12,500
[2026-04-01 10:35:00] [LOG] [PaymentService] 支付完成: OrderID=ORD-2026-001, Method=credit_card
```

### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| **LOG** | 普通信息 | 请求成功、业务操作 |
| **WARN** | 警告信息 | 慢请求、业务异常 |
| **ERROR** | 错误信息 | 系统错误、异常 |
| **DEBUG** | 调试信息 | 详细堆栈、请求上下文 |

---

## 性能监控

### 性能指标

#### 1. 响应时间

**监控项**:
- 平均响应时间
- P50、P95、P99 响应时间
- 最大响应时间

**阈值**:
- 正常: < 200ms
- 警告: 200ms - 1000ms
- 严重: > 1000ms

#### 2. 吞吐量

**监控项**:
- 每秒请求数 (RPS)
- 每分钟请求数
- 并发连接数

**阈值**:
- 正常: < 100 RPS
- 警告: 100 - 500 RPS
- 严重: > 500 RPS

#### 3. 错误率

**监控项**:
- HTTP 4xx 错误率
- HTTP 5xx 错误率
- 数据库错误率

**阈值**:
- 正常: < 1%
- 警告: 1% - 5%
- 严重: > 5%

### 性能监控拦截器

**文件**: `backend/src/common/interceptors/performance.interceptor.ts`

**功能**:
- ✅ 记录请求响应时间（毫秒级精度）
- ✅ 慢请求自动告警（>1000ms）
- ✅ 错误响应监控
- ✅ 性能指标收集和统计
- ✅ 内存存储最近1000条性能数据

**使用方式**:

```typescript
// main.ts
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

app.useGlobalInterceptors(new PerformanceInterceptor());
```

**获取性能统计**:

```typescript
// 在控制器或服务中注入
@Injectable()
export class MonitoringController {
  constructor(private readonly performanceInterceptor: PerformanceInterceptor) {}

  @Get('metrics')
  getMetrics() {
    return {
      summary: this.performanceInterceptor.getSummary(),
      recent: this.performanceInterceptor.getMetrics().slice(-100),
    };
  }
}
```

**性能摘要示例**:

```json
{
  "totalRequests": 1523,
  "averageResponseTime": 145,
  "slowRequests": 23,
  "errorRate": 2.3,
  "requestsPerMinute": 45
}
```

---

## 错误追踪

### 错误分类

#### 1. HTTP 错误

**类型**: `HTTP_ERROR`

**常见错误码**:
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 409: 资源冲突
- 500: 服务器内部错误

#### 2. 数据库错误

**类型**: `DATABASE_ERROR`

**常见错误码**:
- 23505: 唯一性约束冲突
- 23503: 外键约束冲突
- 23502: 非空约束冲突
- 23514: 检查约束冲突

#### 3. 系统错误

**类型**: `SYSTEM_ERROR`

**示例**:
- 内存溢出
- 文件系统错误
- 网络连接失败

#### 4. CSRF 错误

**类型**: `CSRF_ERROR`

**错误码**: `EBADCSRFTOKEN`

**原因**: CSRF token 缺失或无效

### 全局异常过滤器

**文件**: `backend/src/common/filters/all-exceptions.filter.ts`

**功能**:
- ✅ 统一异常处理
- ✅ 错误分类和详细追踪
- ✅ 堆栈记录（开发环境）
- ✅ 请求ID生成（便于追踪）
- ✅ 敏感信息过滤
- ✅ 自动告警通知

**使用方式**:

```typescript
// main.ts
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

app.useGlobalFilters(new AllExceptionsFilter());
```

**错误响应格式**:

```json
{
  "success": false,
  "statusCode": 500,
  "message": "数据库连接失败",
  "error": {
    "type": "DATABASE_ERROR",
    "message": "数据库连接失败",
    "code": "ECONNREFUSED",
    "stack": "Error: connect ECONNREFUSED..."
  },
  "timestamp": "2026-04-01T10:35:00.000Z",
  "path": "/api/orders",
  "requestId": "req_1234567890_abc123"
}
```

---

## 告警配置

### 告警规则

#### 1. 性能告警

| 规则 | 阈值 | 级别 | 通知方式 |
|------|------|------|----------|
| 慢请求 | > 1000ms | WARNING | 日志 |
| 超慢请求 | > 5000ms | CRITICAL | 日志 + 邮件 |
| 平均响应时间 | > 500ms | WARNING | 日志 |
| 吞吐量下降 | < 10 RPS | WARNING | 日志 |

#### 2. 错误告警

| 规则 | 阈值 | 级别 | 通知方式 |
|------|------|------|----------|
| 5xx 错误率 | > 1% | CRITICAL | 日志 + 邮件 + 钉钉 |
| 4xx 错误率 | > 5% | WARNING | 日志 |
| 数据库错误 | 任何 | CRITICAL | 日志 + 邮件 |
| CSRF 错误 | 连续3次 | WARNING | 日志 |

#### 3. 系统告警

| 规则 | 阈值 | 级别 | 通知方式 |
|------|------|------|----------|
| CPU 使用率 | > 80% | WARNING | 日志 |
| CPU 使用率 | > 95% | CRITICAL | 日志 + 邮件 |
| 内存使用率 | > 85% | WARNING | 日志 |
| 内存使用率 | > 95% | CRITICAL | 日志 + 邮件 |
| 磁盘使用率 | > 85% | WARNING | 日志 |
| 磁盘使用率 | > 95% | CRITICAL | 日志 + 邮件 |

### 告警通知渠道

#### 1. 日志输出（已实现）

所有告警都会记录到日志文件中。

#### 2. 邮件通知（待集成）

**配置示例**:

```typescript
// src/common/services/alert.service.ts
@Injectable()
export class AlertService {
  async sendAlert(config: AlertConfig) {
    // 发送邮件
    await this.emailService.send({
      to: 'admin@example.com',
      subject: `[${config.level}] 系统告警`,
      body: config.message,
    });
  }
}
```

#### 3. 钉钉/企业微信（待集成）

**配置示例**:

```typescript
// 发送钉钉告警
await this.dingtalkService.send({
  msgtype: 'text',
  text: {
    content: `🚨 系统告警\n级别: ${level}\n消息: ${message}\n时间: ${timestamp}`,
  },
});
```

---

## 使用指南

### 1. 启用监控

在 `main.ts` 中注册监控组件：

```typescript
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册性能监控拦截器
  app.useGlobalInterceptors(new PerformanceInterceptor());

  // 注册全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3001);
}
```

### 2. 查看性能指标

创建监控端点：

```typescript
// src/monitoring/monitoring.controller.ts
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly performanceInterceptor: PerformanceInterceptor) {}

  @Get('metrics')
  getMetrics() {
    return {
      summary: this.performanceInterceptor.getSummary(),
      recent: this.performanceInterceptor.getMetrics().slice(-100),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

### 3. 日志查看

**开发环境**:
```bash
# 查看实时日志
npm run start:dev | grep -E "(ERROR|WARN)"

# 查看错误日志
tail -f logs/error.log
```

**生产环境**:
```bash
# 查看最近100行日志
tail -n 100 logs/application.log

# 搜索特定错误
grep "DATABASE_ERROR" logs/application.log

# 统计错误数量
grep -c "ERROR" logs/application.log
```

### 4. 性能分析

**识别慢请求**:
```bash
# 查找超过1秒的请求
grep "慢请求告警" logs/application.log

# 查找特定接口的性能
grep "POST /api/orders" logs/application.log | grep -E "[0-9]+ms"
```

**错误追踪**:
```bash
# 根据请求ID追踪错误
grep "req_1234567890_abc123" logs/application.log

# 查看数据库错误
grep "DATABASE_ERROR" logs/application.log
```

### 5. 监控最佳实践

#### 开发阶段

1. **启用详细日志**: 设置 `LOG_LEVEL=debug`
2. **监控慢请求**: 关注超过500ms的请求
3. **错误追踪**: 每个错误都要有请求ID

#### 生产阶段

1. **日志轮转**: 配置日志文件自动轮转
2. **集中存储**: 使用ELK或云日志服务
3. **实时告警**: 接入钉钉/企业微信
4. **定期分析**: 每周分析性能指标

---

## 监控指标参考

### 关键指标仪表板

```
┌─────────────────────────────────────────────────────────┐
│              系统监控仪表板                              │
├─────────────────────────────────────────────────────────┤
│  请求统计                                               │
│  ├─ 总请求数: 1,523                                    │
│  ├─ 平均响应时间: 145ms                                │
│  ├─ 慢请求数: 23                                       │
│  └─ 错误率: 2.3%                                       │
├─────────────────────────────────────────────────────────┤
│  系统资源                                               │
│  ├─ CPU使用率: 45%                                     │
│  ├─ 内存使用率: 62%                                    │
│  └─ 磁盘使用率: 58%                                    │
├─────────────────────────────────────────────────────────┤
│  数据库                                                 │
│  ├─ 连接数: 15/100                                     │
│  ├─ 慢查询数: 3                                        │
│  └─ 平均查询时间: 23ms                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 后续改进建议

### 短期改进（1-2周）

1. ✅ 创建性能监控拦截器
2. ✅ 创建全局异常过滤器
3. ✅ 编写监控文档
4. ⏳ 集成日志文件存储
5. ⏳ 创建监控仪表板API

### 中期改进（1-2月）

1. ⏳ 接入ELK日志系统
2. ⏳ 集成邮件告警
3. ⏳ 集成钉钉/企业微信告警
4. ⏳ 添加数据库慢查询监控
5. ⏳ 实现性能指标持久化

### 长期改进（3-6月）

1. ⏳ 接入Prometheus + Grafana
2. ⏳ 实现分布式追踪（Jaeger/Zipkin）
3. ⏳ APM性能监控
4. ⏳ 自动化运维告警
5. ⏳ 机器学习异常检测

---

## 联系方式

如有问题或建议，请联系：

- **开发团队**: dev@example.com
- **运维团队**: ops@example.com
- **紧急联系**: +81-XX-XXXX-XXXX

---

**文档版本**: v1.0  
**最后更新**: 2026-04-01  
**维护者**: 监控专家团队

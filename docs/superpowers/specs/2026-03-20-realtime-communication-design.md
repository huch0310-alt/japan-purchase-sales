# 日本采销管理系统 - 实时通讯设计

## 概述

为日本采销管理系统添加WebSocket实时通讯功能，实现订单状态更新、消息通知的实时推送。

## 技术选型

| 组件 | 技术方案 | 理由 |
|------|----------|------|
| WebSocket | @nestjs/websockets + socket.io | NestJS官方推荐 |
| 实时消息 | Socket.io | 跨平台、 rooms支持 |
| 认证 | JWT Token | 与现有认证系统集成 |

## 功能设计

### 1. 实时事件

| 事件名称 | 方向 | 说明 |
|----------|------|------|
| order:created | 服务端→客户端 | 新订单创建通知 |
| order:status | 服务端→客户端 | 订单状态变更通知 |
| invoice:created | 服务端→客户端 | 請求書生成通知 |
| invoice:overdue | 服务端→客户端 | 請求書逾期提醒 |
| product:approved | 服务端→客户端 | 商品审核通过通知 |
| product:rejected | 服务端→客户端 | 商品审核拒绝通知 |
| message:new | 服务端→客户端 | 新消息通知 |

### 2. 房间管理

```
- user:{userId} - 用户私人房间
- role:{role} - 角色房间 (role:admin, role:sales)
- customer:{customerId} - 客户私人房间
```

### 3. 认证流程

```
客户端连接 → 发送JWT Token → 验证Token → 加入用户房间
```

## 模块设计

### 1. WebSocket网关

```typescript
// gateways/realtime.gateway.ts
@WebSocketGateway()
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // 验证JWT
    // 加入用户房间
  }

  handleDisconnect(client: Socket) {
    // 清理连接
  }

  // 广播方法
  notifyOrderCreated(order: Order)
  notifyOrderStatusChanged(order: Order)
  notifyInvoiceCreated(invoice: Invoice)
}
```

### 2. 事件服务

```typescript
// services/event.service.ts
@Injectable()
export class EventService {
  constructor(private gateway: RealtimeGateway) {}

  emitToUser(userId: string, event: string, data: any)
  emitToRole(role: string, event: string, data: any)
  broadcast(event: string, data: any)
}
```

## 客户端集成

### Web管理后台

```javascript
// 连接WebSocket
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

// 监听订单事件
socket.on('order:created', (order) => {
  // 显示通知
});
```

### Flutter APP

```dart
// 使用socket_io_client
final socket = IO.io('http://localhost:3001', <String, dynamic>{
  'auth': {'token': token}
});

socket.on('order:status', (data) {
  // 更新订单状态
});
```

## 验收标准

1. WebSocket连接稳定，支持断线重连
2. 订单状态变更实时推送到相关客户端
3. 消息通知即时送达
4. 支持Web和移动端
5. 与现有JWT认证无缝集成

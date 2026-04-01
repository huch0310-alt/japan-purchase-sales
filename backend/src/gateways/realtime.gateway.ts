import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

/**
 * 实时通讯网关
 * 处理WebSocket连接和事件推送
 */
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
  },
  // 心跳配置：10秒发送ping，5秒内未收到pong则断开
  pingTimeout: 5000,
  pingInterval: 10000,
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 日志记录器
  private readonly logger = new Logger(RealtimeGateway.name);

  // 在线用户映射
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  /**
   * 处理客户端连接
   * 认证方式：优先从 auth.header 获取 Bearer Token
   */
  async handleConnection(client: Socket) {
    try {
      // 从 authorization header 获取 token（更安全）
      // 格式: Authorization: Bearer <token>
      const authHeader = client.handshake.headers.authorization;
      let token: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // 如果 header 没有，尝试从 auth.token 获取（WebSocket 客户端常用方式）
      if (!token) {
        token = client.handshake.auth?.token || null;
      }

      if (!token) {
        this.logger.warn('WebSocket连接缺少认证token');
        client.disconnect();
        return;
      }

      // 验证JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // 将用户ID存储到socket
      client.data.userId = userId;
      client.data.role = payload.role;
      client.data.type = payload.type;

      // 加入用户私人房间
      client.join(`user:${userId}`);

      // 加入角色房间
      if (payload.role) {
        client.join(`role:${payload.role}`);
      }

      // 记录在线状态（不记录敏感信息）
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      this.logger.log(`用户 ${userId} 已连接, Socket ID: ${client.id}`);
    } catch (error) {
      this.logger.error('WebSocket认证失败');
      client.disconnect();
    }
  }

  /**
   * 处理客户端断开
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      // 从在线列表中移除
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }

      this.logger.log(`用户 ${userId} 已断开连接, Socket ID: ${client.id}`);
    }
  }

  /**
   * 发送消息给指定用户
   */
  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * 发送消息给指定角色
   */
  sendToRole(role: string, event: string, data: unknown) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  /**
   * 获取在线用户数
   */
  getOnlineCount(): number {
    return this.userSockets.size;
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}

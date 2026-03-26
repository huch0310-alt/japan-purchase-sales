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

/**
 * 实时通讯网关
 * 处理WebSocket连接和事件推送
 */
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://43.153.155.76', 'http://43.153.155.76:80'],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 在线用户映射
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  /**
   * 处理客户端连接
   */
  async handleConnection(client: Socket) {
    try {
      // 从query参数获取token
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        client.disconnect();
        return;
      }

      // 验证JWT token
      const payload = this.jwtService.verify(String(token));
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

      // 记录在线状态
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      console.log(`用户 ${userId} 已连接, Socket ID: ${client.id}`);
    } catch (error) {
      console.error('WebSocket认证失败:', error);
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

      console.log(`用户 ${userId} 已断开连接, Socket ID: ${client.id}`);
    }
  }

  /**
   * 发送消息给指定用户
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * 发送消息给指定角色
   */
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(event: string, data: any) {
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

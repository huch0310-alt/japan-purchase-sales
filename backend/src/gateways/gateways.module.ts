import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

/**
 * WebSocket网关模块
 * 全局共享，使所有模块都可以使用实时通讯
 */
@Global()
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class GatewaysModule {}

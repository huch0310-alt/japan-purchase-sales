import { Controller, Get, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';

/**
 * 消息控制器
 */
@ApiTags('消息通知')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * 获取消息列表
   */
  @Get()
  @ApiOperation({ summary: '获取消息列表' })
  async findAll(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const userType = req.user.type || 'staff';
    const messages = await this.messagesService.findByUser(userId, userType);
    const unreadCount = await this.messagesService.getUnreadCount(userId, userType);

    return {
      messages,
      unreadCount,
    };
  }

  /**
   * 获取未读数量
   */
  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const userType = req.user.type || 'staff';
    const count = await this.messagesService.getUnreadCount(userId, userType);
    return { count };
  }

  /**
   * 标记为已读
   */
  @Put(':id/read')
  @ApiOperation({ summary: '标记消息为已读' })
  async markAsRead(@Param('id') id: string) {
    await this.messagesService.markAsRead(id);
    return { message: '标记成功' };
  }

  /**
   * 标记所有为已读
   */
  @Put('read-all')
  @ApiOperation({ summary: '标记所有消息为已读' })
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const userType = req.user.type || 'staff';
    await this.messagesService.markAllAsRead(userId, userType);
    return { message: '标记成功' };
  }

  /**
   * 删除消息
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除消息' })
  async delete(@Param('id') id: string) {
    await this.messagesService.delete(id);
    return { message: '删除成功' };
  }
}

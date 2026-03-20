import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReturnStatus } from './entities/return.entity';

/**
 * 退货管理控制器
 */
@ApiTags('退货管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * 创建退货申请
   */
  @Post()
  @ApiOperation('创建退货申请')
  async create(@Body() body: {
    orderId: string;
    orderItemId?: string;
    reason: string;
    amount: number;
  }) {
    return this.returnsService.create(body);
  }

  /**
   * 获取退货列表
   */
  @Get()
  @ApiOperation('获取退货列表')
  @Roles('super_admin', 'admin')
  async findAll(@Query('status') status?: ReturnStatus) {
    return this.returnsService.findAll(status);
  }

  /**
   * 批准退货
   */
  @Put(':id/approve')
  @ApiOperation('批准退货')
  @Roles('super_admin', 'admin')
  async approve(@Param('id') id: string) {
    const operatorId = 'current-user-id';
    return this.returnsService.approve(id, operatorId);
  }

  /**
   * 拒绝退货
   */
  @Put(':id/reject')
  @ApiOperation('拒绝退货')
  @Roles('super_admin', 'admin')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.returnsService.reject(id, reason);
  }

  /**
   * 完成退货
   */
  @Put(':id/complete')
  @ApiOperation('完成退货')
  @Roles('super_admin', 'admin')
  async complete(@Param('id') id: string) {
    return this.returnsService.complete(id);
  }
}

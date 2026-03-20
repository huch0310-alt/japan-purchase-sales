import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PointsType } from './entities/points-log.entity';

/**
 * 会员管理控制器
 */
@ApiTags('会员管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * 获取所有会员等级
   */
  @Get('levels')
  @ApiOperation({ summary: '获取会员等级列表' })
  async getLevels() {
    return this.membersService.getLevels();
  }

  /**
   * 获取客户会员信息
   */
  @Get('customer/:customerId')
  @ApiOperation({ summary: '获取客户会员信息' })
  async getCustomerMember(@Param('customerId') customerId: string) {
    return this.membersService.getCustomerMember(customerId);
  }

  /**
   * 添加积分
   */
  @Post('points/add')
  @ApiOperation({ summary: '添加积分' })
  @Roles('super_admin', 'admin')
  async addPoints(@Body() body: { customerId: string; points: number; type: PointsType; remark?: string }) {
    return this.membersService.addPoints(
      body.customerId,
      body.points,
      body.type,
      undefined,
      body.remark,
    );
  }

  /**
   * 使用积分
   */
  @Post('points/use')
  @ApiOperation({ summary: '使用积分' })
  async usePoints(@Body() body: { customerId: string; points: number; remark?: string }) {
    return this.membersService.usePoints(
      body.customerId,
      body.points,
      undefined,
      body.remark,
    );
  }

  /**
   * 获取积分记录
   */
  @Get('points/logs/:customerId')
  @ApiOperation({ summary: '获取积分记录' })
  async getPointsLogs(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
  ) {
    return this.membersService.getPointsLogs(customerId, limit);
  }
}

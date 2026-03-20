import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 促销管理控制器
 */
@ApiTags('促销管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ==================== 促销活动 ====================

  @Post()
  @ApiOperation('创建促销活动')
  @Roles('super_admin', 'admin')
  async createPromotion(@Body() body: any) {
    return this.promotionsService.createPromotion(body);
  }

  @Get('active')
  @ApiOperation('获取进行中的促销活动')
  async getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  // ==================== 优惠券 ====================

  @Post('coupons')
  @ApiOperation('创建优惠券')
  @Roles('super_admin', 'admin')
  async createCoupon(@Body() body: any) {
    return this.promotionsService.createCoupon(body);
  }

  @Get('coupons')
  @ApiOperation('获取优惠券列表')
  @Roles('super_admin', 'admin')
  async getCoupons(@Query('isActive') isActive?: string) {
    return this.promotionsService.getCoupons(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
  }

  @Post('coupons/validate')
  @ApiOperation('验证优惠券')
  async validateCoupon(@Body() body: { code: string; orderAmount: number }) {
    return this.promotionsService.validateCoupon(body.code, body.orderAmount);
  }
}

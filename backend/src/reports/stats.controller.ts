import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from '../common/services/stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 统计控制器
 * 提供各种数据统计API
 */
@ApiTags('数据统计')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * 获取仪表盘统计数据
   */
  @Get('dashboard')
  @Roles('super_admin', 'admin', 'procurement', 'sales')
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  /**
   * 获取销售趋势
   */
  @Get('sales-trend')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取销售趋势' })
  async getSalesTrend(@Query('days') days: string) {
    return this.statsService.getSalesTrend(days ? parseInt(days) : 7);
  }

  /**
   * 获取热销商品
   */
  @Get('hot-products')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取热销商品排行' })
  async getHotProducts(@Query('limit') limit: string) {
    return this.statsService.getHotProducts(limit ? parseInt(limit) : 10);
  }

  /**
   * 获取销售报表
   */
  @Get('sales-report')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取销售报表数据' })
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getSalesReport(new Date(startDate), new Date(endDate));
  }

  /**
   * 获取客户排行
   */
  @Get('top-customers')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取客户购买排行' })
  async getTopCustomers(@Query('limit') limit: string) {
    return this.statsService.getTopCustomers(limit ? parseInt(limit) : 10);
  }

  /**
   * 获取分类销售占比
   */
  @Get('category-ratio')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取分类销售占比' })
  async getCategorySalesRatio() {
    return this.statsService.getCategorySalesRatio();
  }

  /**
   * 获取采购人员业绩
   */
  @Get('procurement-stats')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '获取采购人员业绩统计' })
  async getProcurementStats() {
    return this.statsService.getProcurementStats();
  }
}

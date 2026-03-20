import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from '../common/services/stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 仪表盘控制器
 */
@ApiTags('仪表盘')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * 获取仪表盘数据
   */
  @Get()
  @Roles('super_admin', 'admin', 'procurement', 'sales')
  @ApiOperation({ summary: '获取仪表盘数据' })
  async getDashboard() {
    const stats = await this.statsService.getDashboardStats();
    const salesTrend = await this.statsService.getSalesTrend(7);
    const hotProducts = await this.statsService.getHotProducts(5);

    return {
      stats,
      salesTrend,
      hotProducts,
    };
  }

  /**
   * 获取今日待办事项
   */
  @Get('todos')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取今日待办事项' })
  async getTodos() {
    const stats = await this.statsService.getDashboardStats();

    return {
      pendingOrders: stats.pendingOrders,
      pendingProducts: stats.pendingProducts,
      unpaidInvoices: stats.unpaidInvoices,
    };
  }
}

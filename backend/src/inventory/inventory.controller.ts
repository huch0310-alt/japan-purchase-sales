import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InventoryType } from './entities/inventory-log.entity';

/**
 * 库存管理控制器
 */
@ApiTags('库存管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * 记录库存变动
   */
  @Post('record')
  @ApiOperation('记录库存变动')
  @Roles('super_admin', 'admin', 'procurement')
  async recordInventory(@Body() body: {
    productId: string;
    type: InventoryType;
    quantity: number;
    remark?: string;
  }) {
    // 从请求中获取操作人ID（通过JWT）
    const operatorId = 'current-user-id';
    return this.inventoryService.recordInventory({
      ...body,
      operatorId,
    });
  }

  /**
   * 获取库存记录
   */
  @Get('logs')
  @ApiOperation('获取库存记录')
  @Roles('super_admin', 'admin', 'procurement')
  async getLogs(
    @Query('productId') productId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inventoryService.getLogs(
      productId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * 设置库存预警
   */
  @Post('alert')
  @ApiOperation('设置库存预警')
  @Roles('super_admin', 'admin')
  async setAlert(@Body() body: { productId: string; minQuantity: number }) {
    return this.inventoryService.setAlert(body.productId, body.minQuantity);
  }

  /**
   * 获取预警列表
   */
  @Get('alerts')
  @ApiOperation('获取预警列表')
  @Roles('super_admin', 'admin')
  async getAlerts(@Query('isActive') isActive?: string) {
    return this.inventoryService.getAlerts(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
  }

  /**
   * 获取低库存商品
   */
  @Get('low-stock')
  @ApiOperation('获取低库存商品')
  @Roles('super_admin', 'admin', 'procurement')
  async getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  /**
   * 获取库存统计
   */
  @Get('stats')
  @ApiOperation('获取库存统计')
  @Roles('super_admin', 'admin')
  async getStats() {
    return this.inventoryService.getInventoryStats();
  }
}

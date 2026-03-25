import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 订单控制器
 * 处理订单相关请求
 */
@ApiTags('订单管理')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 客户下单
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '客户创建订单' })
  async create(@Request() req, @Body() createOrderDto: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remark?: string;
  }) {
    return this.ordersService.create({
      customerId: req.user.id,
      ...createOrderDto,
    });
  }

  /**
   * 获取客户自己的订单列表
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前客户的订单列表' })
  async findMyOrders(@Request() req) {
    return this.ordersService.findByCustomer(req.user.id);
  }

  /**
   * 获取所有订单（管理后台/销售端）
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有订单列表' })
  async findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
  ) {
    return this.ordersService.findAll({
      status,
      customerId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAmount,
      maxAmount,
    });
  }

  /**
   * 批量确认订单
   */
  @Put('batch/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量确认订单' })
  async batchConfirm(@Body() body: { ids: string[] }, @Request() req) {
    await this.ordersService.batchConfirm(body.ids, req.user.id);
    return { message: '批量确认成功' };
  }

  /**
   * 获取可生成请求书的订单列表（已完成但未开单）
   */
  @Get('available-for-invoice')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取可生成请求书的订单列表' })
  async findAvailableForInvoice(
    @Query('customerId') customerId?: string,
  ) {
    return this.ordersService.findCompletedWithoutInvoice(customerId);
  }

  /**
   * 获取销售报表
   */
  @Get('reports/sales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取销售报表' })
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ordersService.getSalesReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  /**
   * 确认订单（销售端）
   */
  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '确认订单' })
  async confirm(@Param('id') id: string, @Request() req) {
    return this.ordersService.confirm(id, req.user.id);
  }

  /**
   * 完成订单
   */
  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '完成订单' })
  async complete(@Param('id') id: string) {
    return this.ordersService.complete(id);
  }

  /**
   * 取消订单（客户30分钟内可取消）
   */
  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消订单' })
  async cancel(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new Error('订单不存在');
    }
    // 检查是否为订单客户或销售人员
    if (order.customerId !== req.user.id && !['super_admin', 'admin', 'sales'].includes(req.user.role)) {
      throw new Error('无权取消此订单');
    }
    // 检查是否在30分钟内且未确认
    const createdTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutes = (now - createdTime) / (1000 * 60);
    if (minutes > 30 || order.status !== 'pending') {
      throw new Error('订单已无法取消');
    }
    return this.ordersService.cancel(id);
  }
}

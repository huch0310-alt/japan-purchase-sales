import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../common/types';
import { PaginationQueryDto } from '../common/dto/validation.dto';

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
  async create(@Request() req: AuthenticatedRequest, @Body() createOrderDto: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remark?: string;
  }) {
    const audit = {
      userId: req.user.id,
      userRole: req.user.type === 'customer' ? 'customer' : req.user.role,
      ip: req.ip,
    };
    return this.ordersService.create(
      {
        customerId: req.user.id,
        ...createOrderDto,
      },
      audit,
    );
  }

  /**
   * 获取客户自己的订单列表
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前客户的订单列表' })
  async findMyOrders(@Request() req: AuthenticatedRequest) {
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
    @Query() pagination: PaginationQueryDto,
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
      page: pagination.page,
      pageSize: pagination.pageSize,
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
  async batchConfirm(@Request() req: AuthenticatedRequest, @Body() body: { ids: string[] }) {
    const audit = {
      userId: req.user.id,
      userRole: req.user.role,
      ip: req.ip,
    };
    await this.ordersService.batchConfirm(body.ids, audit);
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
   * 权限：客户只能查看自己的订单，管理员/销售可以查看所有订单
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    // 客户只能查看自己的订单
    if (req.user.type === 'customer' && order.customerId !== req.user.id) {
      throw new ForbiddenException('无权查看此订单');
    }
    return order;
  }

  /**
   * 确认订单（销售端）
   */
  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '确认订单' })
  async confirm(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const audit = {
      userId: req.user.id,
      userRole: req.user.role,
      ip: req.ip,
    };
    return this.ordersService.confirm(id, audit);
  }

  /**
   * 完成订单
   */
  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '完成订单' })
  async complete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const audit = {
      userId: req.user.id,
      userRole: req.user.role,
      ip: req.ip,
    };
    return this.ordersService.complete(id, audit);
  }

  /**
   * 取消订单（客户30分钟内可取消）
   * 客户只能取消自己的订单，员工可以取消任何订单
   */
  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消订单' })
  async cancel(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 判断是否为客户角色（客户有30分钟限制）
    const isClient = req.user.type === 'customer';

    // 客户只能取消自己的订单
    if (isClient && order.customerId !== req.user.id) {
      throw new ForbiddenException('无权取消此订单');
    }

    // 员工取消：需要检查权限
    if (!isClient && !['super_admin', 'admin', 'sales'].includes(req.user.role)) {
      throw new ForbiddenException('无权取消此订单');
    }

    // 状态检查：只有待确认状态可以取消
    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不是待确认，无法取消');
    }

    // 时间检查已移至 Service 层（客户30分钟限制）
    const audit = {
      userId: req.user.id,
      userRole: req.user.type === 'customer' ? 'customer' : req.user.role,
      ip: req.ip,
    };
    return this.ordersService.cancel(id, req.user.id, undefined, isClient, audit);
  }
}

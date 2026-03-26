import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfigService } from '@nestjs/config';

/**
 * 請求書控制器
 * 处理請求書相关请求
 */
@ApiTags('請求書管理')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private configService: ConfigService,
  ) {}

  /**
   * 创建請求書（合并订单）
   */
  @Post()
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '创建請求書（合并订单）' })
  async create(@Body() createInvoiceDto: {
    customerId: string;
    orderIds: string[];
  }) {
    return this.invoicesService.create(createInvoiceDto);
  }

  /**
   * 获取客户自己的請求書
   */
  @Get('my')
  @ApiOperation({ summary: '获取当前客户的請求書列表' })
  async findMyInvoices(@Request() req) {
    const user = req.user;
    const userId = user.id;
    const userType = user.type;

    // 如果是客户直接查询自己的請求書
    if (userType === 'customer') {
      return this.invoicesService.findByCustomer(userId);
    }

    // 如果是员工，可以查看所有或通过customerId过滤
    return this.invoicesService.findAll({});
  }

  /**
   * 获取所有請求書
   */
  @Get()
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取所有請求書列表' })
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.invoicesService.findAll({
      customerId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * 获取請求書详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取請求書详情' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  /**
   * 生成PDF
   */
  @Get(':id/pdf')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '生成請求書PDF' })
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
      const filePath = await this.invoicesService.generateAndSavePdf(id, uploadDir);

      // 读取并返回PDF
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(process.cwd(), filePath);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice_${id}.pdf`,
      });

      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: 'PDF生成失败', error: error.message });
    }
  }

  /**
   * 标记为已付款
   */
  @Put(':id/paid')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '标记为已付款' })
  async markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(id);
  }

  /**
   * 撤销請求書（仅限未付款状态）
   */
  @Put(':id/cancel')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '撤销請求書（仅限未付款状态）' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return this.invoicesService.cancel(id, req.user.id, body.reason);
  }

  /**
   * 获取到期提醒列表
   */
  @Get('reminders/due')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取到期提醒列表（提前3天）' })
  async getDueReminders() {
    return this.invoicesService.getDueReminders();
  }
}

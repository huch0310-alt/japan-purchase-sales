import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ExportService } from '../common/services/export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 报表控制器
 * 处理报表导出请求
 * 导出操作有更严格的限流保护（每分钟最多10次）
 */
@ApiTags('报表导出')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 导出销售报表
   * 限流：每分钟10次（参见 reports.module.ts 的 export throttle 配置）
   */
  @Get('sales/export')
  @Roles('super_admin', 'admin', 'sales')
  @Throttle({ export: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: '导出销售报表（Excel）' })
  async exportSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportSalesReport(
      new Date(startDate),
      new Date(endDate),
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=sales_report_${startDate}_${endDate}.xlsx`,
    });
    res.send(buffer);
  }

  /**
   * 导出商品报表
   * 限流：每分钟10次
   */
  @Get('products/export')
  @Roles('super_admin', 'admin', 'sales')
  @Throttle({ export: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: '导出商品报表（Excel）' })
  async exportProductReport(@Res() res: Response) {
    const buffer = await this.exportService.exportProductReport();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=products_report.xlsx',
    });
    res.send(buffer);
  }

  /**
   * 导出客户报表
   * 限流：每分钟10次
   */
  @Get('customers/export')
  @Roles('super_admin', 'admin', 'sales')
  @Throttle({ export: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: '导出客户报表（Excel）' })
  async exportCustomerReport(@Res() res: Response) {
    const buffer = await this.exportService.exportCustomerReport();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=customers_report.xlsx',
    });
    res.send(buffer);
  }

  /**
   * 导出請求書报表
   * 限流：每分钟10次
   */
  @Get('invoices/export')
  @Roles('super_admin', 'admin', 'sales')
  @Throttle({ export: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: '导出請求書报表（Excel）' })
  async exportInvoiceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportInvoiceReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=invoices_report_${startDate}_${endDate}.xlsx`,
    });
    res.send(buffer);
  }
}

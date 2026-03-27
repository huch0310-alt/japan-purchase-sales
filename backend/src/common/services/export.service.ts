import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../users/entities/customer.entity';

/**
 * 导出服务
 * 处理Excel和PDF报表导出
 */
@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 导出销售报表
   */
  async exportSalesReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getMany();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '日本采销管理系统';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('销售报表');

    // 设置列宽
    sheet.columns = [
      { header: '订单号', key: 'orderNo', width: 20 },
      { header: '客户名称', key: 'companyName', width: 25 },
      { header: '下单时间', key: 'createdAt', width: 20 },
      { header: '状态', key: 'status', width: 12 },
      { header: '小计', key: 'subtotal', width: 15 },
      { header: '折扣', key: 'discountAmount', width: 15 },
      { header: '消费税', key: 'taxAmount', width: 12 },
      { header: '合计', key: 'totalAmount', width: 15 },
    ];

    // 添加样式
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // 添加数据
    let totalAmount = 0;
    for (const order of orders) {
      const customer = order.customer as any;
      sheet.addRow({
        orderNo: order.orderNo,
        companyName: customer?.companyName || '',
        createdAt: new Date(order.createdAt).toLocaleDateString('ja-JP'),
        status: this.getStatusText(order.status),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        taxAmount: Number(order.taxAmount),
        totalAmount: Number(order.totalAmount),
      });
      totalAmount += Number(order.totalAmount);
    }

    // 添加汇总行
    sheet.addRow([]);
    const summaryRow = sheet.addRow({
      orderNo: '合计',
      companyName: '',
      createdAt: '',
      status: '',
      subtotal: '',
      discountAmount: '',
      taxAmount: '',
      totalAmount: totalAmount,
    });
    summaryRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 导出商品报表
   */
  async exportProductReport(): Promise<Buffer> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .getMany();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '日本采销管理系统';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('商品报表');

    sheet.columns = [
      { header: '商品名称', key: 'name', width: 30 },
      { header: '分类', key: 'category', width: 15 },
      { header: '库存', key: 'quantity', width: 10 },
      { header: '单位', key: 'unit', width: 10 },
      { header: '采购价', key: 'purchasePrice', width: 12 },
      { header: '销售价', key: 'salePrice', width: 12 },
      { header: '状态', key: 'status', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const product of products) {
      const category = product.category as any;
      sheet.addRow({
        name: product.name,
        category: category?.name || '',
        quantity: product.quantity,
        unit: product.unit || '',
        purchasePrice: Number(product.purchasePrice),
        salePrice: Number(product.salePrice),
        status: this.getStatusText(product.status),
        createdAt: new Date(product.createdAt).toLocaleDateString('ja-JP'),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 导出客户报表
   * 使用SQL聚合查询解决N+1问题
   */
  async exportCustomerReport(): Promise<Buffer> {
    // 使用 LEFT JOIN 和 GROUP BY 一次查询获取所有客户及其订单统计
    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.orders', 'order')
      .select('customer.id', 'id')
      .addSelect('customer.companyName', 'companyName')
      .addSelect('customer.contactPerson', 'contactPerson')
      .addSelect('customer.phone', 'phone')
      .addSelect('customer.vipDiscount', 'vipDiscount')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'totalAmount')
      .where('customer.isActive = :isActive', { isActive: true })
      .andWhere('order.status IS NULL OR order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .groupBy('customer.id')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();

    const customerStats = result.map(row => ({
      companyName: row.companyName,
      contactPerson: row.contactPerson,
      phone: row.phone,
      orderCount: parseInt(row.orderCount) || 0,
      totalAmount: parseFloat(row.totalAmount) || 0,
      vipDiscount: row.vipDiscount,
    }));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '日本采销管理系统';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('客户报表');

    sheet.columns = [
      { header: '公司名称', key: 'companyName', width: 25 },
      { header: '联系人', key: 'contactPerson', width: 15 },
      { header: '联系电话', key: 'phone', width: 15 },
      { header: '订单数量', key: 'orderCount', width: 12 },
      { header: '消费总额', key: 'totalAmount', width: 15 },
      { header: 'VIP折扣', key: 'vipDiscount', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const stat of customerStats) {
      sheet.addRow(stat);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 导出請求書报表
   */
  async exportInvoiceReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer');

    if (startDate) {
      query.andWhere('invoice.issue_date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('invoice.issue_date <= :endDate', { endDate });
    }

    const invoices = await query.getMany();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = '日本采销管理系统';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('請求書报表');

    sheet.columns = [
      { header: '請求書番号', key: 'invoiceNo', width: 18 },
      { header: '客户名称', key: 'companyName', width: 25 },
      { header: '开具日期', key: 'issueDate', width: 15 },
      { header: '到期日期', key: 'dueDate', width: 15 },
      { header: '小计', key: 'subtotal', width: 15 },
      { header: '消费税', key: 'taxAmount', width: 12 },
      { header: '合计', key: 'totalAmount', width: 15 },
      { header: '状态', key: 'status', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E88E5' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const invoice of invoices) {
      const customer = invoice.customer as any;
      sheet.addRow({
        invoiceNo: invoice.invoiceNo,
        companyName: customer?.companyName || '',
        issueDate: new Date(invoice.issueDate).toLocaleDateString('ja-JP'),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('ja-JP'),
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount),
        status: this.getInvoiceStatusText(invoice.status),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * 获取订单状态文本
   */
  private getStatusText(status: string): string {
    const map = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };
    return map[status] || status;
  }

  /**
   * 获取請求書状态文本
   */
  private getInvoiceStatusText(status: string): string {
    const map = {
      unpaid: '未払い',
      paid: '支払済',
      overdue: '期限超過',
    };
    return map[status] || status;
  }
}

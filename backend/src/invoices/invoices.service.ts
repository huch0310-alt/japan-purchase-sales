import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { SettingService } from '../settings/settings.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * 請求書服务
 * 处理請求書生成、PDF生成和电子盖章
 */
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private settingService: SettingService,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成請求書番号
   */
  private generateInvoiceNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV${year}${month}${random}`;
  }

  /**
   * 创建請求書（合并订单）
   */
  async create(data: {
    customerId: string;
    orderIds: string[];
  }): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取订单信息
      let subtotal = 0;
      let taxBasis = 0; // 税前金额（折扣后）
      for (const orderId of data.orderIds) {
        const order = await this.ordersService.findById(orderId);
        if (!order) {
          throw new Error(`订单 ${orderId} 不存在`);
        }
        if (order.customerId !== data.customerId) {
          throw new Error('订单与客户不匹配');
        }
        if (order.status !== 'completed') {
          throw new BadRequestException(`订单 ${order.orderNo} 状态不是已完成，无法生成请求书`);
        }
        if (order.invoiceId) {
          throw new BadRequestException(`订单 ${order.orderNo} 已生成过请求书`);
        }
        subtotal += Number(order.subtotal);
        // 税前金额 = 订单合计 - 消费税
        taxBasis += Number(order.totalAmount) - Number(order.taxAmount);
      }

      // 获取消费税率
      const taxRate = await this.settingService.getValue('tax_rate') || '10';
      const taxRateNum = parseInt(taxRate) / 100;

      // 计算消费税（按税前金额）
      const taxAmount = Math.round(taxBasis * taxRateNum);

      // 税込合计
      const totalAmount = taxBasis + taxAmount;

      // 获取账期天数
      const defaultPaymentDays = parseInt(
        await this.settingService.getValue('default_payment_days') || '30'
      );

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + defaultPaymentDays);

      const invoice = queryRunner.manager.create(Invoice, {
        invoiceNo: this.generateInvoiceNo(),
        customerId: data.customerId,
        orderIds: data.orderIds,
        subtotal,
        taxAmount,
        totalAmount,
        issueDate,
        dueDate,
        status: 'unpaid',
      });

      // 1. 保存发票获取id
      const savedInvoice = await queryRunner.manager.save(Invoice, invoice);

      // 2. 更新所有订单的 invoice_id 字段
      await queryRunner.manager
        .createQueryBuilder()
        .update(Order)
        .set({ invoiceId: savedInvoice.id })
        .where('id IN (:...orderIds)', { orderIds: data.orderIds })
        .execute();

      await queryRunner.commitTransaction();
      return savedInvoice;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 根据ID查找請求書
   */
  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
  }

  /**
   * 根据請求書番号查找
   */
  async findByInvoiceNo(invoiceNo: string): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { invoiceNo },
      relations: ['customer'],
    });
  }

  /**
   * 查询客户請求書
   */
  async findByCustomer(customerId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询所有請求書
   */
  async findAll(filters?: {
    customerId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Invoice[]> {
    const query = this.invoiceRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer');

    if (filters?.customerId) {
      query.andWhere('invoice.customer_id = :customerId', { customerId: filters.customerId });
    }
    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }
    if (filters?.startDate) {
      query.andWhere('invoice.issue_date >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('invoice.issue_date <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('invoice.createdAt', 'DESC').getMany();
  }

  /**
   * 标记为已付款
   */
  async markAsPaid(id: string): Promise<Invoice> {
    await this.invoiceRepository.update(id, {
      status: 'paid',
      paidAt: new Date(),
    });
    return this.findById(id);
  }

  /**
   * 更新到期未付款状态
   */
  async updateOverdueStatus(): Promise<void> {
    const now = new Date();
    await this.invoiceRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: 'overdue' })
      .where('status = :status', { status: 'unpaid' })
      .andWhere('dueDate < :now', { now })
      .execute();
  }

  /**
   * 生成請求書PDF
   */
  async generatePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.findById(invoiceId);
    if (!invoice) {
      throw new Error('請求書不存在');
    }

    // 获取公司信息
    const companyName = await this.settingService.getValue('company_name') || '株式会社';
    const companyAddress = await this.settingService.getValue('company_address') || '';
    const companyPhone = await this.settingService.getValue('company_phone') || '';
    const companyFax = await this.settingService.getValue('company_fax') || '';
    const companyBank = await this.settingService.getValue('company_bank') || '';

    // 获取订单详情
    const orders = [];
    for (const orderId of invoice.orderIds) {
      const order = await this.ordersService.findById(orderId);
      if (order) {
        orders.push(order);
      }
    }

    // 创建PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4尺寸

    // 嵌入日文字体
    let font, boldFont;
    const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansJP-Regular.ttf');
    try {
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
      boldFont = font; // 使用同一字体（日文不支持粗体）
    } catch {
      // 如果字体文件不存在，使用Helvetica（但不支持日文）
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const { height } = page.getSize();

    // 标题
    page.drawText('請求書', {
      x: 250,
      y: height - 60,
      size: 24,
      font: boldFont,
    });

    // 請求書番号
    page.drawText(`請求書番号: ${invoice.invoiceNo}`, {
      x: 50,
      y: height - 100,
      size: 10,
      font,
    });

    // 日期信息
    const issueDateStr = new Date(invoice.issueDate).toLocaleDateString('ja-JP');
    const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('ja-JP');
    page.drawText(`発行日: ${issueDateStr}`, {
      x: 350,
      y: height - 100,
      size: 10,
      font,
    });
    page.drawText(`支払期限: ${dueDateStr}`, {
      x: 350,
      y: height - 115,
      size: 10,
      font,
    });

    // 公司信息（发出方）
    page.drawText('【発行元】', {
      x: 50,
      y: height - 150,
      size: 10,
      font: boldFont,
    });
    page.drawText(companyName, {
      x: 50,
      y: height - 165,
      size: 12,
      font: boldFont,
    });
    page.drawText(`住所: ${companyAddress}`, {
      x: 50,
      y: height - 180,
      size: 9,
      font,
    });
    page.drawText(`TEL: ${companyPhone}  FAX: ${companyFax}`, {
      x: 50,
      y: height - 195,
      size: 9,
      font,
    });
    page.drawText(`銀行口座: ${companyBank}`, {
      x: 50,
      y: height - 210,
      size: 9,
      font,
    });

    // 客户信息
    const customer = invoice.customer as any;
    page.drawText('【ご請求先】', {
      x: 50,
      y: height - 250,
      size: 10,
      font: boldFont,
    });
    page.drawText(customer?.invoiceName || customer?.companyName || '', {
      x: 50,
      y: height - 265,
      size: 12,
      font: boldFont,
    });
    page.drawText(`住所: ${customer?.invoiceAddress || customer?.address || ''}`, {
      x: 50,
      y: height - 280,
      size: 9,
      font,
    });
    page.drawText(`TEL: ${customer?.invoicePhone || customer?.phone || ''}`, {
      x: 50,
      y: height - 295,
      size: 9,
      font,
    });

    // 表格标题
    const tableTop = height - 350;
    page.drawRectangle({
      x: 50,
      y: tableTop,
      width: 495,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText('商品名', { x: 55, y: tableTop + 5, size: 9, font: boldFont });
    page.drawText('数量', { x: 300, y: tableTop + 5, size: 9, font: boldFont });
    page.drawText('単価', { x: 360, y: tableTop + 5, size: 9, font: boldFont });
    page.drawText('金額', { x: 450, y: tableTop + 5, size: 9, font: boldFont });

    // 订单明细
    let yPos = tableTop - 20;
    let itemCount = 0;
    for (const order of orders) {
      const items = order.items || [];
      for (const item of items) {
        page.drawText(item.productName?.substring(0, 25) || '', { x: 55, y: yPos, size: 8, font });
        page.drawText(String(item.quantity), { x: 310, y: yPos, size: 8, font });
        page.drawText(`¥${Number(item.unitPrice).toLocaleString()}`, { x: 360, y: yPos, size: 8, font });
        page.drawText(`¥${(Number(item.unitPrice) * item.quantity).toLocaleString()}`, { x: 450, y: yPos, size: 8, font });
        yPos -= 15;
        itemCount++;
        if (itemCount > 20) break;
      }
      if (itemCount > 20) break;
    }

    // 金额汇总
    yPos -= 30;
    page.drawText('小計（税抜）:', { x: 350, y: yPos, size: 10, font });
    page.drawText(`¥${Number(invoice.subtotal).toLocaleString()}`, { x: 450, y: yPos, size: 10, font });

    yPos -= 20;
    page.drawText('消費税:', { x: 350, y: yPos, size: 10, font });
    page.drawText(`¥${Number(invoice.taxAmount).toLocaleString()}`, { x: 450, y: yPos, size: 10, font });

    yPos -= 25;
    page.drawRectangle({ x: 340, y: yPos - 5, width: 200, height: 25, color: rgb(0.95, 0.95, 0.95) });
    page.drawText('合計金額（税込）:', { x: 345, y: yPos, size: 11, font: boldFont });
    page.drawText(`¥${Number(invoice.totalAmount).toLocaleString()}`, { x: 450, y: yPos, size: 11, font: boldFont });

    // 页脚
    page.drawText('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', {
      x: 50,
      y: 80,
      size: 8,
      font,
    });
    page.drawText('上記金額をお振込ください。', {
      x: 50,
      y: 65,
      size: 9,
      font,
    });
    page.drawText('お振込先: ' + companyBank, {
      x: 50,
      y: 50,
      size: 9,
      font,
    });

    // 生成PDF Buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * 生成PDF并保存
   */
  async generateAndSavePdf(invoiceId: string, uploadDir: string): Promise<string> {
    const pdfBuffer = await this.generatePdf(invoiceId);
    const fileName = `invoice_${invoiceId}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfBuffer);

    // 更新数据库中的文件URL
    await this.invoiceRepository.update(invoiceId, {
      fileUrl: `/uploads/${fileName}`,
    });

    return `/uploads/${fileName}`;
  }

  /**
   * 获取到期提醒列表（提前3天）
   */
  async getDueReminders(): Promise<Invoice[]> {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .where('invoice.status = :status', { status: 'unpaid' })
      .andWhere('invoice.dueDate <= :reminderDate', { reminderDate })
      .andWhere('invoice.dueDate >= :today', { today })
      .getMany();
  }
}

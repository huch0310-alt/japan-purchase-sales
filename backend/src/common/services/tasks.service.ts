import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, forwardRef } from '@nestjs/common';
import { InvoicesService } from '../../invoices/invoices.service';
import { MessagesService } from '../../messages/messages.service';
import { SettingService } from '../../settings/settings.service';
import { DataSource } from 'typeorm';

/**
 * 定时任务服务
 * 处理自动化的后台任务
 */
@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => InvoicesService))
    private invoicesService: InvoicesService,
    private messagesService: MessagesService,
    private settingService: SettingService,
    private dataSource: DataSource,
  ) {}

  onModuleInit() {
    console.log('定时任务服务已启动');
  }

  /**
   * 每天凌晨执行：更新請求書到期状态
   * 将过期的未付款請求書标记为overdue
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInvoiceOverdue() {
    console.log('执行任务：更新請求書到期状态');
    try {
      await this.invoicesService.updateOverdueStatus();
      console.log('請求書到期状态更新完成');
    } catch (error) {
      console.error('請求書到期状态更新失败:', error);
    }
  }

  /**
   * 每天上午9点执行：請求書到期提醒
   * 提前3天通知客户
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleInvoiceReminder() {
    console.log('执行任务：請求書到期提醒');
    try {
      const reminders = await this.invoicesService.getDueReminders();

      for (const invoice of reminders) {
        await this.messagesService.notifyInvoiceDue(
          invoice.id,
          invoice.customerId,
          new Date(invoice.dueDate),
        );
        console.log(`已发送請求書到期提醒: ${invoice.invoiceNo}`);
      }

      console.log(`請求書到期提醒发送完成，共 ${reminders.length} 条`);
    } catch (error) {
      console.error('請求書到期提醒发送失败:', error);
    }
  }

  /**
   * 每周一上午执行：生成周报数据
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyReport() {
    console.log('执行任务：生成周报数据');
    try {
      const report = await this.generateReport('weekly');
      // 发送周报给管理员
      await this.notifyAdmins('周报', report);
      console.log('周报生成完成', report);
    } catch (error) {
      console.error('周报生成失败:', error);
    }
  }

  /**
   * 每月1号执行：生成月报数据
   */
  @Cron('0 0 1 * *')
  async handleMonthlyReport() {
    console.log('执行任务：生成月报数据');
    try {
      const report = await this.generateReport('monthly');
      // 发送月报给管理员
      await this.notifyAdmins('月报', report);
      console.log('月报生成完成', report);
    } catch (error) {
      console.error('月报生成失败:', error);
    }
  }

  /**
   * 生成报表数据
   */
  private async generateReport(type: 'weekly' | 'monthly') {
    const now = new Date();
    let startDate: Date;

    if (type === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 查询订单统计
    const orderStats = await this.dataSource.query(
      `SELECT
        COUNT(*) as orderCount,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(AVG(total_amount), 0) as avgAmount
      FROM orders
      WHERE created_at >= $1 AND status IN ('confirmed', 'completed')`,
      [startDate]
    );

    // 查询新增客户统计
    const customerStats = await this.dataSource.query(
      `SELECT COUNT(*) as newCustomerCount FROM customers WHERE created_at >= $1`,
      [startDate]
    );

    return {
      type,
      period: { startDate, endDate: now },
      orders: orderStats[0] || { orderCount: 0, totalamount: 0, avgamount: 0 },
      customers: customerStats[0] || { newcustomercount: 0 },
      generatedAt: now,
    };
  }

  /**
   * 通知管理员
   */
  private async notifyAdmins(reportType: string, report: any) {
    const admins = await this.dataSource.query(
      `SELECT id FROM staff WHERE role IN ('super_admin', 'admin') AND is_active = true`
    );

    const title = `${reportType}统计`;
    const content = `${reportType}生成完成。订单数: ${report.orders.orderCount}, 总金额: ${report.orders.totalamount}`;

    for (const admin of admins || []) {
      await this.messagesService.create({
        userId: admin.id,
        userType: 'staff',
        title,
        content,
        type: 'report',
      });
    }
  }
}

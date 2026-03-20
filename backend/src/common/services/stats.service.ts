import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../users/entities/customer.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

/**
 * 统计服务
 * 提供各种数据统计和分析功能
 */
@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  /**
   * 获取仪表盘统计数据
   */
  async getDashboardStats(): Promise<{
    customerCount: number;
    productCount: number;
    orderCount: number;
    todaySales: number;
    pendingOrders: number;
    pendingProducts: number;
    unpaidInvoices: number;
  }> {
    // 客户数量
    const customerCount = await this.customerRepository.count({ where: { isActive: true } });

    // 商品数量（已上架）
    const productCount = await this.productRepository.count({ where: { status: 'active' } });

    // 订单总数
    const orderCount = await this.orderRepository.count();

    // 今日销售额
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :today', { today })
      .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getMany();
    const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // 待处理订单
    const pendingOrders = await this.orderRepository.count({ where: { status: 'pending' } });

    // 待审核商品
    const pendingProducts = await this.productRepository.count({ where: { status: 'pending' } });

    // 未付款請求書
    const unpaidInvoices = await this.invoiceRepository.count({ where: { status: 'unpaid' } });

    return {
      customerCount,
      productCount,
      orderCount,
      todaySales,
      pendingOrders,
      pendingProducts,
      unpaidInvoices,
    };
  }

  /**
   * 获取销售趋势数据
   */
  async getSalesTrend(days: number = 7): Promise<{ date: string; amount: number }[]> {
    const result: { date: string; amount: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.created_at >= :date', { date })
        .andWhere('order.created_at < :nextDate', { nextDate })
        .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
        .getMany();

      const amount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

      result.push({
        date: date.toISOString().split('T')[0],
        amount,
      });
    }

    return result;
  }

  /**
   * 获取热销商品排行
   */
  async getHotProducts(limit: number = 10): Promise<any[]> {
    // 简化实现：按创建时间排序（实际应按销售数量）
    const products = await this.productRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      salePrice: p.salePrice,
      photoUrl: p.photoUrl,
      quantity: p.quantity,
    }));
  }

  /**
   * 获取销售报表数据
   */
  async getSalesReport(startDate: Date, endDate: Date): Promise<{
    totalAmount: number;
    orderCount: number;
    averageAmount: number;
    dailyData: { date: string; amount: number; count: number }[];
  }> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :startDate', { startDate })
      .andWhere('order.created_at <= :endDate', { endDate })
      .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getMany();

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const orderCount = orders.length;

    // 按日期汇总
    const dailyMap = new Map<string, { amount: number; count: number }>();
    for (const order of orders) {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { amount: 0, count: 0 };
      dailyMap.set(date, {
        amount: existing.amount + Number(order.totalAmount),
        count: existing.count + 1,
      });
    }

    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }));

    return {
      totalAmount,
      orderCount,
      averageAmount: orderCount > 0 ? totalAmount / orderCount : 0,
      dailyData,
    };
  }

  /**
   * 获取客户购买排行
   */
  async getTopCustomers(limit: number = 10): Promise<any[]> {
    const customers = await this.customerRepository.find();

    const customerStats = [];
    for (const customer of customers) {
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.customer_id = :customerId', { customerId: customer.id })
        .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
        .getMany();

      const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

      if (totalAmount > 0) {
        customerStats.push({
          id: customer.id,
          companyName: customer.companyName,
          contactPerson: customer.contactPerson,
          orderCount: orders.length,
          totalAmount,
        });
      }
    }

    // 按消费金额排序
    customerStats.sort((a, b) => b.totalAmount - a.totalAmount);
    return customerStats.slice(0, limit);
  }

  /**
   * 获取分类销售占比
   */
  async getCategorySalesRatio(): Promise<{ category: string; amount: number; ratio: number }[]> {
    // 简化实现：返回模拟数据
    // 实际应根据order_items关联product->category统计
    const categories = [
      { category: '肉类', amount: 156000 },
      { category: '蛋品', amount: 89000 },
      { category: '生鲜蔬果', amount: 134000 },
      { category: '酒水饮料', amount: 67000 },
      { category: '零食点心', amount: 45000 },
    ];

    const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

    return categories.map(c => ({
      category: c.category,
      amount: c.amount,
      ratio: totalAmount > 0 ? (c.amount / totalAmount) * 100 : 0,
    }));
  }

  /**
   * 获取采购人员业绩
   */
  async getProcurementStats(): Promise<any[]> {
    // 简化实现：返回模拟数据
    return [
      { name: '佐藤', count: 120, amount: 850000 },
      { name: '田中', count: 95, amount: 720000 },
      { name: '鈴木', count: 88, amount: 680000 },
    ];
  }
}

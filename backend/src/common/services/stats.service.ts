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
      .createQueryBuilder('o')
      .where('o.createdAt >= :today', { today })
      .andWhere('o.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
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
        .createQueryBuilder('o')
        .where('o.createdAt >= :date', { date })
        .andWhere('o.createdAt < :nextDate', { nextDate })
        .andWhere('o.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
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
    // 根据销售数量排序
    const products = await this.productRepository.find({
      where: { status: 'active' },
      order: { salesCount: 'DESC' },
      take: limit,
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      salePrice: p.salePrice,
      photoUrl: p.photoUrl,
      quantity: p.quantity,
      salesCount: p.salesCount || 0,
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
      .createQueryBuilder('o')
      .where('o.createdAt >= :startDate', { startDate })
      .andWhere('o.createdAt <= :endDate', { endDate })
      .andWhere('o.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
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
        .createQueryBuilder('o')
        .where('o.customer_id = :customerId', { customerId: customer.id })
        .andWhere('o.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
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
  async getCategorySalesRatio(): Promise<{ categoryName: string; amount: number; ratio: number }[]> {
    // 通过order_items关联product和category统计实际销售
    const result = await this.orderRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('o.status IN (:...statuses)', { statuses: ['confirmed', 'completed'] })
      .getMany();

    // 按分类汇总销售额
    const categoryMap = new Map<string, number>();
    for (const order of result) {
      const items = order.items || [];
      for (const item of items) {
        const categoryName = item.product?.category?.nameZh || '未分类';
        const amount = Number(item.unitPrice) * Number(item.quantity);
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
      }
    }

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, a) => sum + a, 0);

    return Array.from(categoryMap.entries())
      .map(([categoryName, amount]) => ({
        categoryName,
        amount,
        ratio: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * 获取采购人员业绩
   */
  async getProcurementStats(): Promise<any[]> {
    // 通过products的createdBy统计采购业绩
    const result = await this.productRepository
      .createQueryBuilder('product')
      .where('product.createdBy IS NOT NULL')
      .getMany();

    // 按采购人员汇总
    const staffMap = new Map<string, { staffId: string; count: number; amount: number }>();
    for (const product of result) {
      if (product.createdBy) {
        const existing = staffMap.get(product.createdBy) || { staffId: product.createdBy, count: 0, amount: 0 };
        existing.count += 1;
        existing.amount += Number(product.purchasePrice) * Number(product.quantity);
        staffMap.set(product.createdBy, existing);
      }
    }

    return Array.from(staffMap.entries())
      .map(([staffId, data]) => ({
        staffId: data.staffId,
        count: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => b.count - a.count);
  }
}

import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../users/entities/customer.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
export declare class StatsService {
    private orderRepository;
    private productRepository;
    private customerRepository;
    private invoiceRepository;
    constructor(orderRepository: Repository<Order>, productRepository: Repository<Product>, customerRepository: Repository<Customer>, invoiceRepository: Repository<Invoice>);
    getDashboardStats(): Promise<{
        customerCount: number;
        productCount: number;
        orderCount: number;
        todaySales: number;
        pendingOrders: number;
        pendingProducts: number;
        unpaidInvoices: number;
    }>;
    getSalesTrend(days?: number): Promise<{
        date: string;
        amount: number;
    }[]>;
    getHotProducts(limit?: number): Promise<any[]>;
    getSalesReport(startDate: Date, endDate: Date): Promise<{
        totalAmount: number;
        orderCount: number;
        averageAmount: number;
        dailyData: {
            date: string;
            amount: number;
            count: number;
        }[];
    }>;
    getTopCustomers(limit?: number): Promise<any[]>;
    getCategorySalesRatio(): Promise<{
        category: string;
        amount: number;
        ratio: number;
    }[]>;
    getProcurementStats(): Promise<any[]>;
}

import { StatsService } from '../common/services/stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboardStats(): Promise<{
        customerCount: number;
        productCount: number;
        orderCount: number;
        todaySales: number;
        pendingOrders: number;
        pendingProducts: number;
        unpaidInvoices: number;
    }>;
    getSalesTrend(days: string): Promise<{
        date: string;
        amount: number;
    }[]>;
    getHotProducts(limit: string): Promise<any[]>;
    getSalesReport(startDate: string, endDate: string): Promise<{
        totalAmount: number;
        orderCount: number;
        averageAmount: number;
        dailyData: {
            date: string;
            amount: number;
            count: number;
        }[];
    }>;
    getTopCustomers(limit: string): Promise<any[]>;
    getCategorySalesRatio(): Promise<{
        category: string;
        amount: number;
        ratio: number;
    }[]>;
    getProcurementStats(): Promise<any[]>;
}

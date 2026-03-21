import { StatsService } from '../common/services/stats.service';
export declare class DashboardController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboard(): Promise<{
        stats: {
            customerCount: number;
            productCount: number;
            orderCount: number;
            todaySales: number;
            pendingOrders: number;
            pendingProducts: number;
            unpaidInvoices: number;
        };
        salesTrend: {
            date: string;
            amount: number;
        }[];
        hotProducts: any[];
    }>;
    getTodos(): Promise<{
        pendingOrders: number;
        pendingProducts: number;
        unpaidInvoices: number;
    }>;
}

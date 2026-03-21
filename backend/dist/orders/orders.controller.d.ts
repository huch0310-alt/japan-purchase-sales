import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, createOrderDto: {
        items: {
            productId: string;
            quantity: number;
        }[];
        deliveryAddress: string;
        contactPerson: string;
        contactPhone: string;
        remark?: string;
    }): Promise<import("./entities/order.entity").Order>;
    findMyOrders(req: any): Promise<import("./entities/order.entity").Order[]>;
    findAll(status?: string, customerId?: string, startDate?: string, endDate?: string, minAmount?: number, maxAmount?: number): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    confirm(id: string, req: any): Promise<import("./entities/order.entity").Order>;
    batchConfirm(body: {
        ids: string[];
    }, req: any): Promise<{
        message: string;
    }>;
    complete(id: string): Promise<import("./entities/order.entity").Order>;
    cancel(id: string, req: any): Promise<import("./entities/order.entity").Order>;
    getSalesReport(startDate: string, endDate: string): Promise<any>;
}

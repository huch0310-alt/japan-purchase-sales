import { OrdersService } from './orders.service';
import { AuthenticatedRequest } from '../common/types';
import { PaginationQueryDto } from '../common/dto/validation.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: AuthenticatedRequest, createOrderDto: {
        items: {
            productId: string;
            quantity: number;
        }[];
        deliveryAddress: string;
        contactPerson: string;
        contactPhone: string;
        remark?: string;
    }): Promise<import("./entities/order.entity").Order>;
    findMyOrders(req: AuthenticatedRequest): Promise<import("./entities/order.entity").Order[]>;
    findAll(pagination: PaginationQueryDto, status?: string, customerId?: string, startDate?: string, endDate?: string, minAmount?: number, maxAmount?: number): Promise<import("../common/dto/validation.dto").PaginatedResponse<import("./entities/order.entity").Order>>;
    batchConfirm(req: AuthenticatedRequest, body: {
        ids: string[];
    }): Promise<{
        message: string;
    }>;
    findAvailableForInvoice(customerId?: string): Promise<import("./entities/order.entity").Order[]>;
    getSalesReport(startDate: string, endDate: string): Promise<any>;
    findOne(req: AuthenticatedRequest, id: string): Promise<import("./entities/order.entity").Order>;
    confirm(id: string, req: AuthenticatedRequest): Promise<import("./entities/order.entity").Order>;
    complete(id: string, req: AuthenticatedRequest): Promise<import("./entities/order.entity").Order>;
    cancel(id: string, req: AuthenticatedRequest): Promise<import("./entities/order.entity").Order>;
}

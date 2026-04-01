import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { EventService } from '../common/services/event.service';
import { PaginatedResponse } from '../common/dto/validation.dto';
import { LogsService } from '../logs/logs.service';
import { OperationAuditContext } from '../common/types';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private customerService;
    private settingService;
    private productsService;
    private inventoryService;
    private eventService;
    private dataSource;
    private logsService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, customerService: CustomerService, settingService: SettingService, productsService: ProductsService, inventoryService: InventoryService, eventService: EventService, dataSource: DataSource, logsService: LogsService);
    private generateOrderNo;
    create(data: {
        customerId: string;
        items: {
            productId: string;
            quantity: number;
        }[];
        deliveryAddress: string;
        contactPerson: string;
        contactPhone: string;
        remark?: string;
    }, audit?: OperationAuditContext): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByOrderNo(orderNo: string): Promise<Order | null>;
    findByCustomer(customerId: string): Promise<Order[]>;
    findAll(filters?: {
        status?: string;
        customerId?: string;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Order>>;
    confirm(id: string, audit?: OperationAuditContext): Promise<Order>;
    batchConfirm(ids: string[], audit?: OperationAuditContext): Promise<void>;
    complete(id: string, audit?: OperationAuditContext): Promise<Order>;
    cancel(id: string, cancelledById?: string, cancelReason?: string, isClient?: boolean, audit?: OperationAuditContext): Promise<Order>;
    findCompletedWithoutInvoice(customerId?: string): Promise<Order[]>;
    getSalesReport(startDate: Date, endDate: Date): Promise<any>;
    updateInvoiceInfo(orderIds: string[], invoiceId: string): Promise<void>;
    clearInvoiceInfo(invoiceId: string): Promise<void>;
}

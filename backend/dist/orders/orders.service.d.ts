import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';
import { EventService } from '../common/services/event.service';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private customerService;
    private settingService;
    private productsService;
    private eventService;
    private dataSource;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, customerService: CustomerService, settingService: SettingService, productsService: ProductsService, eventService: EventService, dataSource: DataSource);
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
    }): Promise<Order>;
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
    }): Promise<Order[]>;
    confirm(id: string, confirmedById: string): Promise<Order>;
    batchConfirm(ids: string[], confirmedById: string): Promise<void>;
    complete(id: string): Promise<Order>;
    cancel(id: string): Promise<Order>;
    getSalesReport(startDate: Date, endDate: Date): Promise<any>;
}

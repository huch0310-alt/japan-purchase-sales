import { Repository, DataSource } from 'typeorm';
import { Return, ReturnStatus } from './entities/return.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
export declare class ReturnsService {
    private returnRepository;
    private orderRepository;
    private orderItemRepository;
    private productRepository;
    private dataSource;
    constructor(returnRepository: Repository<Return>, orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, dataSource: DataSource);
    create(data: {
        orderId: string;
        orderItemId?: string;
        reason: string;
        amount: number;
    }): Promise<Return>;
    findAll(status?: ReturnStatus, customerId?: string): Promise<Return[]>;
    approve(id: string, approvedBy: string): Promise<Return | null>;
    reject(id: string, rejectReason: string): Promise<Return | null>;
    complete(id: string): Promise<Return | null>;
}

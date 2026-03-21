import { Repository } from 'typeorm';
import { InventoryLog, InventoryType } from './entities/inventory-log.entity';
import { InventoryAlert } from './entities/inventory-alert.entity';
import { Product } from '../products/entities/product.entity';
import { MessagesService } from '../messages/messages.service';
export declare class InventoryService {
    private logRepository;
    private alertRepository;
    private productRepository;
    private messagesService;
    constructor(logRepository: Repository<InventoryLog>, alertRepository: Repository<InventoryAlert>, productRepository: Repository<Product>, messagesService: MessagesService);
    recordInventory(data: {
        productId: string;
        type: InventoryType;
        quantity: number;
        operatorId: string;
        remark?: string;
    }): Promise<InventoryLog>;
    getLogs(productId?: string, startDate?: Date, endDate?: Date): Promise<InventoryLog[]>;
    setAlert(productId: string, minQuantity: number): Promise<InventoryAlert>;
    getAlerts(isActive?: boolean): Promise<InventoryAlert[]>;
    getLowStockProducts(): Promise<InventoryAlert[]>;
    private checkInventoryAlert;
    getInventoryStats(): Promise<{
        totalProducts: number;
        totalQuantity: number;
        lowStockCount: number;
        outOfStockCount: number;
    }>;
}

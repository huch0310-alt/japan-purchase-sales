import { InventoryService } from './inventory.service';
import { InventoryType } from './entities/inventory-log.entity';
import { AuthenticatedRequest } from '../common/types';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    recordInventory(req: AuthenticatedRequest, body: {
        productId: string;
        type: InventoryType;
        quantity: number;
        remark?: string;
    }): Promise<import("./entities/inventory-log.entity").InventoryLog>;
    getLogs(productId?: string, startDate?: string, endDate?: string): Promise<import("./entities/inventory-log.entity").InventoryLog[]>;
    setAlert(body: {
        productId: string;
        minQuantity: number;
    }): Promise<import("./entities/inventory-alert.entity").InventoryAlert>;
    getAlerts(isActive?: string): Promise<import("./entities/inventory-alert.entity").InventoryAlert[]>;
    getLowStock(): Promise<import("./entities/inventory-alert.entity").InventoryAlert[]>;
    getStats(): Promise<{
        totalProducts: number;
        totalQuantity: number;
        lowStockCount: number;
        outOfStockCount: number;
    }>;
}

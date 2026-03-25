import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findActive(categoryId?: string): Promise<import("./entities/product.entity").Product[]>;
    findPending(): Promise<import("./entities/product.entity").Product[]>;
    findAll(categoryId?: string, status?: string, keyword?: string): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    create(req: any, createProductDto: {
        name: string;
        quantity?: number;
        unit?: string;
        description?: string;
        categoryId?: string;
        purchasePrice?: number;
    }): Promise<import("./entities/product.entity").Product>;
    approve(id: string, body: {
        salePrice: number;
    }): Promise<import("./entities/product.entity").Product>;
    reject(id: string): Promise<import("./entities/product.entity").Product>;
    activate(id: string): Promise<import("./entities/product.entity").Product>;
    deactivate(id: string): Promise<import("./entities/product.entity").Product>;
    batchDeactivate(body: {
        ids: string[];
    }): Promise<{
        message: string;
    }>;
    update(id: string, updateProductDto: any): Promise<import("./entities/product.entity").Product>;
    delete(id: string): Promise<{
        message: string;
    }>;
    findHotProducts(limit?: number): Promise<import("./entities/product.entity").Product[]>;
}

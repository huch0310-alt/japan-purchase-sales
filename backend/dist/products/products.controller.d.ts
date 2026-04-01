import { ProductsService } from './products.service';
import { AuthenticatedRequest } from '../common/types';
import { PaginationQueryDto } from '../common/dto/validation.dto';
import { UpdateProductDto } from './dto/product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findActive(categoryId?: string): Promise<import("../common/dto/validation.dto").PaginatedResponse<import("./entities/product.entity").Product>>;
    findPending(): Promise<import("./entities/product.entity").Product[]>;
    findAll(pagination: PaginationQueryDto, categoryId?: string, status?: string, keyword?: string): Promise<import("../common/dto/validation.dto").PaginatedResponse<import("./entities/product.entity").Product>>;
    findOne(id: string): Promise<import("./entities/product.entity").Product | null>;
    create(req: AuthenticatedRequest, createProductDto: {
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
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    delete(id: string): Promise<{
        message: string;
    }>;
    findHotProducts(limit?: number): Promise<import("./entities/product.entity").Product[]>;
}

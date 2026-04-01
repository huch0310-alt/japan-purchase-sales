import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { EventService } from '../common/services/event.service';
import { PaginatedResponse } from '../common/dto/validation.dto';
export declare class ProductsService {
    private productRepository;
    private eventService;
    constructor(productRepository: Repository<Product>, eventService: EventService);
    findById(id: string): Promise<Product | null>;
    findByIds(ids: string[]): Promise<Product[]>;
    findAll(filters?: {
        categoryId?: string;
        status?: string;
        keyword?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Product>>;
    findPending(): Promise<Product[]>;
    findActive(): Promise<Product[]>;
    create(data: {
        name: string;
        quantity?: number;
        unit?: string;
        description?: string;
        categoryId?: string;
        createdBy: string;
    }): Promise<Product>;
    approve(id: string, salePrice: number): Promise<Product>;
    reject(id: string): Promise<Product>;
    activate(id: string): Promise<Product>;
    deactivate(id: string): Promise<Product>;
    batchDeactivate(ids: string[]): Promise<void>;
    update(id: string, data: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<void>;
    findHotProducts(limit?: number): Promise<Product[]>;
}

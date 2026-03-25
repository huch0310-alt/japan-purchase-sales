"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const event_service_1 = require("../common/services/event.service");
let ProductsService = class ProductsService {
    constructor(productRepository, eventService) {
        this.productRepository = productRepository;
        this.eventService = eventService;
    }
    async findById(id) {
        return this.productRepository.findOne({
            where: { id },
            relations: ['category']
        });
    }
    async findAll(filters) {
        const query = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category');
        if (filters?.categoryId) {
            query.andWhere('product.category_id = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.status) {
            query.andWhere('product.status = :status', { status: filters.status });
        }
        if (filters?.keyword) {
            query.andWhere('product.name LIKE :keyword', { keyword: `%${filters.keyword}%` });
        }
        return query.orderBy('product.createdAt', 'DESC').getMany();
    }
    async findPending() {
        return this.productRepository.find({
            where: { status: 'pending' },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async findActive() {
        return this.productRepository.find({
            where: { status: 'active' },
            relations: ['category'],
            order: { createdAt: 'DESC' },
        });
    }
    async create(data) {
        const product = this.productRepository.create({
            ...data,
            status: 'pending',
        });
        return this.productRepository.save(product);
    }
    async approve(id, salePrice) {
        await this.productRepository.update(id, {
            status: 'approved',
            salePrice,
        });
        const product = await this.findById(id);
        if (product) {
            this.eventService.notifyProductApproved(product);
        }
        return product;
    }
    async reject(id) {
        await this.productRepository.update(id, { status: 'rejected' });
        const product = await this.findById(id);
        if (product) {
            this.eventService.notifyProductRejected(product);
        }
        return product;
    }
    async activate(id) {
        await this.productRepository.update(id, { status: 'active' });
        return this.findById(id);
    }
    async deactivate(id) {
        await this.productRepository.update(id, { status: 'inactive' });
        return this.findById(id);
    }
    async batchDeactivate(ids) {
        await this.productRepository.update(ids, { status: 'inactive' });
    }
    async update(id, data) {
        await this.productRepository.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.productRepository.delete(id);
    }
    async findHotProducts(limit = 10) {
        return this.productRepository.find({
            where: { status: 'active' },
            relations: ['category'],
            order: { salesCount: 'DESC', createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => event_service_1.EventService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_service_1.EventService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const return_entity_1 = require("./entities/return.entity");
let ReturnsService = class ReturnsService {
    constructor(returnRepository) {
        this.returnRepository = returnRepository;
    }
    async create(data) {
        const returnOrder = this.returnRepository.create({
            ...data,
            status: return_entity_1.ReturnStatus.PENDING,
        });
        return this.returnRepository.save(returnOrder);
    }
    async findAll(status, customerId) {
        const query = this.returnRepository.createQueryBuilder('ret')
            .leftJoinAndSelect('ret.order', 'order')
            .orderBy('ret.createdAt', 'DESC');
        if (status) {
            query.andWhere('ret.status = :status', { status });
        }
        if (customerId) {
            query.andWhere('order.customer_id = :customerId', { customerId });
        }
        return query.getMany();
    }
    async approve(id, approvedBy) {
        await this.returnRepository.update(id, {
            status: return_entity_1.ReturnStatus.APPROVED,
            approvedBy,
            processedAt: new Date(),
        });
        return this.returnRepository.findOne({ where: { id } });
    }
    async reject(id, rejectReason) {
        await this.returnRepository.update(id, {
            status: return_entity_1.ReturnStatus.REJECTED,
            rejectReason,
            processedAt: new Date(),
        });
        return this.returnRepository.findOne({ where: { id } });
    }
    async complete(id) {
        await this.returnRepository.update(id, {
            status: return_entity_1.ReturnStatus.COMPLETED,
            processedAt: new Date(),
        });
        return this.returnRepository.findOne({ where: { id } });
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(return_entity_1.Return)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map
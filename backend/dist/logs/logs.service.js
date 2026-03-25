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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_entity_1 = require("./entities/log.entity");
let LogsService = class LogsService {
    constructor(logRepository) {
        this.logRepository = logRepository;
    }
    async create(data) {
        const log = this.logRepository.create(data);
        return this.logRepository.save(log);
    }
    async findAll(filters) {
        const query = this.logRepository.createQueryBuilder('log');
        if (filters?.userId) {
            query.andWhere('log.user_id = :userId', { userId: filters.userId });
        }
        if (filters?.userRole) {
            query.andWhere('log.user_role = :userRole', { userRole: filters.userRole });
        }
        if (filters?.module) {
            query.andWhere('log.module = :module', { module: filters.module });
        }
        if (filters?.startDate) {
            query.andWhere('log.created_at >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            query.andWhere('log.created_at <= :endDate', { endDate: filters.endDate });
        }
        return query.orderBy('log.createdAt', 'DESC').getMany();
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.OperationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogsService);
//# sourceMappingURL=logs.service.js.map
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
var LogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_entity_1 = require("./entities/log.entity");
let LogsService = LogsService_1 = class LogsService {
    constructor(logRepository) {
        this.logRepository = logRepository;
        this.logger = new common_1.Logger(LogsService_1.name);
    }
    async create(data) {
        const log = this.logRepository.create(data);
        return this.logRepository.save(log);
    }
    async recordOperation(params) {
        try {
            await this.create({
                userId: params.userId,
                userRole: params.userRole,
                module: params.module,
                action: params.action,
                detail: params.detail ? JSON.stringify(params.detail) : undefined,
                ip: params.ip,
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`操作日志写入失败：${msg}`);
        }
    }
    async findAll(filters) {
        const query = this.logRepository.createQueryBuilder('log');
        if (filters?.userId) {
            query.andWhere('log.user_id = :userId', { userId: filters.userId });
        }
        if (filters?.userRoles?.length) {
            query.andWhere('log.user_role IN (:...roles)', { roles: filters.userRoles });
        }
        else if (filters?.userRole) {
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
        return query.orderBy('log.created_at', 'DESC').getMany();
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = LogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.OperationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogsService);
//# sourceMappingURL=logs.service.js.map
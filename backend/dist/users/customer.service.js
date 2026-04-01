"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const customer_entity_1 = require("./entities/customer.entity");
function validatePasswordStrength(password) {
    if (!password || password.length < 8) {
        throw new common_1.BadRequestException('密码长度不能少于8位');
    }
    if (!/[A-Z]/.test(password)) {
        throw new common_1.BadRequestException('密码必须包含大写字母');
    }
    if (!/[a-z]/.test(password)) {
        throw new common_1.BadRequestException('密码必须包含小写字母');
    }
    if (!/[0-9]/.test(password)) {
        throw new common_1.BadRequestException('密码必须包含数字');
    }
}
let CustomerService = class CustomerService {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async findByUsername(username) {
        return this.customerRepository.findOne({ where: { username, deletedAt: (0, typeorm_2.IsNull)() } });
    }
    async findById(id) {
        return this.customerRepository.findOne({ where: { id, deletedAt: (0, typeorm_2.IsNull)() } });
    }
    async create(data) {
        if (!data.username || !data.password || !data.companyName ||
            !data.address || !data.contactPerson || !data.phone) {
            throw new common_1.BadRequestException('用户名、密码、公司名称、联系人、电话、送货地址为必填项');
        }
        validatePasswordStrength(data.password);
        const existing = await this.findByUsername(data.username);
        if (existing) {
            throw new common_1.ConflictException('用户名已存在');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const customer = this.customerRepository.create({
            ...data,
            passwordHash,
            vipDiscount: data.vipDiscount ?? 0,
        });
        return this.customerRepository.save(customer);
    }
    async findAll(filters) {
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const [data, total] = await this.customerRepository.findAndCount({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { createdAt: 'DESC' },
            skip,
            take: pageSize,
        });
        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async update(id, data) {
        if (data.vipDiscount !== undefined && (data.vipDiscount < 0 || data.vipDiscount > 100)) {
            throw new common_1.BadRequestException('VIP折扣必须在0-100之间');
        }
        const customer = await this.findById(id);
        if (!customer) {
            throw new common_1.NotFoundException('客户不存在');
        }
        await this.customerRepository.update(id, data);
        return customer;
    }
    async delete(id) {
        await this.customerRepository.delete(id);
    }
    async updatePassword(id, newPassword) {
        validatePasswordStrength(newPassword);
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.customerRepository.update(id, { passwordHash });
    }
    async searchByCompanyName(keyword) {
        return this.customerRepository
            .createQueryBuilder('customer')
            .where('customer.company_name LIKE :keyword', { keyword: `%${keyword}%` })
            .andWhere('customer.deleted_at IS NULL')
            .getMany();
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerService);
//# sourceMappingURL=customer.service.js.map
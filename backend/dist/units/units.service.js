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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unit_entity_1 = require("./entities/unit.entity");
let UnitsService = class UnitsService {
    constructor(unitRepository) {
        this.unitRepository = unitRepository;
    }
    async findAll() {
        return this.unitRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
    }
    async findById(id) {
        return this.unitRepository.findOne({ where: { id } });
    }
    async create(data) {
        const unit = this.unitRepository.create(data);
        return this.unitRepository.save(unit);
    }
    async update(id, data) {
        await this.unitRepository.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.unitRepository.delete(id);
    }
    async initDefaultUnits() {
        const defaultUnits = [
            '个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack',
            'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'
        ];
        const existing = await this.findAll();
        if (existing.length === 0) {
            for (let i = 0; i < defaultUnits.length; i++) {
                await this.create({ name: defaultUnits[i], sortOrder: i });
            }
        }
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unit_entity_1.Unit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UnitsService);
//# sourceMappingURL=units.service.js.map
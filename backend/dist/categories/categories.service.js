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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const category_dto_1 = require("./dto/category.dto");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async findAll() {
        const categories = await this.categoryRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
        return categories.map(c => new category_dto_1.CategoryResponseDto({
            id: c.id,
            nameZh: c.nameZh,
            nameJa: c.nameJa,
            nameEn: c.nameEn,
            sortOrder: c.sortOrder,
            isActive: c.isActive,
            createdAt: c.createdAt,
        }));
    }
    async findById(id) {
        return this.categoryRepository.findOne({ where: { id } });
    }
    async create(data) {
        if (!data.nameZh || !data.nameJa || !data.nameEn) {
            throw new common_1.BadRequestException('分类名称必须同时提供中文、日语、英语三种语言');
        }
        const category = this.categoryRepository.create({
            name: data.nameZh,
            nameZh: data.nameZh,
            nameJa: data.nameJa,
            nameEn: data.nameEn,
            sortOrder: data.sortOrder || 0,
            isSystem: false,
        });
        const saved = await this.categoryRepository.save(category);
        return new category_dto_1.CategoryResponseDto({
            id: saved.id,
            nameZh: saved.nameZh,
            nameJa: saved.nameJa,
            nameEn: saved.nameEn,
            sortOrder: saved.sortOrder,
            isActive: saved.isActive,
            createdAt: saved.createdAt,
        });
    }
    async update(id, data) {
        const category = await this.findById(id);
        if (!category) {
            throw new common_1.BadRequestException('分类不存在');
        }
        if (category.isSystem) {
            throw new common_1.BadRequestException('系统内置分类不可修改');
        }
        await this.categoryRepository.update(id, data);
        const updated = await this.findById(id);
        if (!updated) {
            throw new common_1.BadRequestException('分类更新失败');
        }
        return new category_dto_1.CategoryResponseDto({
            id: updated.id,
            nameZh: updated.nameZh,
            nameJa: updated.nameJa,
            nameEn: updated.nameEn,
            sortOrder: updated.sortOrder,
            isActive: updated.isActive,
            createdAt: updated.createdAt,
        });
    }
    async delete(id) {
        const category = await this.findById(id);
        if (!category) {
            throw new common_1.BadRequestException('分类不存在');
        }
        if (category.isSystem) {
            throw new common_1.BadRequestException('系统内置分类不可删除');
        }
        await this.categoryRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map
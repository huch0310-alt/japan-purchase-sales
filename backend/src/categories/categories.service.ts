import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryResponseDto } from './dto/category.dto';

/**
 * 分类服务
 * 支持三语：中文、日语、英语
 * 内置分类不可删除
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
    return categories.map(c => new CategoryResponseDto({
      id: c.id,
      nameZh: c.nameZh,
      nameJa: c.nameJa,
      nameEn: c.nameEn,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      createdAt: c.createdAt,
    }));
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  /**
   * 创建分类
   * @param data 必须同时提供三语名称
   */
  async create(data: {
    nameZh: string;
    nameJa: string;
    nameEn: string;
    sortOrder?: number;
  }): Promise<CategoryResponseDto> {
    if (!data.nameZh || !data.nameJa || !data.nameEn) {
      throw new BadRequestException('分类名称必须同时提供中文、日语、英语三种语言');
    }

    const category = this.categoryRepository.create({
      name: data.nameZh, // 使用中文名称作为默认名称
      nameZh: data.nameZh,
      nameJa: data.nameJa,
      nameEn: data.nameEn,
      sortOrder: data.sortOrder || 0,
      isSystem: false,
    });
    const saved = await this.categoryRepository.save(category);
    return new CategoryResponseDto({
      id: saved.id,
      nameZh: saved.nameZh,
      nameJa: saved.nameJa,
      nameEn: saved.nameEn,
      sortOrder: saved.sortOrder,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
    });
  }

  async update(id: string, data: {
    nameZh?: string;
    nameJa?: string;
    nameEn?: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CategoryResponseDto> {
    const category = await this.findById(id);
    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    // 内置分类不可修改
    if (category.isSystem) {
      throw new BadRequestException('系统内置分类不可修改');
    }

    await this.categoryRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new BadRequestException('分类更新失败');
    }
    return new CategoryResponseDto({
      id: updated.id,
      nameZh: updated.nameZh,
      nameJa: updated.nameJa,
      nameEn: updated.nameEn,
      sortOrder: updated.sortOrder,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    });
  }

  /**
   * 删除分类
   * 内置分类不可删除
   */
  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    if (category.isSystem) {
      throw new BadRequestException('系统内置分类不可删除');
    }

    await this.categoryRepository.delete(id);
  }
}

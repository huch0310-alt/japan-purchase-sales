import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

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

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
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
  }): Promise<Category> {
    if (!data.nameZh || !data.nameJa || !data.nameEn) {
      throw new BadRequestException('分类名称必须同时提供中文、日语、英语三种语言');
    }

    const category = this.categoryRepository.create({
      nameZh: data.nameZh,
      nameJa: data.nameJa,
      nameEn: data.nameEn,
      sortOrder: data.sortOrder || 0,
      isSystem: false,
    });
    return this.categoryRepository.save(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.findById(id);
    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    // 内置分类不可修改
    if (category.isSystem) {
      throw new BadRequestException('系统内置分类不可修改');
    }

    await this.categoryRepository.update(id, data);
    return this.findById(id);
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

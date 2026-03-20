import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

/**
 * 分类服务
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

  async create(data: { name: string; sortOrder?: number }): Promise<Category> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}

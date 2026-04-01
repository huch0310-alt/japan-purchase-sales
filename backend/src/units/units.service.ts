import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

/**
 * 单位服务
 */
@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async findAll(): Promise<Unit[]> {
    return this.unitRepository.find({ order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Unit | null> {
    return this.unitRepository.findOne({ where: { id } });
  }

  async create(data: { name: string; sortOrder?: number }): Promise<Unit> {
    const unit = this.unitRepository.create(data);
    return this.unitRepository.save(unit);
  }

  async update(id: string, data: Partial<Unit>): Promise<Unit> {
    const unit = await this.findById(id);
    if (!unit) {
      throw new NotFoundException('单位不存在');
    }
    await this.unitRepository.update(id, data);
    return unit;
  }

  async delete(id: string): Promise<void> {
    await this.unitRepository.delete(id);
  }

  /**
   * 初始化默认单位
   */
  async initDefaultUnits(): Promise<void> {
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
}

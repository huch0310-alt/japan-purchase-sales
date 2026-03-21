import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Staff } from './entities/staff.entity';

/**
 * 员工服务
 * 处理员工相关的数据库操作
 */
@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  /**
   * 根据用户名查找员工
   */
  async findByUsername(username: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { username } });
  }

  /**
   * 根据ID查找员工
   */
  async findById(id: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { id } });
  }

  /**
   * 创建新员工
   */
  async create(data: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }): Promise<Staff> {
    const existing = await this.findByUsername(data.username);
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const staff = this.staffRepository.create({
      ...data,
      passwordHash,
    });
    return this.staffRepository.save(staff);
  }

  /**
   * 查询所有员工
   */
  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({
      order: { createdAt: 'DESC' },
      loadRelationIds: false, // 不加载关联ID，避免UUID错误
    });
  }

  /**
   * 更新员工信息
   */
  async update(id: string, data: Partial<Staff>): Promise<Staff> {
    await this.staffRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * 删除员工
   */
  async delete(id: string): Promise<void> {
    await this.staffRepository.delete(id);
  }

  /**
   * 修改密码
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.staffRepository.update(id, { passwordHash });
  }
}

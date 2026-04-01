import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Staff } from './entities/staff.entity';

/**
 * 验证密码强度
 * 要求：最少8位，包含大小写字母和数字
 */
function validatePasswordStrength(password: string): void {
  if (!password || password.length < 8) {
    throw new BadRequestException('密码长度不能少于8位');
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequestException('密码必须包含大写字母');
  }
  if (!/[a-z]/.test(password)) {
    throw new BadRequestException('密码必须包含小写字母');
  }
  if (!/[0-9]/.test(password)) {
    throw new BadRequestException('密码必须包含数字');
  }
}

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
    return this.staffRepository.findOne({ where: { username, deletedAt: IsNull() } });
  }

  /**
   * 根据ID查找员工
   */
  async findById(id: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { id, deletedAt: IsNull() } });
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
    // 验证密码强度
    validatePasswordStrength(data.password);

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
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      loadRelationIds: false, // 不加载关联ID，避免UUID错误
    });
  }

  /**
   * 更新员工信息
   */
  async update(id: string, data: Partial<Staff>): Promise<Staff> {
    const staff = await this.findById(id);
    if (!staff) {
      throw new NotFoundException('员工不存在');
    }
    await this.staffRepository.update(id, data);
    return staff;
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
    // 验证密码强度
    validatePasswordStrength(newPassword);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.staffRepository.update(id, { passwordHash });
  }
}

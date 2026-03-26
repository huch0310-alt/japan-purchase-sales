import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Customer } from './entities/customer.entity';

/**
 * 客户服务
 * 处理客户相关的数据库操作
 *
 * 必填字段: username, password, companyName, address, contactPerson, phone
 * 选填字段: vipDiscount (默认0, 0=无折扣, 10=9折)
 */
@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * 根据用户名查找客户
   */
  async findByUsername(username: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { username } });
  }

  /**
   * 根据ID查找客户
   */
  async findById(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }

  /**
   * 创建新客户
   * 必填: username, password, companyName, address, contactPerson, phone
   */
  async create(data: {
    username: string;
    password: string;
    companyName: string;
    address: string;
    contactPerson: string;
    phone: string;
    vipDiscount?: number;
    invoiceName?: string;
    invoiceAddress?: string;
    invoicePhone?: string;
    invoiceBank?: string;
  }): Promise<Customer> {
    // 验证必填字段
    if (!data.username || !data.password || !data.companyName ||
        !data.address || !data.contactPerson || !data.phone) {
      throw new BadRequestException('用户名、密码、公司名称、联系人、电话、送货地址为必填项');
    }

    const existing = await this.findByUsername(data.username);
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const customer = this.customerRepository.create({
      ...data,
      passwordHash,
      vipDiscount: data.vipDiscount ?? 0, // 默认0，不打折
    });
    return this.customerRepository.save(customer);
  }

  /**
   * 查询所有客户
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据ID更新客户信息
   */
  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.customerRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * 删除客户
   */
  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  /**
   * 修改密码
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.customerRepository.update(id, { passwordHash });
  }

  /**
   * 根据公司名称搜索客户
   */
  async searchByCompanyName(keyword: string): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.company_name LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }
}

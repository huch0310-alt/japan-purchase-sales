import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CustomerService } from '../../../src/users/customer.service';
import { Customer } from '../../../src/users/entities/customer.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { createTestCustomer } from '../../fixtures';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: jest.Mocked<Repository<Customer>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      findAndCount: jest.fn(),
    };

    // Reset and setup bcrypt mocks
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get(getRepositoryToken(Customer));
  });

  describe('findByUsername', () => {
    it('应该根据用户名查找客户', async () => {
      const testCustomer = createTestCustomer();
      repository.findOne.mockResolvedValue(testCustomer);

      const result = await service.findByUsername('test-customer');

      expect(result).toEqual(testCustomer);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { username: 'test-customer', deletedAt: IsNull() } });
    });

    it('应该返回null当客户不存在', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('应该根据ID查找客户', async () => {
      const testCustomer = createTestCustomer();
      repository.findOne.mockResolvedValue(testCustomer);

      const result = await service.findById(testCustomer.id);

      expect(result).toEqual(testCustomer);
    });
  });

  describe('create', () => {
    it('应该创建新客户', async () => {
      const newCustomer = {
        username: 'new-customer',
        password: 'Password123',
        companyName: '新公司',
        address: '地址',
        contactPerson: '联系人',
        phone: '03-1234-5678',
        vipDiscount: 95,
      };
      const createdCustomer = createTestCustomer({ ...newCustomer, passwordHash: 'hashed' });

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdCustomer as any);
      repository.save.mockResolvedValue(createdCustomer);

      const result = await service.create(newCustomer);

      expect(result).toEqual(createdCustomer);
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('应该抛出异常当用户名已存在', async () => {
      const existingCustomer = createTestCustomer();
      repository.findOne.mockResolvedValue(existingCustomer);

      await expect(
        service.create({
          username: 'existing',
          password: 'Password123',
          companyName: 'Company',
          address: '地址',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('应该抛出异常当缺少必填字段', async () => {
      await expect(
        service.create({
          username: 'test',
          password: 'Password123',
          companyName: 'Company',
          address: '',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('应该抛出异常当密码长度不足8位', async () => {
      await expect(
        service.create({
          username: 'test',
          password: 'Pass1',
          companyName: 'Company',
          address: '地址',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow('密码长度不能少于8位');
    });

    it('应该抛出异常当密码不包含大写字母', async () => {
      await expect(
        service.create({
          username: 'test',
          password: 'password123',
          companyName: 'Company',
          address: '地址',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow('密码必须包含大写字母');
    });

    it('应该抛出异常当密码不包含小写字母', async () => {
      await expect(
        service.create({
          username: 'test',
          password: 'PASSWORD123',
          companyName: 'Company',
          address: '地址',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow('密码必须包含小写字母');
    });

    it('应该抛出异常当密码不包含数字', async () => {
      await expect(
        service.create({
          username: 'test',
          password: 'Password',
          companyName: 'Company',
          address: '地址',
          contactPerson: '联系人',
          phone: '03-1234-5678',
        }),
      ).rejects.toThrow('密码必须包含数字');
    });

    it('应该使用默认VIP折扣值0', async () => {
      const newCustomer = {
        username: 'new-customer',
        password: 'Password123',
        companyName: '新公司',
        address: '地址',
        contactPerson: '联系人',
        phone: '03-1234-5678',
      };
      const createdCustomer = createTestCustomer({ ...newCustomer, passwordHash: 'hashed', vipDiscount: 0 });

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdCustomer as any);
      repository.save.mockResolvedValue(createdCustomer);

      const result = await service.create(newCustomer);

      expect(result.vipDiscount).toBe(0);
    });
  });

  describe('findAll', () => {
    it('应该返回所有客户', async () => {
      const customerList = [createTestCustomer(), createTestCustomer({ id: 'different-id' })];
      repository.findAndCount.mockResolvedValue([customerList, 2]);

      const result = await service.findAll();

      expect(result.data).toEqual(customerList);
      expect(result.total).toBe(2);
    });

    it('应该支持分页', async () => {
      const customerList = [createTestCustomer()];
      repository.findAndCount.mockResolvedValue([customerList, 25]);

      const result = await service.findAll({ page: 2, pageSize: 10 });

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('应该更新客户信息', async () => {
      const testCustomer = createTestCustomer();
      const updateData = { companyName: '新公司名称' };

      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...testCustomer, ...updateData });

      const result = await service.update(testCustomer.id, updateData);

      expect(result.companyName).toBe('新公司名称');
    });

    it('应该抛出异常当客户不存在', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { companyName: '新公司' })).rejects.toThrow(NotFoundException);
    });

    it('应该抛出异常当VIP折扣小于0', async () => {
      const testCustomer = createTestCustomer();
      repository.findOne.mockResolvedValue(testCustomer);

      await expect(service.update(testCustomer.id, { vipDiscount: -1 })).rejects.toThrow('VIP折扣必须在0-100之间');
    });

    it('应该抛出异常当VIP折扣大于100', async () => {
      const testCustomer = createTestCustomer();
      repository.findOne.mockResolvedValue(testCustomer);

      await expect(service.update(testCustomer.id, { vipDiscount: 101 })).rejects.toThrow('VIP折扣必须在0-100之间');
    });

    it('应该接受有效的VIP折扣值', async () => {
      const testCustomer = createTestCustomer();
      const updateData = { vipDiscount: 10 };

      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...testCustomer, ...updateData });

      const result = await service.update(testCustomer.id, updateData);

      expect(result.vipDiscount).toBe(10);
    });
  });

  describe('updatePassword', () => {
    it('应该更新客户密码', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword('test-id', 'NewPassword123');

      expect(mockedBcrypt.hash).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });

    it('应该抛出异常当密码强度不符合要求', async () => {
      await expect(service.updatePassword('test-id', 'weak')).rejects.toThrow('密码长度不能少于8位');
    });
  });

  describe('delete', () => {
    it('应该删除客户', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.delete('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('searchByCompanyName', () => {
    it('应该根据公司名称搜索客户', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([createTestCustomer()]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.searchByCompanyName('テスト');

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});

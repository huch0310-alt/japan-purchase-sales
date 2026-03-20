import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerService } from '../../../src/users/customer.service';
import { Customer } from '../../../src/users/entities/customer.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createTestCustomer } from '../../fixtures';

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
    };

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
      expect(repository.findOne).toHaveBeenCalledWith({ where: { username: 'test-customer' } });
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
        password: 'password123',
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
          password: 'password',
          companyName: 'Company',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('应该返回所有客户', async () => {
      const customerList = [createTestCustomer(), createTestCustomer({ id: 'different-id' })];
      repository.find.mockResolvedValue(customerList);

      const result = await service.findAll();

      expect(result).toEqual(customerList);
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
  });

  describe('updatePassword', () => {
    it('应该更新客户密码', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword('test-id', 'newpassword');

      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });

  describe('searchByCompanyName', () => {
    it('应该根据公司名称搜索客户', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([createTestCustomer()]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.searchByCompanyName('テスト');

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});

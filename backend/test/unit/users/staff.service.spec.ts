import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffService } from '../../../src/users/staff.service';
import { Staff } from '../../../src/users/entities/staff.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createTestStaff } from '../../fixtures';

describe('StaffService', () => {
  let service: StaffService;
  let repository: jest.Mocked<Repository<Staff>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: getRepositoryToken(Staff),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    repository = module.get(getRepositoryToken(Staff));
  });

  describe('findByUsername', () => {
    it('应该根据用户名查找员工', async () => {
      const testStaff = createTestStaff();
      repository.findOne.mockResolvedValue(testStaff);

      const result = await service.findByUsername('test-staff');

      expect(result).toEqual(testStaff);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { username: 'test-staff' } });
    });

    it('应该返回null当员工不存在', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('应该根据ID查找员工', async () => {
      const testStaff = createTestStaff();
      repository.findOne.mockResolvedValue(testStaff);

      const result = await service.findById(testStaff.id);

      expect(result).toEqual(testStaff);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: testStaff.id } });
    });
  });

  describe('create', () => {
    it('应该创建新员工', async () => {
      const newStaff = {
        username: 'new-staff',
        password: 'password123',
        name: '新员工',
        phone: '090-1234-5678',
        role: 'sales',
      };
      const createdStaff = createTestStaff({ ...newStaff, passwordHash: 'hashed-password' });

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdStaff as any);
      repository.save.mockResolvedValue(createdStaff);

      const result = await service.create(newStaff);

      expect(result).toEqual(createdStaff);
      expect(repository.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('应该抛出异常当用户名已存在', async () => {
      const existingStaff = createTestStaff();
      repository.findOne.mockResolvedValue(existingStaff);

      await expect(
        service.create({
          username: 'existing',
          password: 'password',
          name: 'Test',
          role: 'sales',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('应该返回所有员工', async () => {
      const staffList = [createTestStaff(), createTestStaff({ id: 'different-id' })];
      repository.find.mockResolvedValue(staffList);

      const result = await service.findAll();

      expect(result).toEqual(staffList);
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });
  });

  describe('update', () => {
    it('应该更新员工信息', async () => {
      const testStaff = createTestStaff();
      const updateData = { name: '新名称' };

      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({ ...testStaff, ...updateData });

      const result = await service.update(testStaff.id, updateData);

      expect(result.name).toBe('新名称');
    });
  });

  describe('delete', () => {
    it('应该删除员工', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.delete('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('updatePassword', () => {
    it('应该更新员工密码', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword('test-id', 'newpassword');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });
  });
});

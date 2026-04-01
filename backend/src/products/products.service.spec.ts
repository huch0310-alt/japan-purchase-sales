import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { EventService } from '../common/services/event.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock dependencies
const mockProductRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockEventService = () => ({
  notifyProductApproved: jest.fn(),
  notifyProductRejected: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: ReturnType<typeof mockProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useFactory: mockProductRepository },
        { provide: EventService, useValue: mockEventService() },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('应该根据ID返回商品', async () => {
      const mockProduct = {
        id: 'product-1',
        name: '测试商品',
        status: 'active',
        quantity: 100,
      };

      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findById('product-1');

      expect(result).toEqual(mockProduct);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1', deletedAt: expect.anything() },
        relations: ['category'],
      });
    });

    it('商品不存在时应该返回null', async () => {
      productRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findActive', () => {
    it('应该返回已上架的商品列表', async () => {
      const mockProducts = [
        { id: 'product-1', name: '商品1', status: 'active' },
        { id: 'product-2', name: '商品2', status: 'active' },
      ];

      productRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findActive();

      expect(result).toEqual(mockProducts);
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: 'active', deletedAt: expect.anything() },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('approve', () => {
    it('应该审核通过待审核状态的商品', async () => {
      const mockProduct = {
        id: 'product-1',
        name: '测试商品',
        status: 'pending',
      };

      const updatedProduct = {
        ...mockProduct,
        status: 'approved',
        salePrice: 100,
      };

      productRepository.findOne
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(updatedProduct);
      productRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.approve('product-1', 100);

      expect(productRepository.update).toHaveBeenCalledWith('product-1', {
        status: 'approved',
        salePrice: 100,
      });
    });

    it('非待审核状态应该抛出异常', async () => {
      const mockProduct = {
        id: 'product-1',
        name: '测试商品',
        status: 'active', // 非 pending
      };

      productRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.approve('product-1', 100)).rejects.toThrow(BadRequestException);
    });
  });

  describe('activate', () => {
    it('应该上架已审核状态的商品', async () => {
      const mockProduct = {
        id: 'product-1',
        name: '测试商品',
        status: 'approved',
      };

      const activatedProduct = {
        ...mockProduct,
        status: 'active',
      };

      productRepository.findOne
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(activatedProduct);
      productRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.activate('product-1');

      expect(productRepository.update).toHaveBeenCalledWith('product-1', { status: 'active' });
      expect(result.status).toBe('active');
    });

    it('非已审核状态应该抛出异常', async () => {
      const mockProduct = {
        id: 'product-1',
        status: 'pending', // 非 approved
      };

      productRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.activate('product-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivate', () => {
    it('应该下架上架状态的商品', async () => {
      const mockProduct = {
        id: 'product-1',
        name: '测试商品',
        status: 'active',
      };

      const deactivatedProduct = {
        ...mockProduct,
        status: 'inactive',
      };

      productRepository.findOne
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(deactivatedProduct);
      productRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.deactivate('product-1');

      expect(productRepository.update).toHaveBeenCalledWith('product-1', { status: 'inactive' });
      expect(result.status).toBe('inactive');
    });

    it('非上架状态应该抛出异常', async () => {
      const mockProduct = {
        id: 'product-1',
        status: 'pending', // 非 active
      };

      productRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.deactivate('product-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('应该软删除商品', async () => {
      productRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('product-1');

      expect(productRepository.delete).toHaveBeenCalledWith('product-1');
    });
  });
});

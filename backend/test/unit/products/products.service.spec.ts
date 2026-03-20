import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from '../../../src/products/products.service';
import { Product } from '../../../src/products/entities/product.entity';
import { createTestProduct, createTestPendingProduct, createTestCategory } from '../../fixtures';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: any;

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
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  describe('create', () => {
    it('应该创建新商品', async () => {
      const newProduct = { name: '新商品', quantity: 100, unit: '个', purchasePrice: 100, salePrice: 150 };
      const createdProduct = createTestProduct(newProduct);

      repository.create.mockReturnValue(createdProduct);
      repository.save.mockResolvedValue(createdProduct);

      const result = await service.create(newProduct as any);

      expect(result).toEqual(createdProduct);
    });
  });

  describe('findAll', () => {
    it('应该返回所有商品', async () => {
      const products = [createTestProduct(), createTestProduct({ id: 'different-id' })];
      repository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
    });

    it('应该返回已上架商品', async () => {
      const products = [createTestProduct({ status: 'active' })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(products),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findActive();

      expect(result).toEqual(products);
    });

    it('应该返回待审核商品', async () => {
      const products = [createTestPendingProduct()];
      repository.find.mockResolvedValue(products);

      const result = await service.findPending();

      expect(result).toEqual(products);
    });
  });

  describe('update', () => {
    it('应该更新商品信息', async () => {
      const product = createTestProduct();
      const updateData = { salePrice: 200 };

      repository.update.mockResolvedValue({ affected: 1 });
      repository.findOne.mockResolvedValue({ ...product, ...updateData });

      const result = await service.update(product.id, updateData);

      expect(result.salePrice).toBe(200);
    });
  });

  describe('approve', () => {
    it('应该审核通过商品', async () => {
      const product = createTestPendingProduct();
      repository.findOne.mockResolvedValue(product);
      repository.save.mockResolvedValue({ ...product, status: 'approved' });

      const result = await service.approve(product.id);

      expect(result.status).toBe('approved');
    });
  });

  describe('activate', () => {
    it('应该上架商品', async () => {
      const product = createTestProduct({ status: 'approved' });
      repository.findOne.mockResolvedValue(product);
      repository.save.mockResolvedValue({ ...product, status: 'active' });

      const result = await service.activate(product.id);

      expect(result.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('应该删除商品', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });
  });
});

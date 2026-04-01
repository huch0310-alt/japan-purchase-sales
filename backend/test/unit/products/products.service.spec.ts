import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from '../../../src/products/products.service';
import { Product } from '../../../src/products/entities/product.entity';
import { EventService } from '../../../src/common/services/event.service';
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

    const mockEventService = {
      notifyProductCreated: jest.fn(),
      notifyProductStatusChanged: jest.fn(),
      notifyProductApproved: jest.fn(),
      notifyProductRejected: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
        { provide: EventService, useValue: mockEventService },
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
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, 2]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(result.data).toEqual(products);
      expect(result.total).toBe(2);
    });

    it('应该返回已上架商品', async () => {
      const products = [createTestProduct({ status: 'active' })];
      repository.find.mockResolvedValue(products);

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
      const approvedProduct = { ...product, status: 'approved', salePrice: 1000 };
      
      repository.findOne.mockResolvedValueOnce(product);
      repository.update.mockResolvedValue(undefined);
      repository.findOne.mockResolvedValueOnce(approvedProduct);

      const result = await service.approve(product.id, 1000);

      expect(result.status).toBe('approved');
      expect(result.salePrice).toBe(1000);
    });
  });

  describe('activate', () => {
    it('应该上架商品', async () => {
      const product = createTestProduct({ status: 'approved' });
      const activatedProduct = { ...product, status: 'active' };
      
      repository.findOne.mockResolvedValueOnce(product);
      repository.update.mockResolvedValue(undefined);
      repository.findOne.mockResolvedValueOnce(activatedProduct);

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

  describe('findById', () => {
    it('应该根据ID查找商品', async () => {
      const product = createTestProduct();
      repository.findOne.mockResolvedValue(product);

      const result = await service.findById(product.id);

      expect(result).toEqual(product);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: product.id, deletedAt: expect.anything() },
        relations: ['category']
      });
    });

    it('应该商品不存在时返回null', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('应该批量查找商品', async () => {
      const products = [createTestProduct(), createTestProduct({ id: 'different-id' })];
      repository.find.mockResolvedValue(products);

      const result = await service.findByIds([products[0].id, products[1].id]);

      expect(result).toEqual(products);
    });

    it('应该传入空数组时返回空数组', async () => {
      const result = await service.findByIds([]);

      expect(result).toEqual([]);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('findAll with filters', () => {
    it('应该支持分类筛选', async () => {
      const products = [createTestProduct({ categoryId: 'cat-1' })];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, 1]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ categoryId: 'cat-1' });

      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
    });

    it('应该支持关键词搜索', async () => {
      const products = [createTestProduct({ name: '测试商品' })];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, 1]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ keyword: '测试' });

      expect(result.data).toEqual(products);
    });

    it('应该支持分页', async () => {
      const products = [createTestProduct()];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, 25]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 2, pageSize: 10 });

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('reject', () => {
    it('应该拒绝待审核商品', async () => {
      const product = createTestPendingProduct();
      repository.findOne.mockResolvedValue(product);
      repository.update.mockResolvedValue({ affected: 1 });
      const rejectedProduct = { ...product, status: 'rejected' };
      repository.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(rejectedProduct);

      const result = await service.reject(product.id);

      expect(result.status).toBe('rejected');
    });

    it('应该拒绝不存在的商品时抛出异常', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.reject('non-existent')).rejects.toThrow('商品不存在');
    });

    it('应该拒绝非待审核商品时抛出异常', async () => {
      const product = createTestProduct({ status: 'active' });
      repository.findOne.mockResolvedValue(product);

      await expect(service.reject(product.id)).rejects.toThrow('商品状态不是待审核，无法拒绝');
    });
  });

  describe('approve', () => {
    it('应该审核通过待审核商品', async () => {
      const product = createTestPendingProduct();
      repository.findOne.mockResolvedValue(product);
      repository.update.mockResolvedValue({ affected: 1 });
      const approvedProduct = { ...product, status: 'approved', salePrice: 200 };
      repository.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(approvedProduct);

      const result = await service.approve(product.id, 200);

      expect(result.status).toBe('approved');
      expect(result.salePrice).toBe(200);
    });

    it('应该审核不存在的商品时抛出异常', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.approve('non-existent', 100)).rejects.toThrow('商品不存在');
    });

    it('应该审核非待审核商品时抛出异常', async () => {
      const product = createTestProduct({ status: 'active' });
      repository.findOne.mockResolvedValue(product);

      await expect(service.approve(product.id, 100)).rejects.toThrow('商品状态不是待审核，无法审核');
    });
  });

  describe('activate', () => {
    it('应该上架已审核商品', async () => {
      const product = createTestProduct({ status: 'approved' });
      repository.findOne.mockResolvedValue(product);
      repository.update.mockResolvedValue({ affected: 1 });
      const activatedProduct = { ...product, status: 'active' };
      repository.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(activatedProduct);

      const result = await service.activate(product.id);

      expect(result.status).toBe('active');
    });

    it('应该上架不存在的商品时抛出异常', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.activate('non-existent')).rejects.toThrow('商品不存在');
    });

    it('应该上架非已审核商品时抛出异常', async () => {
      const product = createTestProduct({ status: 'pending' });
      repository.findOne.mockResolvedValue(product);

      await expect(service.activate(product.id)).rejects.toThrow('商品状态不是已审核，无法上架');
    });
  });

  describe('deactivate', () => {
    it('应该下架上架商品', async () => {
      const product = createTestProduct({ status: 'active' });
      repository.findOne.mockResolvedValue(product);
      repository.update.mockResolvedValue({ affected: 1 });
      const deactivatedProduct = { ...product, status: 'inactive' };
      repository.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(deactivatedProduct);

      const result = await service.deactivate(product.id);

      expect(result.status).toBe('inactive');
    });

    it('应该下架不存在的商品时抛出异常', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.deactivate('non-existent')).rejects.toThrow('商品不存在');
    });

    it('应该下架非上架商品时抛出异常', async () => {
      const product = createTestProduct({ status: 'pending' });
      repository.findOne.mockResolvedValue(product);

      await expect(service.deactivate(product.id)).rejects.toThrow('商品状态不是上架，无法下架');
    });
  });

  describe('batchDeactivate', () => {
    it('应该批量下架商品', async () => {
      repository.update.mockResolvedValue({ affected: 3 });

      await service.batchDeactivate(['id1', 'id2', 'id3']);

      expect(repository.update).toHaveBeenCalledWith(['id1', 'id2', 'id3'], { status: 'inactive' });
    });
  });

  describe('update', () => {
    it('应该更新不存在的商品时抛出异常', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: '新名称' })).rejects.toThrow('商品不存在');
    });
  });

  describe('findHotProducts', () => {
    it('应该返回热销商品', async () => {
      const products = [
        createTestProduct({ salesCount: 100 }),
        createTestProduct({ salesCount: 80, id: 'id-2' }),
        createTestProduct({ salesCount: 60, id: 'id-3' }),
      ];
      repository.find.mockResolvedValue(products);

      const result = await service.findHotProducts(10);

      expect(result).toEqual(products);
      expect(repository.find).toHaveBeenCalledWith({
        where: { status: 'active', deletedAt: expect.anything() },
        relations: ['category'],
        order: { salesCount: 'DESC', createdAt: 'DESC' },
        take: 10,
      });
    });

    it('应该支持限制返回数量', async () => {
      const products = [createTestProduct()];
      repository.find.mockResolvedValue(products);

      await service.findHotProducts(5);

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });
});

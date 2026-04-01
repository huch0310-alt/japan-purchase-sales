import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from '../../../src/orders/orders.service';
import { Order } from '../../../src/orders/entities/order.entity';
import { OrderItem } from '../../../src/orders/entities/order-item.entity';
import { ProductsService } from '../../../src/products/products.service';
import { SettingService } from '../../../src/settings/settings.service';
import { EventService } from '../../../src/common/services/event.service';
import { CustomerService } from '../../../src/users/customer.service';
import { InventoryService } from '../../../src/inventory/inventory.service';
import { LogsService } from '../../../src/logs/logs.service';
import { createTestOrder, createTestCustomer, createTestProduct } from '../../fixtures';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: any;
  let productsService: ProductsService;
  let mockQueryRunner: any;
  let mockManager: any;

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager,
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const mockOrderRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn(),
      },
    };

    const mockItemRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockProductsService = {
      findById: jest.fn((id: string) => Promise.resolve(null as any)),
      findByIds: jest.fn((ids: string[]) => Promise.resolve([] as any)),
    };

    const mockSettingService = {
      getValue: jest.fn().mockResolvedValue('10'),
    };

    const mockEventService = {
      notifyOrderCreated: jest.fn(),
      notifyOrderStatusChanged: jest.fn(),
    };

    const mockInventoryService = {
      createLog: jest.fn(),
    };

    const mockLogsService = {
      recordOperation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: mockItemRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: SettingService, useValue: mockSettingService },
        { provide: EventService, useValue: mockEventService },
        { provide: CustomerService, useValue: { findById: jest.fn() } },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: LogsService, useValue: mockLogsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    it('应该创建订单并计算金额', async () => {
      const customer = createTestCustomer({ vipDiscount: 95 });
      const product = createTestProduct({ salePrice: 1000, status: 'active', quantity: 100 });
      const createdOrder = createTestOrder({
        subtotal: 2000,
        discountAmount: 100,
        taxAmount: 190,
        totalAmount: 2090,
      });

      // Mock the findOne to return customer
      mockManager.findOne.mockResolvedValue(customer);
      // Mock product lookup - findByIds returns array of products
      (productsService.findByIds as jest.Mock).mockResolvedValue([product]);
      // Mock order save
      mockManager.create.mockReturnValue(createdOrder);
      mockManager.save.mockResolvedValue(createdOrder);
      // Mock findById after commit
      orderRepository.findOne.mockResolvedValue(createdOrder);

      const result = await service.create({
        customerId: customer.id,
        items: [{ productId: product.id, quantity: 2 }],
        deliveryAddress: '测试地址',
        contactPerson: '测试联系人',
        contactPhone: '090-1234-5678',
      });

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('应该验证商品是否上架', async () => {
      const customer = createTestCustomer({ vipDiscount: 100 });
      const inactiveProduct = createTestProduct({ salePrice: 1000, status: 'pending', quantity: 100 });

      mockManager.findOne.mockResolvedValue(customer);
      (productsService.findByIds as jest.Mock).mockResolvedValue([inactiveProduct]);

      await expect(
        service.create({
          customerId: customer.id,
          items: [{ productId: inactiveProduct.id, quantity: 1 }],
          deliveryAddress: '测试地址',
          contactPerson: '测试联系人',
          contactPhone: '090-1234-5678',
        })
      ).rejects.toThrow('商品未上架');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('应该验证库存是否充足', async () => {
      const customer = createTestCustomer({ vipDiscount: 100 });
      const product = createTestProduct({ salePrice: 1000, status: 'active', quantity: 1 });

      mockManager.findOne.mockResolvedValue(customer);
      (productsService.findByIds as jest.Mock).mockResolvedValue([product]);

      await expect(
        service.create({
          customerId: customer.id,
          items: [{ productId: product.id, quantity: 10 }],
          deliveryAddress: '测试地址',
          contactPerson: '测试联系人',
          contactPhone: '090-1234-5678',
        })
      ).rejects.toThrow('商品库存不足');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('应该验证客户不存在', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          customerId: 'non-existent-id',
          items: [{ productId: 'product-id', quantity: 1 }],
          deliveryAddress: '测试地址',
          contactPerson: '测试联系人',
          contactPhone: '090-1234-5678',
        })
      ).rejects.toThrow('客户不存在');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('应该返回所有订单', async () => {
      const orders = [createTestOrder(), createTestOrder({ id: 'different-id' })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 2]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock the second query for customers and items
      const mockSecondaryQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.manager.createQueryBuilder.mockReturnValue(mockSecondaryQueryBuilder);

      const result = await service.findAll();

      expect(result.total).toBe(2);
      expect(result.data.length).toBe(2);
    });
  });

  describe('confirm', () => {
    it('应该确认订单', async () => {
      const order = createTestOrder({ status: 'pending' });
      const confirmedOrder = { ...order, status: 'confirmed', confirmedAt: new Date() };
      
      orderRepository.findOne.mockResolvedValueOnce(order);
      orderRepository.update.mockResolvedValue(undefined);
      orderRepository.findOne.mockResolvedValueOnce(confirmedOrder);

      const result = await service.confirm(order.id);

      expect(result.status).toBe('confirmed');
      expect(result.confirmedAt).toBeDefined();
    });
  });

  describe('complete', () => {
    it('应该完成订单', async () => {
      const order = createTestOrder({ status: 'confirmed' });
      const completedOrder = { ...order, status: 'completed', completedAt: new Date() };
      
      mockManager.findOne.mockResolvedValue(order);
      mockManager.update.mockResolvedValue(undefined);
      orderRepository.findOne.mockResolvedValue(completedOrder);

      const result = await service.complete(order.id);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('应该取消订单', async () => {
      const order = createTestOrder({ status: 'pending', items: [] });
      const cancelledOrder = { ...order, status: 'cancelled', cancelledAt: new Date() };
      
      orderRepository.findOne.mockResolvedValueOnce(order);
      mockManager.update.mockResolvedValue(undefined);
      orderRepository.findOne.mockResolvedValueOnce(cancelledOrder);

      const result = await service.cancel(order.id);

      expect(result.status).toBe('cancelled');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('应该取消不存在的订单时抛出异常', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow('订单不存在');
    });

    it('应该取消非待确认订单时抛出异常', async () => {
      const order = createTestOrder({ status: 'confirmed' });
      orderRepository.findOne.mockResolvedValue(order);

      await expect(service.cancel(order.id)).rejects.toThrow('订单状态不是待确认，无法取消');
    });

    it('应该客户取消超过30分钟的订单时抛出异常', async () => {
      const order = createTestOrder({
        status: 'pending',
        createdAt: new Date(Date.now() - 31 * 60 * 1000) // 31分钟前
      });
      orderRepository.findOne.mockResolvedValue(order);

      await expect(service.cancel(order.id, 'customer-id', undefined, true)).rejects.toThrow('订单已超过30分钟，无法取消');
    });
  });

  describe('findById', () => {
    it('应该根据ID查找订单', async () => {
      const order = createTestOrder();
      orderRepository.findOne.mockResolvedValue(order);

      const result = await service.findById(order.id);

      expect(result).toEqual(order);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: order.id, deletedAt: expect.anything() },
        relations: ['customer', 'items', 'items.product', 'invoice']
      });
    });

    it('应该订单不存在时返回null', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByOrderNo', () => {
    it('应该根据订单号查找订单', async () => {
      const order = createTestOrder();
      orderRepository.findOne.mockResolvedValue(order);

      const result = await service.findByOrderNo(order.orderNo);

      expect(result).toEqual(order);
    });
  });

  describe('findByCustomer', () => {
    it('应该查询客户订单', async () => {
      const orders = [createTestOrder(), createTestOrder({ id: 'different-id' })];
      orderRepository.find.mockResolvedValue(orders);

      const result = await service.findByCustomer('customer-id');

      expect(result).toEqual(orders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'customer-id', deletedAt: expect.anything() },
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' }
      });
    });
  });

  describe('findAll with filters', () => {
    it('应该支持状态筛选', async () => {
      const orders = [createTestOrder({ status: 'pending' })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 1]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      // Mock manager.createQueryBuilder for customer and item queries
      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.findAll({ status: 'pending' });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('应该支持日期范围筛选', async () => {
      const orders = [createTestOrder()];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 1]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.findAll({ startDate, endDate });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('应该支持金额范围筛选', async () => {
      const orders = [createTestOrder()];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 1]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      const mockManagerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.manager.createQueryBuilder.mockReturnValue(mockManagerQueryBuilder);

      const result = await service.findAll({ minAmount: 1000, maxAmount: 5000 });

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('应该返回空结果当没有订单时', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('batchConfirm', () => {
    it('应该批量确认订单', async () => {
      const orders = [
        createTestOrder({ id: 'order-1', status: 'pending' }),
        createTestOrder({ id: 'order-2', status: 'pending' }),
      ];

      mockManager.findOne
        .mockResolvedValueOnce(orders[0])
        .mockResolvedValueOnce(orders[1]);
      mockManager.update.mockResolvedValue({ affected: 2 });

      await service.batchConfirm(['order-1', 'order-2']);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalledWith(
        Order,
        ['order-1', 'order-2'],
        { status: 'confirmed', confirmedAt: expect.any(Date) }
      );
    });

    it('应该在批量确认时订单不存在抛出异常', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.batchConfirm(['non-existent'])).rejects.toThrow('订单不存在');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('应该在批量确认非待确认订单时抛出异常', async () => {
      const order = createTestOrder({ status: 'confirmed' });
      mockManager.findOne.mockResolvedValue(order);

      await expect(service.batchConfirm([order.id])).rejects.toThrow('状态不是待确认，无法确认');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('应该确认不存在的订单时抛出异常', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.confirm('non-existent')).rejects.toThrow('订单不存在');
    });

    it('应该确认非待确认订单时抛出异常', async () => {
      const order = createTestOrder({ status: 'confirmed' });
      orderRepository.findOne.mockResolvedValue(order);

      await expect(service.confirm(order.id)).rejects.toThrow('订单状态不是待确认，无法确认');
    });
  });

  describe('complete', () => {
    it('应该完成不存在的订单时抛出异常', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.complete('non-existent')).rejects.toThrow('订单不存在');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('应该完成非已确认订单时抛出异常', async () => {
      const order = createTestOrder({ status: 'pending' });
      mockManager.findOne.mockResolvedValue(order);

      await expect(service.complete(order.id)).rejects.toThrow('订单状态不是已确认，无法完成');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findCompletedWithoutInvoice', () => {
    it('应该查找已完成但未生成发票的订单', async () => {
      const orders = [createTestOrder({ status: 'completed', invoiceId: undefined })];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findCompletedWithoutInvoice();

      expect(result).toEqual(orders);
    });

    it('应该支持按客户ID筛选', async () => {
      const orders = [createTestOrder({ status: 'completed', invoiceId: undefined })];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findCompletedWithoutInvoice('customer-id');

      expect(result).toEqual(orders);
    });
  });

  describe('getSalesReport', () => {
    it('应该获取销售报表数据', async () => {
      const orders = [
        createTestOrder({ status: 'completed', totalAmount: 1000 }),
        createTestOrder({ status: 'confirmed', totalAmount: 2000, id: 'order-2' }),
      ];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(orders),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await service.getSalesReport(startDate, endDate);

      expect(result.totalAmount).toBe(3000);
      expect(result.orderCount).toBe(2);
      expect(result.averageAmount).toBe(1500);
    });

    it('应该在没有订单时返回零值', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await service.getSalesReport(startDate, endDate);

      expect(result.totalAmount).toBe(0);
      expect(result.orderCount).toBe(0);
      expect(result.averageAmount).toBe(0);
    });
  });

  describe('updateInvoiceInfo', () => {
    it('应该更新订单的发票信息', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.updateInvoiceInfo(['order-1', 'order-2'], 'invoice-id');

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        invoiceId: 'invoice-id',
        invoicedAt: expect.any(Date)
      });
    });
  });

  describe('clearInvoiceInfo', () => {
    it('应该清除订单的发票信息', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      orderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.clearInvoiceInfo('invoice-id');

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        invoiceId: undefined,
        invoicedAt: undefined
      });
    });
  });
});

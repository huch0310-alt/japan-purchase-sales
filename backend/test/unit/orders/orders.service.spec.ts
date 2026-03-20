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
    };

    const mockItemRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockProductsService = {
      findById: jest.fn((id: string) => Promise.resolve(null as any)),
    };

    const mockSettingService = {
      getValue: jest.fn().mockResolvedValue('10'),
    };

    const mockEventService = {
      notifyOrderCreated: jest.fn(),
      notifyOrderStatusChanged: jest.fn(),
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
      // Mock product lookup
      (productsService.findById as jest.Mock).mockResolvedValue(product);
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
      (productsService.findById as jest.Mock).mockResolvedValue(inactiveProduct);

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
      (productsService.findById as jest.Mock).mockResolvedValue(product);

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
      orderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(result).toEqual(orders);
    });
  });

  describe('confirm', () => {
    it('应该确认订单', async () => {
      const order = createTestOrder({ status: 'pending' });
      orderRepository.findOne.mockResolvedValue(order);
      orderRepository.save.mockResolvedValue({ ...order, status: 'confirmed' });

      const result = await service.confirm(order.id, 'staff-id');

      expect(result.status).toBe('confirmed');
      expect(result.confirmedAt).toBeDefined();
    });
  });

  describe('complete', () => {
    it('应该完成订单', async () => {
      const order = createTestOrder({ status: 'confirmed' });
      orderRepository.findOne.mockResolvedValue(order);
      orderRepository.save.mockResolvedValue({ ...order, status: 'completed' });

      const result = await service.complete(order.id);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('应该取消订单', async () => {
      const order = createTestOrder({ status: 'pending' });
      orderRepository.findOne.mockResolvedValue(order);
      orderRepository.save.mockResolvedValue({ ...order, status: 'cancelled' });

      const result = await service.cancel(order.id);

      expect(result.status).toBe('cancelled');
    });
  });
});

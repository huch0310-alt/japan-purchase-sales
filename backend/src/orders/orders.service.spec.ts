import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { EventService } from '../common/services/event.service';
import { LogsService } from '../logs/logs.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock dependencies
const mockOrderRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockOrderItemRepository = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockCustomerService = {
  findById: jest.fn(),
};

const mockSettingService = {
  getValue: jest.fn(),
};

const mockProductsService = {
  findById: jest.fn(),
};

const mockInventoryService = {
  updateInventory: jest.fn(),
};

const mockEventService = {
  notifyOrderCreated: jest.fn(),
  notifyOrderStatusChanged: jest.fn(),
};

const mockDataSource = () => ({
  createQueryRunner: jest.fn(),
});

const mockLogsService = {
  recordOperation: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: ReturnType<typeof mockOrderRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useFactory: mockOrderItemRepository },
        { provide: CustomerService, useValue: mockCustomerService },
        { provide: SettingService, useValue: mockSettingService },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: EventService, useValue: mockEventService },
        { provide: DataSource, useFactory: mockDataSource },
        { provide: LogsService, useValue: mockLogsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('应该根据ID返回订单', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNo: 'ORD202601010001',
        status: 'pending',
        totalAmount: 1000,
      };

      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findById('order-1');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1', deletedAt: expect.anything() },
        relations: ['customer', 'items', 'items.product', 'invoice'],
      });
    });

    it('订单不存在时应该返回null', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByCustomer', () => {
    it('应该返回客户的订单列表', async () => {
      const mockOrders = [
        { id: 'order-1', orderNo: 'ORD001', customerId: 'customer-1' },
        { id: 'order-2', orderNo: 'ORD002', customerId: 'customer-1' },
      ];

      orderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findByCustomer('customer-1');

      expect(result).toEqual(mockOrders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'customer-1', deletedAt: expect.anything() },
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('generateOrderNo', () => {
    it('应该生成正确格式的订单号', () => {
      const orderNo = (service as any).generateOrderNo();

      // 订单号格式: ORD + 年月日 + 4位随机数
      expect(orderNo).toMatch(/^ORD\d{8}\d{4}$/);
    });

    it('每次调用应该生成不同的订单号', () => {
      const orderNo1 = (service as any).generateOrderNo();
      const orderNo2 = (service as any).generateOrderNo();

      // 订单号应该不同（因为包含随机数）
      expect(orderNo1).not.toBe(orderNo2);
    });
  });
});

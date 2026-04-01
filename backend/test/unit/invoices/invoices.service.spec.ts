import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoicesService } from '../../../src/invoices/invoices.service';
import { Invoice } from '../../../src/invoices/entities/invoice.entity';
import { OrdersService } from '../../../src/orders/orders.service';
import { SettingService } from '../../../src/settings/settings.service';
import { DataSource } from 'typeorm';
import { LogsService } from '../../../src/logs/logs.service';
import { createTestInvoice, createTestOrder, createTestCustomer } from '../../fixtures';

describe('InvoicesService', () => {
  let service: InvoicesService;
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
      manager: {
        createQueryBuilder: jest.fn(),
      },
    };

    const mockOrdersService = {
      findById: jest.fn(),
      updateInvoiceInfo: jest.fn(),
    };

    const mockSettingService = {
      getValue: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          create: jest.fn(),
          save: jest.fn(),
          createQueryBuilder: jest.fn(),
        },
      }),
    };

    const mockLogsService = {
      recordOperation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: mockRepository },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: SettingService, useValue: mockSettingService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: LogsService, useValue: mockLogsService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    repository = module.get(getRepositoryToken(Invoice));
  });

  describe('create', () => {
    it('应该创建請求書并汇总订单金额', async () => {
      const customer = createTestCustomer();
      const orders = [
        createTestOrder({ id: 'order-1', subtotal: 1000, taxAmount: 100, totalAmount: 1100, customerId: customer.id, status: 'completed' }),
        createTestOrder({ id: 'order-2', subtotal: 2000, taxAmount: 200, totalAmount: 2200, customerId: customer.id, status: 'completed' }),
      ];

      const createdInvoice = createTestInvoice({
        subtotal: 3000,
        taxAmount: 300,
        totalAmount: 3300,
      });

      const ordersService = service['ordersService'];
      const settingService = service['settingService'];
      const dataSource = service['dataSource'];

      ordersService.findById = jest.fn()
        .mockResolvedValueOnce(orders[0])
        .mockResolvedValueOnce(orders[1]);
      settingService.getValue = jest.fn()
        .mockResolvedValueOnce('10')
        .mockResolvedValueOnce('30');
      
      const queryRunner = dataSource.createQueryRunner();
      (queryRunner.manager.create as jest.Mock).mockReturnValue(createdInvoice);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(createdInvoice);

      const result = await service.create({
        customerId: customer.id,
        orderIds: ['order-1', 'order-2'],
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('应该返回所有請求書', async () => {
      const invoices = [createTestInvoice(), createTestInvoice({ id: 'different-id' })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([invoices, 2]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock the second query for customers
      const mockCustomerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repository.manager.createQueryBuilder.mockReturnValue(mockCustomerQueryBuilder);

      const result = await service.findAll();

      expect(result.data).toEqual(invoices);
      expect(result.total).toBe(2);
    });

    it('应该返回未付款請求書', async () => {
      const invoices = [createTestInvoice({ status: 'unpaid' })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([invoices, 1]),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock the second query for customers
      const mockCustomerQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repository.manager.createQueryBuilder.mockReturnValue(mockCustomerQueryBuilder);

      const result = await service.findAll({ status: 'unpaid' });

      expect(result.data).toEqual(invoices);
    });
  });

  describe('findByCustomer', () => {
    it('应该返回客户对应的請求書', async () => {
      const invoices = [createTestInvoice()];
      repository.find.mockResolvedValue(invoices);

      const result = await service.findByCustomer('customer-id');

      expect(result).toEqual(invoices);
    });
  });

  describe('markAsPaid', () => {
    it('应该标记請求書为已付款', async () => {
      const invoice = createTestInvoice({ status: 'unpaid' });
      const paidInvoice = { ...invoice, status: 'paid', paidAt: new Date() };
      
      repository.findOne.mockResolvedValueOnce(invoice);
      repository.update.mockResolvedValue(undefined);
      repository.findOne.mockResolvedValueOnce(paidInvoice);

      const result = await service.markAsPaid(invoice.id);

      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
    });
  });
});

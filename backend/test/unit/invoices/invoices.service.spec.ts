import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoicesService } from '../../../src/invoices/invoices.service';
import { Invoice } from '../../../src/invoices/entities/invoice.entity';
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    repository = module.get(getRepositoryToken(Invoice));
  });

  describe('create', () => {
    it('应该创建請求書并汇总订单金额', async () => {
      const customer = createTestCustomer();
      const orders = [
        createTestOrder({ subtotal: 1000, taxAmount: 100, totalAmount: 1100 }),
        createTestOrder({ subtotal: 2000, taxAmount: 200, totalAmount: 2200 }),
      ];

      const createdInvoice = createTestInvoice({
        subtotal: 3000,
        taxAmount: 300,
        totalAmount: 3300,
      });

      repository.create.mockReturnValue(createdInvoice);
      repository.save.mockResolvedValue(createdInvoice);

      const result = await service.create(customer as any, orders as any, new Date(), new Date());

      expect(result.subtotal).toBe(3000);
      expect(result.taxAmount).toBe(300);
      expect(result.totalAmount).toBe(3300);
    });
  });

  describe('findAll', () => {
    it('应该返回所有請求書', async () => {
      const invoices = [createTestInvoice(), createTestInvoice({ id: 'different-id' })];
      repository.find.mockResolvedValue(invoices);

      const result = await service.findAll();

      expect(result).toEqual(invoices);
    });

    it('应该返回未付款請求書', async () => {
      const invoices = [createTestInvoice({ status: 'unpaid' })];
      repository.find.mockResolvedValue(invoices);

      const result = await service.findUnpaid();

      expect(result).toEqual(invoices);
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
      repository.findOne.mockResolvedValue(invoice);
      repository.save.mockResolvedValue({ ...invoice, status: 'paid', paidAt: new Date() });

      const result = await service.markAsPaid(invoice.id);

      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
    });
  });

  describe('findOverdue', () => {
    it('应该返回逾期請求書', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invoices = [createTestInvoice({ status: 'unpaid', dueDate: yesterday })];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(invoices),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findOverdue();

      expect(result).toEqual(invoices);
    });
  });
});

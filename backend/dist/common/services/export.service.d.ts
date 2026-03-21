import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../users/entities/customer.entity';
export declare class ExportService {
    private orderRepository;
    private productRepository;
    private invoiceRepository;
    private customerRepository;
    constructor(orderRepository: Repository<Order>, productRepository: Repository<Product>, invoiceRepository: Repository<Invoice>, customerRepository: Repository<Customer>);
    exportSalesReport(startDate: Date, endDate: Date): Promise<Buffer>;
    exportProductReport(): Promise<Buffer>;
    exportCustomerReport(): Promise<Buffer>;
    exportInvoiceReport(startDate: Date, endDate: Date): Promise<Buffer>;
    private getStatusText;
    private getInvoiceStatusText;
}

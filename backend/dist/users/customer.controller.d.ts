import { CustomerService } from './customer.service';
import { PaginationQueryDto } from '../common/dto/validation.dto';
import { UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from './entities/customer.entity';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    findAll(pagination: PaginationQueryDto, keyword?: string): Promise<{
        data: {
            id: string;
            username: string;
            companyName: string;
            address: string;
            contactPerson: string;
            phone: string;
            vipDiscount: number;
            invoiceName: string;
            invoiceAddress: string;
            invoicePhone: string;
            invoiceBank: string;
            isActive: boolean;
            orders: import("../orders/entities/order.entity").Order[];
            cartItems: import("../cart/entities/cart-item.entity").CartItem[];
            invoices: import("../invoices/entities/invoice.entity").Invoice[];
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    create(createCustomerDto: {
        username: string;
        password: string;
        companyName: string;
        address: string;
        contactPerson: string;
        phone: string;
        vipDiscount?: number;
        invoiceName?: string;
        invoiceAddress?: string;
        invoicePhone?: string;
        invoiceBank?: string;
    }): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    delete(id: string): Promise<{
        message: string;
    }>;
}

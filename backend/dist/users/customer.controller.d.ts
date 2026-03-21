import { CustomerService } from './customer.service';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    findAll(keyword?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(createCustomerDto: {
        username: string;
        password: string;
        companyName: string;
        address?: string;
        contactPerson?: string;
        phone?: string;
        vipDiscount?: number;
        invoiceName?: string;
        invoiceAddress?: string;
        invoicePhone?: string;
        invoiceBank?: string;
    }): Promise<import("./entities/customer.entity").Customer>;
    update(id: string, updateCustomerDto: any): Promise<import("./entities/customer.entity").Customer>;
    delete(id: string): Promise<{
        message: string;
    }>;
}

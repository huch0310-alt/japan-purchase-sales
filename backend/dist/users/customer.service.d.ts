import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { PaginatedResponse } from '../common/dto/validation.dto';
export declare class CustomerService {
    private customerRepository;
    constructor(customerRepository: Repository<Customer>);
    findByUsername(username: string): Promise<Customer | null>;
    findById(id: string): Promise<Customer | null>;
    create(data: {
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
    findAll(filters?: {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<Customer>>;
    update(id: string, data: Partial<Customer>): Promise<Customer>;
    delete(id: string): Promise<void>;
    updatePassword(id: string, newPassword: string): Promise<void>;
    searchByCompanyName(keyword: string): Promise<Customer[]>;
}

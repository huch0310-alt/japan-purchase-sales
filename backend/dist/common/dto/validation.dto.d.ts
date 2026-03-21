export declare class CreateStaffDto {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
}
export declare class CreateCustomerDto {
    username: string;
    password: string;
    companyName: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    vipDiscount?: number;
}
export declare class CreateProductDto {
    name: string;
    quantity?: number;
    unit?: string;
    description?: string;
    categoryId?: string;
}
export declare class ApproveProductDto {
    salePrice: number;
}
export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    deliveryAddress: string;
    contactPerson: string;
    contactPhone: string;
    remark?: string;
}
export declare class CreateInvoiceDto {
    customerId: string;
    orderIds: string[];
}
export declare class PaginationQueryDto {
    page?: number;
    pageSize?: number;
}
export declare class DateRangeQueryDto {
    startDate?: string;
    endDate?: string;
}

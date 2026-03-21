export declare const UserRoles: {
    readonly SUPER_ADMIN: "super_admin";
    readonly ADMIN: "admin";
    readonly PROCUREMENT: "procurement";
    readonly SALES: "sales";
    readonly CUSTOMER: "customer";
};
export declare const ProductStatus: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
};
export declare const OrderStatus: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
export declare const InvoiceStatus: {
    readonly UNPAID: "unpaid";
    readonly PAID: "paid";
    readonly OVERDUE: "overdue";
};
export declare const MessageType: {
    readonly ORDER: "order";
    readonly PRODUCT: "product";
    readonly INVOICE: "invoice";
    readonly SYSTEM: "system";
};
export declare const UserType: {
    readonly STAFF: "staff";
    readonly CUSTOMER: "customer";
};
export declare const RoleNames: {
    readonly super_admin: "超级管理员";
    readonly admin: "管理员";
    readonly procurement: "采购";
    readonly sales: "销售";
    readonly customer: "客户";
};
export declare const OrderStatusNames: {
    readonly pending: "待确认";
    readonly confirmed: "已确认";
    readonly completed: "已完成";
    readonly cancelled: "已取消";
};
export declare const InvoiceStatusNames: {
    readonly unpaid: "未払い";
    readonly paid: "支払済";
    readonly overdue: "期限超過";
};
export declare const ProductStatusNames: {
    readonly pending: "待审核";
    readonly approved: "已通过";
    readonly rejected: "已拒绝";
    readonly active: "上架";
    readonly inactive: "下架";
};
export declare const PaginationDefaults: {
    readonly PAGE: 1;
    readonly PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
};
export declare const UploadLimits: {
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
    readonly ALLOWED_DOCUMENT_TYPES: readonly ["application/pdf"];
};
export declare const OrderConfig: {
    readonly CANCEL_TIME_LIMIT: 30;
    readonly DEFAULT_PAYMENT_DAYS: 30;
};
export declare const TaxConfig: {
    readonly DEFAULT_RATE: 10;
    readonly REDUCED_RATE: 8;
};

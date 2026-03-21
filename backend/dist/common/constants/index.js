"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxConfig = exports.OrderConfig = exports.UploadLimits = exports.PaginationDefaults = exports.ProductStatusNames = exports.InvoiceStatusNames = exports.OrderStatusNames = exports.RoleNames = exports.UserType = exports.MessageType = exports.InvoiceStatus = exports.OrderStatus = exports.ProductStatus = exports.UserRoles = void 0;
exports.UserRoles = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    PROCUREMENT: 'procurement',
    SALES: 'sales',
    CUSTOMER: 'customer',
};
exports.ProductStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};
exports.OrderStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
exports.InvoiceStatus = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    OVERDUE: 'overdue',
};
exports.MessageType = {
    ORDER: 'order',
    PRODUCT: 'product',
    INVOICE: 'invoice',
    SYSTEM: 'system',
};
exports.UserType = {
    STAFF: 'staff',
    CUSTOMER: 'customer',
};
exports.RoleNames = {
    [exports.UserRoles.SUPER_ADMIN]: '超级管理员',
    [exports.UserRoles.ADMIN]: '管理员',
    [exports.UserRoles.PROCUREMENT]: '采购',
    [exports.UserRoles.SALES]: '销售',
    [exports.UserRoles.CUSTOMER]: '客户',
};
exports.OrderStatusNames = {
    [exports.OrderStatus.PENDING]: '待确认',
    [exports.OrderStatus.CONFIRMED]: '已确认',
    [exports.OrderStatus.COMPLETED]: '已完成',
    [exports.OrderStatus.CANCELLED]: '已取消',
};
exports.InvoiceStatusNames = {
    [exports.InvoiceStatus.UNPAID]: '未払い',
    [exports.InvoiceStatus.PAID]: '支払済',
    [exports.InvoiceStatus.OVERDUE]: '期限超過',
};
exports.ProductStatusNames = {
    [exports.ProductStatus.PENDING]: '待审核',
    [exports.ProductStatus.APPROVED]: '已通过',
    [exports.ProductStatus.REJECTED]: '已拒绝',
    [exports.ProductStatus.ACTIVE]: '上架',
    [exports.ProductStatus.INACTIVE]: '下架',
};
exports.PaginationDefaults = {
    PAGE: 1,
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};
exports.UploadLimits = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
};
exports.OrderConfig = {
    CANCEL_TIME_LIMIT: 30,
    DEFAULT_PAYMENT_DAYS: 30,
};
exports.TaxConfig = {
    DEFAULT_RATE: 10,
    REDUCED_RATE: 8,
};
//# sourceMappingURL=index.js.map
/**
 * 公共常量定义
 */

// 用户角色
export const UserRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PROCUREMENT: 'procurement',
  SALES: 'sales',
  CUSTOMER: 'customer',
} as const;

// 商品状态
export const ProductStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// 订单状态
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// 請求書状态
export const InvoiceStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

// 消息类型
export const MessageType = {
  ORDER: 'order',
  PRODUCT: 'product',
  INVOICE: 'invoice',
  SYSTEM: 'system',
} as const;

// 用户类型
export const UserType = {
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

// 角色名称映射
export const RoleNames = {
  [UserRoles.SUPER_ADMIN]: '超级管理员',
  [UserRoles.ADMIN]: '管理员',
  [UserRoles.PROCUREMENT]: '采购',
  [UserRoles.SALES]: '销售',
  [UserRoles.CUSTOMER]: '客户',
} as const;

// 订单状态映射
export const OrderStatusNames = {
  [OrderStatus.PENDING]: '待确认',
  [OrderStatus.CONFIRMED]: '已确认',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
} as const;

// 請求書状态映射
export const InvoiceStatusNames = {
  [InvoiceStatus.UNPAID]: '未払い',
  [InvoiceStatus.PAID]: '支払済',
  [InvoiceStatus.OVERDUE]: '期限超過',
} as const;

// 商品状态映射
export const ProductStatusNames = {
  [ProductStatus.PENDING]: '待审核',
  [ProductStatus.APPROVED]: '已通过',
  [ProductStatus.REJECTED]: '已拒绝',
  [ProductStatus.ACTIVE]: '上架',
  [ProductStatus.INACTIVE]: '下架',
} as const;

// 默认分页参数
export const PaginationDefaults = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 文件上传限制
export const UploadLimits = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
} as const;

// 订单相关配置
export const OrderConfig = {
  CANCEL_TIME_LIMIT: 30, // 分钟
  DEFAULT_PAYMENT_DAYS: 30, // 天
} as const;

// 消费税配置
export const TaxConfig = {
  DEFAULT_RATE: 10, // 10%
  REDUCED_RATE: 8, // 8%
} as const;

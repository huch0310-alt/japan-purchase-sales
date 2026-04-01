/**
 * 全局类型定义
 */

// API 响应类型
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户类型
export interface User {
  id: string
  username: string
  name: string
  role: 'super_admin' | 'admin' | 'procurement' | 'sales' | 'customer'
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

// 客户类型
export interface Customer {
  id: string
  username: string
  companyName: string
  contactPerson: string
  contactPhone: string
  deliveryAddress: string
  invoiceName: string
  companyAddress: string
  bankAccount: string
  vipDiscount: number
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

// 商品类型
export interface Product {
  id: string
  nameZh: string
  nameJa: string
  nameEn: string
  categoryId: string
  category?: Category
  unit: string
  purchasePrice: number
  salePrice: number
  inventory: number
  image: string
  description: string
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

// 分类类型
export interface Category {
  id: string
  nameZh: string
  nameJa: string
  nameEn: string
  sortOrder: number
  isSystem: boolean
  createdAt?: string
  updatedAt?: string
}

// 订单类型
export interface Order {
  id: string
  orderNo: string
  customerId: string
  customer?: Customer
  staffId: string
  staff?: User
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  remark: string
  createdAt?: string
  updatedAt?: string
  items?: OrderItem[]
}

// 订单明细类型
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  remark: string
}

// 账单类型
export interface Invoice {
  id: string
  invoiceNo: string
  customerId: string
  customer?: Customer
  orderIds: string[]
  orders?: Order[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  cancelReason?: string
  createdAt?: string
  updatedAt?: string
}

// 仪表盘统计类型
export interface DashboardStats {
  customerCount: number
  productCount: number
  orderCount: number
  todaySales: number
}

// 销售趋势类型
export interface SalesTrend {
  date: string
  amount: number
}

// 热销商品类型
export interface HotProduct {
  id: string
  name: string
  salesCount: number
  salePrice: number
}

// 操作日志类型
export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  operatorRole: string
  module: string
  action: string
  detail: string
  ip: string
  createdAt: string
}

// 系统设置类型
export interface SystemSettings {
  companyName: string
  representative: string
  companyAddress: string
  fax: string
  email: string
  legalRepresentative: string
  bankAccount: string
  taxRate: number
  defaultPaymentDays: number
}

// 表单规则类型
export interface FormRules {
  [key: string]: Array<{
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (rule: any, value: any, callback: any) => void
  }>
}

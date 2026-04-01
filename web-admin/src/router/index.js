import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: 'nav.dashboard' }
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('../views/Staff.vue'),
        meta: { title: 'nav.staff', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('../views/Customer.vue'),
        meta: { title: 'nav.customer' }
      },
      {
        path: 'customer/:id',
        name: 'CustomerDetail',
        component: () => import('../views/CustomerDetail.vue'),
        meta: { title: 'nav.customerDetail' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('../views/Product.vue'),
        meta: { title: 'nav.product' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        meta: { title: 'nav.productDetail' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/Category.vue'),
        meta: { title: 'nav.category', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'unit',
        name: 'Unit',
        component: () => import('../views/Unit.vue'),
        meta: { title: 'nav.unit', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/Order.vue'),
        meta: { title: 'nav.order' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetail.vue'),
        meta: { title: 'nav.orderDetail' }
      },
      {
        path: 'invoice',
        name: 'Invoice',
        component: () => import('../views/Invoice.vue'),
        meta: { title: 'nav.invoice' }
      },
      {
        path: 'invoice/:id',
        name: 'InvoiceDetail',
        component: () => import('../views/InvoiceDetail.vue'),
        meta: { title: 'nav.invoiceDetail' }
      },
      {
        path: 'invoice-generate',
        name: 'InvoiceGenerate',
        component: () => import('../views/InvoiceGenerate.vue'),
        meta: { title: 'nav.invoiceGenerate', roles: ['super_admin', 'admin', 'sales'] }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('../views/Report.vue'),
        meta: { title: 'nav.report', roles: ['super_admin', 'admin', 'sales'] }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: 'nav.settings', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/Logs.vue'),
        meta: { title: 'nav.logs', roles: ['super_admin', 'admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 权限控制
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 需要认证的页面检查
  if (to.meta.requiresAuth !== false) {
    if (!token) {
      next('/login')
      return
    }

    // 从 localStorage 获取用户信息（同步）
    let user = null
    try {
      const userStr = localStorage.getItem('user')
      user = (userStr && userStr !== 'undefined') ? JSON.parse(userStr) : null
    } catch (e) {
      // localStorage 数据损坏，清除并重新登录
      localStorage.removeItem('user')
      next('/login')
      return
    }

    // 页面角色权限检查
    if (to.meta.roles && user) {
      const hasPermission = to.meta.roles.includes(user.role)
      if (!hasPermission) {
        // 无权限，跳转到首页
        next('/')
        return
      }
    }
  }

  // 已登录用户访问登录页，跳转到首页
  if (to.path === '/login' && token) {
    next('/')
    return
  }

  next()
})

export default router

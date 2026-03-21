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
        meta: { title: '信息统计' }
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('../views/Staff.vue'),
        meta: { title: '员工管理', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('../views/Customer.vue'),
        meta: { title: '客户管理' }
      },
      {
        path: 'customer/:id',
        name: 'CustomerDetail',
        component: () => import('../views/CustomerDetail.vue'),
        meta: { title: '客户详情' }
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('../views/Product.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        meta: { title: '商品详情' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/Category.vue'),
        meta: { title: '分类管理', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'unit',
        name: 'Unit',
        component: () => import('../views/Unit.vue'),
        meta: { title: '单位管理', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/Order.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'invoice',
        name: 'Invoice',
        component: () => import('../views/Invoice.vue'),
        meta: { title: '账单管理' }
      },
      {
        path: 'invoice/:id',
        name: 'InvoiceDetail',
        component: () => import('../views/InvoiceDetail.vue'),
        meta: { title: '請求書详情' }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('../views/Report.vue'),
        meta: { title: '报表统计' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/Logs.vue'),
        meta: { title: '操作日志', roles: ['super_admin', 'admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStore = useUserStore()
  const user = userStore.user

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    next('/')
  } else {
    next()
  }
})

export default router

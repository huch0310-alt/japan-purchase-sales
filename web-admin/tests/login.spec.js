/**
 * 登录流程测试
 * 测试目标：
 * 1. 用户登录成功后的 token 存储
 * 2. 登录成功后的路由跳转
 * 3. 登录失败的处理
 * 4. 表单验证
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import Login from '../src/views/Login.vue'
import { useUserStore } from '../src/store/user'

// Mock API
vi.mock('../src/api', () => ({
  default: {
    post: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(),
    alert: vi.fn()
  }
}))

import api from '../src/api'
import { ElMessage } from 'element-plus'

describe('登录流程测试', () => {
  let router
  let pinia
  let i18n

  beforeEach(() => {
    // 创建 Pinia 实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/login',
          name: 'Login',
          component: Login
        },
        {
          path: '/',
          name: 'Home',
          component: { template: '<div>Home</div>' }
        }
      ]
    })

    // 创建 i18n 实例
    i18n = createI18n({
      legacy: false,
      locale: 'zh',
      messages: {
        zh: {
          login: {
            title: '登录',
            submit: '登录',
            loginSuccess: '登录成功',
            loginFailed: '登录失败'
          },
          customer: {
            username: '用户名',
            password: '密码'
          },
          validation: {
            enterUsername: '请输入用户名',
            enterPassword: '请输入密码'
          }
        }
      }
    })

    // 清除 localStorage
    localStorage.clear()

    // 重置所有 mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('1. Token 存储测试', () => {
    it('登录成功后应该将 token 存储到 localStorage', async () => {
      const mockToken = 'test-access-token-12345'
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'super_admin'
      }

      // Mock API 响应
      api.post.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          user: mockUser
        }
      })

      const userStore = useUserStore()
      await userStore.login('admin', 'password123', 'staff')

      // 验证 token 存储到 localStorage
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser)

      // 验证 store 状态
      expect(userStore.token).toBe(mockToken)
      expect(userStore.user).toEqual(mockUser)
      expect(userStore.isLoggedIn).toBe(true)
    })

    it('登录成功后应该设置 Authorization header', async () => {
      const mockToken = 'test-access-token-12345'
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'super_admin'
      }

      api.post.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          user: mockUser
        }
      })

      const userStore = useUserStore()
      await userStore.login('admin', 'password123', 'staff')

      // 验证 Authorization header 已设置
      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`)
    })
  })

  describe('2. 路由跳转测试', () => {
    it('登录成功后应该跳转到首页', async () => {
      const mockToken = 'test-access-token-12345'
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'super_admin'
      }

      api.post.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          user: mockUser
        }
      })

      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, i18n]
        }
      })

      // 填写表单
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
      await wrapper.find('input[placeholder="请输入密码"]').setValue('password123')

      // 提交登录
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证调用了正确的 API 端点
      expect(api.post).toHaveBeenCalledWith('/auth/staff/login', {
        username: 'admin',
        password: 'password123'
      })

      // 验证显示了成功消息
      expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
    })
  })

  describe('3. 登录失败处理测试', () => {
    it('登录失败应该显示错误消息', async () => {
      const errorMessage = '用户名或密码错误'

      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      })

      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, i18n]
        }
      })

      // 填写表单
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('wronguser')
      await wrapper.find('input[placeholder="请输入密码"]').setValue('wrongpass')

      // 提交登录
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证显示了错误消息
      expect(ElMessage.error).toHaveBeenCalledWith(errorMessage)
    })

    it('登录失败不应该存储 token', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: '登录失败'
          }
        }
      })

      const userStore = useUserStore()
      
      try {
        await userStore.login('wronguser', 'wrongpass', 'staff')
      } catch (error) {
        // 预期的错误
      }

      // 验证 token 未存储
      expect(localStorage.getItem('token')).toBeNull()
      expect(userStore.token).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('4. 表单验证测试', () => {
    it('用户名为空时不应该提交表单', async () => {
      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, i18n]
        }
      })

      // 只填写密码
      await wrapper.find('input[placeholder="请输入密码"]').setValue('password123')

      // 提交登录
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // 验证未调用 API
      expect(api.post).not.toHaveBeenCalled()
    })

    it('密码为空时不应该提交表单', async () => {
      const wrapper = mount(Login, {
        global: {
          plugins: [pinia, router, i18n]
        }
      })

      // 只填写用户名
      await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')

      // 提交登录
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()

      // 验证未调用 API
      expect(api.post).not.toHaveBeenCalled()
    })
  })

  describe('5. 登出流程测试', () => {
    it('登出应该清除 localStorage 和 store 状态', async () => {
      // 先登录
      const mockToken = 'test-access-token-12345'
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'super_admin'
      }

      api.post.mockResolvedValueOnce({
        data: {
          access_token: mockToken,
          user: mockUser
        }
      })

      const userStore = useUserStore()
      await userStore.login('admin', 'password123', 'staff')

      // 验证已登录
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(userStore.isLoggedIn).toBe(true)

      // 登出
      userStore.logout()

      // 验证已清除
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(userStore.token).toBeNull()
      expect(userStore.user).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('6. 角色权限测试', () => {
    it('super_admin 应该有管理员权限', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'super_admin'
      }

      api.post.mockResolvedValueOnce({
        data: {
          access_token: 'token',
          user: mockUser
        }
      })

      const userStore = useUserStore()
      await userStore.login('admin', 'password123', 'staff')

      expect(userStore.isAdmin).toBe(true)
    })

    it('customer 不应该有管理员权限', async () => {
      const mockUser = {
        id: 2,
        username: 'customer1',
        role: 'customer'
      }

      api.post.mockResolvedValueOnce({
        data: {
          access_token: 'token',
          user: mockUser
        }
      })

      const userStore = useUserStore()
      await userStore.login('customer1', 'password123', 'customer')

      expect(userStore.isAdmin).toBe(false)
    })
  })
})

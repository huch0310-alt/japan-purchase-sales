import { defineStore } from 'pinia'
import api from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    isAdmin: state => ['super_admin', 'admin'].includes(state.user?.role)
  },
  actions: {
    async login(username, password, loginType) {
      const endpoint = loginType === 'staff' ? '/auth/staff/login' : '/auth/customer/login'
      const res = await api.post(endpoint, { username, password })
      const { access_token, user } = res.data

      this.token = access_token
      this.user = user

      // 存储token和用户信息到localStorage，供路由守卫使用
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    },
    logout() {
      this.token = null
      this.user = null
      // 清除localStorage中的token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    }
  }
})

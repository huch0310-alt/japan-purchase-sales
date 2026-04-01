import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 启用跨域 Cookie（支持 HttpOnly Cookie 认证）
  withCredentials: true,
  // CSRF（与后端 /api/security/csrf 配合）
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})

// ==================== 请求缓存机制 ====================
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 默认缓存5分钟

/**
 * 生成缓存键
 * @param {string} method - HTTP方法
 * @param {string} url - 请求URL
 * @param {object} params - 请求参数
 * @returns {string} 缓存键
 */
const generateCacheKey = (method, url, params) => {
  const sortedParams = params ? JSON.stringify(params, Object.keys(params).sort()) : ''
  return `${method.toUpperCase()}:${url}:${sortedParams}`
}

/**
 * 检查缓存是否有效
 * @param {object} cached - 缓存对象
 * @param {number} duration - 缓存时长
 * @returns {boolean} 是否有效
 */
const isCacheValid = (cached, duration = CACHE_DURATION) => {
  return cached && Date.now() - cached.timestamp < duration
}

/**
 * 带缓存的GET请求
 * @param {string} url - 请求URL
 * @param {object} config - Axios配置
 * @param {number} cacheDuration - 缓存时长（毫秒），0表示不缓存
 * @returns {Promise} Axios响应
 */
export const cachedGet = async (url, config = {}, cacheDuration = CACHE_DURATION) => {
  const cacheKey = generateCacheKey('GET', url, config.params)

  // 如果缓存有效，直接返回缓存数据
  if (cacheDuration > 0) {
    const cached = cache.get(cacheKey)
    if (isCacheValid(cached, cacheDuration)) {
      return cached.data
    }
  }

  // 发送请求
  const response = await api.get(url, config)

  // 缓存响应数据
  if (cacheDuration > 0) {
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })
  }

  return response
}

/**
 * 清除指定URL的缓存
 * @param {string} urlPattern - URL匹配模式（支持正则）
 */
export const clearCache = (urlPattern) => {
  if (!urlPattern) {
    cache.clear()
    return
  }

  const regex = urlPattern instanceof RegExp ? urlPattern : new RegExp(urlPattern)
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
    }
  }
}

/**
 * 清除所有过期缓存
 */
export const cleanExpiredCache = () => {
  for (const [key, cached] of cache.entries()) {
    if (!isCacheValid(cached)) {
      cache.delete(key)
    }
  }
}

// 定期清理过期缓存（每10分钟）
setInterval(cleanExpiredCache, 10 * 60 * 1000)

// ==================== 请求拦截器 ====================
api.interceptors.request.use(
  config => {
    // 禁用浏览器的 HTTP GET 强缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // 优先从 Cookie 获取 token（HttpOnly Cookie）
    // 如果 Cookie 中没有，则回退到 localStorage（向后兼容）
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (cookieToken) {
      // token 已在 HttpOnly Cookie 中，不需要在 header 中设置
    } else {
      // 向后兼容：从 localStorage 获取 token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// ==================== 响应拦截器 ====================
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 网络错误处理
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    switch (status) {
      case 400:
        ElMessage.error(data.message || '请求参数错误')
        break
      case 401:
        // 清除认证信息并跳转登录
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // 清除 Cookie
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        // 清除所有缓存
        cache.clear()
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        break
      case 403:
        ElMessage.error(data.message || '您没有权限执行此操作')
        break
      case 404:
        ElMessage.error(data.message || '请求的资源不存在')
        break
      case 422:
        ElMessage.error(data.message || '数据验证失败')
        break
      case 429:
        ElMessage.error('请求过于频繁，请稍后再试')
        break
      case 500:
        ElMessage.error(data.message || '服务器内部错误')
        break
      default:
        ElMessage.error(data.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

// ==================== 导出便捷方法 ====================
// 带缓存的常用API
export const getCategories = (cacheDuration = CACHE_DURATION) =>
  cachedGet('/categories', {}, cacheDuration)

export const getProducts = (params, cacheDuration = CACHE_DURATION) =>
  cachedGet('/products', { params }, cacheDuration)

export const getCustomers = (params, cacheDuration = CACHE_DURATION) =>
  cachedGet('/customers', { params }, cacheDuration)

export const getDashboardStats = (cacheDuration = 60 * 1000) =>
  cachedGet('/stats/dashboard', {}, cacheDuration) // 仪表盘数据缓存1分钟

export const getSalesTrend = (params, cacheDuration = 5 * 60 * 1000) =>
  cachedGet('/stats/sales-trend', { params }, cacheDuration)

export default api

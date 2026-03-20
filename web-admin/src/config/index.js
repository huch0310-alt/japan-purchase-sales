/**
 * Web管理后台配置文件
 */

export default {
  // API基础URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

  // 应用配置
  app: {
    name: '日本采销管理系统',
    version: '1.0.0',
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },

  // 日期格式
  dateFormat: 'yyyy/MM/dd',
  dateTimeFormat: 'yyyy/MM/dd HH:mm:ss',

  // 上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  },
}

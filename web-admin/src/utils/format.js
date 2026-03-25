/**
 * 日期格式化工具
 */

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm 格式
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 日元金额格式化 - 只显示到元（整数）
 * @param {number|string} amount - 金额
 * @returns {string} 格式化的金额，如 "¥1,234"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '¥0'
  const num = Number(amount)
  if (isNaN(num)) return '¥0'
  return `¥${Math.round(num).toLocaleString()}`
}

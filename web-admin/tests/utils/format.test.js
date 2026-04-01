/**
 * 格式化工具函数测试
 */

import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '@/utils/format'

describe('formatCurrency', () => {
  it('应该正确格式化日元金额', () => {
    expect(formatCurrency(1000)).toBe('¥1,000')
    expect(formatCurrency(1234567)).toBe('¥1,234,567')
    expect(formatCurrency(0)).toBe('¥0')
  })

  it('应该处理负数', () => {
    expect(formatCurrency(-1000)).toBe('¥-1,000')
  })

  it('应该处理小数', () => {
    expect(formatCurrency(1000.5)).toBe('¥1,001')
  })

  it('应该处理空值', () => {
    expect(formatCurrency(null)).toBe('¥0')
    expect(formatCurrency(undefined)).toBe('¥0')
  })
})

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15')
  })

  it('应该处理字符串日期', () => {
    expect(formatDate('2024-01-15', 'YYYY-MM-DD')).toBe('2024-01-15')
  })

  it('应该处理空值', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

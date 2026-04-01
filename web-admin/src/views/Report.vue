<template>
  <div class="report-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ t('report.title') }}</span>
              <div>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  :range-separator="t('report.startDate')"
                  :start-placeholder="t('report.startDate')"
                  :end-placeholder="t('report.endDate')"
                  @change="loadData"
                />
                <el-button
                  type="primary"
                  style="margin-left: 10px"
                  @click="handleExport"
                >
                  {{ t('report.exportExcel') }}
                </el-button>
              </div>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-row
      :gutter="20"
      style="margin-top: 20px"
    >
      <el-col
        :xs="24"
        :sm="24"
        :md="12"
      >
        <el-card>
          <template #header>
            <span>{{ t('report.salesTrendChart') }}</span>
          </template>
          <div
            ref="salesChartRef"
            style="height: 300px"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="24"
        :md="12"
      >
        <el-card>
          <template #header>
            <span>{{ t('report.categorySales') }}</span>
          </template>
          <div
            ref="categoryChartRef"
            style="height: 300px"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row
      :gutter="20"
      style="margin-top: 20px"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card>
          <template #header>
            <span>{{ t('report.hotProducts') }}</span>
          </template>
          <el-table
            :data="hotProducts"
            height="250"
          >
            <el-table-column
              type="index"
              width="50"
            />
            <el-table-column
              prop="name"
              :label="t('dashboard.productName')"
            />
            <el-table-column
              prop="sales"
              :label="t('report.sales')"
              width="80"
            />
          </el-table>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card>
          <template #header>
            <span>{{ t('report.customerRanking') }}</span>
          </template>
          <el-table
            :data="topCustomers"
            height="250"
          >
            <el-table-column
              type="index"
              width="50"
            />
            <el-table-column
              prop="companyName"
              :label="t('report.customerName')"
            />
            <el-table-column
              prop="amount"
              :label="t('dashboard.salesAmount')"
              width="100"
            >
              <template #default="{ row }">
                {{ formatCurrency(row.amount) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
      >
        <el-card>
          <template #header>
            <span>{{ t('report.procurementPerformance') }}</span>
          </template>
          <el-table
            :data="procurementStats"
            height="250"
          >
            <el-table-column
              type="index"
              width="50"
            />
            <el-table-column
              prop="name"
              :label="t('report.staff')"
            />
            <el-table-column
              prop="count"
              :label="t('report.procurementCount')"
              width="80"
            />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts/core'
import { ElMessage } from 'element-plus'

// 注册必须的组件
use([LineChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])
import { formatCurrency } from '../utils/format'
import api from '../api'

const { t } = useI18n()

const dateRange = ref([])
const salesChartRef = ref()
const categoryChartRef = ref()
const hotProducts = ref([])
const topCustomers = ref([])
const procurementStats = ref([])

// ECharts 实例引用，用于组件卸载时销毁
let salesChartInstance = null
let categoryChartInstance = null

const loadData = async () => {
  try {
    // 获取日期范围
    const startDate = dateRange.value[0] ? new Date(dateRange.value[0]).toISOString() : undefined
    const endDate = dateRange.value[1] ? new Date(dateRange.value[1]).toISOString() : undefined

    // 并行加载所有数据
    const [salesTrendRes, hotProductsRes, topCustomersRes, categoryRatioRes, procurementRes] = await Promise.all([
      api.get('/stats/sales-trend', { params: { startDate, endDate } }),
      api.get('/stats/hot-products', { params: { limit: 10 } }),
      api.get('/stats/top-customers', { params: { limit: 10 } }),
      api.get('/stats/category-ratio', { params: { startDate, endDate } }),
      api.get('/stats/procurement-stats')
    ])

    // 热销商品
    hotProducts.value = (hotProductsRes.data || []).map(p => ({
      name: p.name,
      sales: p.sales || p.salesCount || 0
    }))

    // 客户排行
    topCustomers.value = (topCustomersRes.data || []).map(c => ({
      companyName: c.companyName || c.name,
      amount: c.amount || c.totalAmount || 0
    }))

    // 采购统计
    procurementStats.value = (procurementRes.data || []).map(p => ({
      name: p.staffId || 'Unknown',
      count: p.count || 0
    }))

    // 销售趋势图
    const salesData = salesTrendRes.data || []
    // 销毁旧实例（如果存在）
    if (salesChartInstance) {
      salesChartInstance.dispose()
    }
    salesChartInstance = echarts.init(salesChartRef.value)
    salesChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: salesData.map(d => d.date || d.label || '') },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => `¥${value.toLocaleString()}`
        }
      },
      series: [{ data: salesData.map(d => d.amount || d.value || 0), type: 'line', smooth: true }]
    })

    // 分类占比图
    const categoryData = categoryRatioRes.data || []
    // 销毁旧实例（如果存在）
    if (categoryChartInstance) {
      categoryChartInstance.dispose()
    }
    categoryChartInstance = echarts.init(categoryChartRef.value)
    categoryChartInstance.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '50%',
        data: categoryData.map(c => ({
          value: c.amount || c.count || 0,
          name: c.name || c.categoryName || ''
        }))
      }]
    })
  } catch (e) {
    console.error('Failed to load report data:', e)
  }
}

const handleExport = async () => {
  try {
    ElMessage.info(t('report.exporting'))
    const startDate = dateRange.value[0] ? new Date(dateRange.value[0]).toISOString() : undefined
    const endDate = dateRange.value[1] ? new Date(dateRange.value[1]).toISOString() : undefined
    const res = await api.get('/reports/sales/export', { params: { startDate, endDate }, responseType: 'blob' })
    // 下载文件
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success(t('report.exportSuccess'))
  } catch (e) {
    console.error('Export failed:', e)
    ElMessage.error(t('report.exportFailed'))
  }
}

onMounted(() => { loadData() })

// 组件卸载时销毁图表实例，防止内存泄漏
onUnmounted(() => {
  if (salesChartInstance) {
    salesChartInstance.dispose()
    salesChartInstance = null
  }
  if (categoryChartInstance) {
    categoryChartInstance.dispose()
    categoryChartInstance = null
  }
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>

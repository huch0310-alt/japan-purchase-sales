<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409eff">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customerCount }}</div>
              <div class="stat-label">{{ t('dashboard.customerCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon :size="30"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.productCount }}</div>
              <div class="stat-label">{{ t('dashboard.productCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.orderCount }}</div>
              <div class="stat-label">{{ t('dashboard.orderCount') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatCurrency(stats.todaySales) }}</div>
              <div class="stat-label">{{ t('dashboard.todaySales') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ t('dashboard.salesTrend') }}</span>
          </template>
          <div ref="salesChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ t('dashboard.hotProducts') }}</span>
          </template>
          <el-table :data="hotProducts" height="300">
            <el-table-column prop="name" :label="t('dashboard.productName')" />
            <el-table-column prop="saleCount" :label="t('dashboard.salesQuantity')" width="100" />
            <el-table-column prop="saleAmount" :label="t('dashboard.salesAmount')" width="100">
              <template #default="{ row }">
                {{ formatCurrency(row.saleAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { formatCurrency } from '../utils/format'
import api from '../api'

const { t } = useI18n()

const stats = ref({
  customerCount: 0,
  productCount: 0,
  orderCount: 0,
  todaySales: 0
})

const salesChartRef = ref()
const hotProducts = ref([])

const loadStats = async () => {
  try {
    const res = await api.get('/stats/dashboard')
    stats.value = {
      customerCount: res.data.customerCount || 0,
      productCount: res.data.productCount || 0,
      orderCount: res.data.orderCount || 0,
      todaySales: res.data.todaySales || 0
    }
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

const loadHotProducts = async () => {
  try {
    const res = await api.get('/stats/hot-products', { params: { limit: 5 } })
    hotProducts.value = (res.data || []).map(p => ({
      name: p.name,
      saleCount: p.salesCount || 0,
      // 销售额 = 销售价 × 销售数量
      saleAmount: (p.salePrice || 0) * (p.salesCount || 0)
    }))
  } catch (e) {
    console.error('Failed to load hot products:', e)
  }
}

const loadSalesTrend = async () => {
  try {
    const res = await api.get('/stats/sales-trend')
    const data = res.data || []
    const chart = echarts.init(salesChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date || d.label || '')
      },
      yAxis: { type: 'value' },
      series: [{
        data: data.map(d => d.amount || d.value || 0),
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
      }]
    })
  } catch (e) {
    console.error('Failed to load sales trend:', e)
    // 即使失败也初始化图表，避免页面空白
    const chart = echarts.init(salesChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'line', smooth: true }]
    })
  }
}

onMounted(() => {
  loadStats()
  loadHotProducts()
  loadSalesTrend()
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
</style>

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
              <div class="stat-value">¥{{ stats.todaySales }}</div>
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
                ¥{{ row.saleAmount }}
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

const { t } = useI18n()

const stats = ref({
  customerCount: 0,
  productCount: 0,
  orderCount: 0,
  todaySales: 0
})

const salesChartRef = ref()
const hotProducts = ref([])

onMounted(() => {
  // 模拟数据
  stats.value = {
    customerCount: 156,
    productCount: 428,
    orderCount: 892,
    todaySales: '12,580'
  }

  // 销售趋势图表
  const chart = echarts.init(salesChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' }
    }]
  })

  // 热销商品
  hotProducts.value = [
    { name: '新鲜猪肉', saleCount: 520, saleAmount: 15600 },
    { name: '鸡蛋', saleCount: 480, saleAmount: 9600 },
    { name: '新鲜蔬菜', saleCount: 350, saleAmount: 8750 },
    { name: '牛奶', saleCount: 280, saleAmount: 5600 },
    { name: '面包', saleCount: 220, saleAmount: 4400 }
  ]
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
</style>

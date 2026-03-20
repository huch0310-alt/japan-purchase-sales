<template>
  <div class="report-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>报表统计</span>
              <div>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="loadData"
                />
                <el-button type="primary" style="margin-left: 10px" @click="handleExport">导出Excel</el-button>
              </div>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span>销售趋势图</span></template>
          <div ref="salesChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>分类销售占比</span></template>
          <div ref="categoryChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <template #header><span>热销商品排行</span></template>
          <el-table :data="hotProducts" height="250">
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="sales" label="销量" width="80" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>客户购买排行</span></template>
          <el-table :data="topCustomers" height="250">
            <el-table-column type="index" width="50" />
            <el-table-column prop="companyName" label="客户名称" />
            <el-table-column prop="amount" label="销售额" width="100">
              <template #default="{ row }">¥{{ row.amount }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>采购人员业绩</span></template>
          <el-table :data="procurementStats" height="250">
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="人员" />
            <el-table-column prop="count" label="采集数量" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import api from '../api'

const dateRange = ref([])
const salesChartRef = ref()
const categoryChartRef = ref()
const hotProducts = ref([])
const topCustomers = ref([])
const procurementStats = ref([])

const loadData = async () => {
  // 模拟数据加载
  hotProducts.value = [
    { name: '新鲜猪肉', sales: 520 },
    { name: '鸡蛋', sales: 480 },
    { name: '新鲜蔬菜', sales: 350 },
    { name: '牛奶', sales: 280 },
    { name: '面包', sales: 220 }
  ]
  topCustomers.value = [
    { companyName: '株式会社ABC', amount: 156000 },
    { companyName: 'XYZ商事', amount: 98000 },
    { companyName: '田中商店', amount: 75000 }
  ]
  procurementStats.value = [
    { name: '佐藤', count: 120 },
    { name: '田中', count: 95 },
    { name: '鈴木', count: 88 }
  ]

  // 销售趋势图
  const salesChart = echarts.init(salesChartRef.value)
  salesChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [{ data: [82000, 93200, 90100, 93400, 129000, 133000], type: 'line', smooth: true }]
  })

  // 分类占比图
  const categoryChart = echarts.init(categoryChartRef.value)
  categoryChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 335, name: '肉类' },
        { value: 234, name: '蛋品' },
        { value: 154, name: '生鲜蔬果' },
        { value: 135, name: '酒水饮料' },
        { value: 148, name: '其他' }
      ]
    }]
  })
}

const handleExport = async () => {
  // TODO: 实现Excel导出
  ElMessage.info('导出功能开发中')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>

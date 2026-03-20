<template>
  <div class="invoice-detail-page">
    <el-page-header @back="goBack" content="請求書详情">
      <template #extra>
        <el-button type="primary" @click="handleDownloadPdf">下载PDF</el-button>
        <el-button v-if="invoice.status === 'unpaid'" type="success" @click="handleMarkPaid">标记付款</el-button>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="請求書番号">{{ invoice.invoiceNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(invoice.status)">{{ getStatusText(invoice.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户">{{ invoice.customer?.companyName }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ invoice.customer?.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="开具日期">{{ invoice.issueDate }}</el-descriptions-item>
        <el-descriptions-item label="到期日期" :class="{ 'overdue': isOverdue }">{{ invoice.dueDate }}</el-descriptions-item>
        <el-descriptions-item label="小计（税拔）">¥{{ invoice.subtotal }}</el-descriptions-item>
        <el-descriptions-item label="消费税">¥{{ invoice.taxAmount }}</el-descriptions-item>
        <el-descriptions-item label="合計金額" :span="2">
          <span style="font-size: 20px; font-weight: bold; color: #f56c6c">¥{{ invoice.totalAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="付款日期" v-if="invoice.paidAt">{{ invoice.paidAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>关联订单</span>
      </template>
      <el-table :data="orders" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="createdAt" label="下单时间" />
        <el-table-column prop="totalAmount" label="金额">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const route = useRoute()
const router = useRouter()

const invoice = ref({})
const orders = ref([])

const isOverdue = computed(() => {
  return invoice.value.status === 'unpaid' && new Date(invoice.value.dueDate) < new Date()
})

const getStatusType = (status) => {
  const map = { unpaid: 'warning', paid: 'success', overdue: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { unpaid: '未払い', paid: '支払済', overdue: '期限超過' }
  return map[status] || status
}

const loadData = async () => {
  try {
    const res = await api.get(`/invoices/${route.params.id}`)
    invoice.value = res.data

    // 获取关联订单
    if (invoice.value.orderIds?.length) {
      const orderPromises = invoice.value.orderIds.map(id => api.get(`/orders/${id}`))
      const orderResults = await Promise.all(orderPromises)
      orders.value = orderResults.map(r => r.data)
    }
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const goBack = () => {
  router.back()
}

const handleDownloadPdf = async () => {
  try {
    window.open(`/api/invoices/${invoice.value.id}/pdf`, '_blank')
  } catch (e) {
    ElMessage.error('下载失败')
  }
}

const handleMarkPaid = async () => {
  try {
    await api.put(`/invoices/${invoice.value.id}/paid`)
    ElMessage.success('已标记为已付款')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.overdue {
  color: #f56c6c;
  font-weight: bold;
}
</style>

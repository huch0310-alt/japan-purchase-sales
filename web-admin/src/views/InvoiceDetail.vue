<template>
  <div class="invoice-detail-page">
    <el-page-header @back="goBack" :content="t('nav.invoiceDetail')">
      <template #extra>
        <el-button type="primary" @click="handleDownloadPdf">{{ t('invoice.downloadPdf') }}</el-button>
        <el-button v-if="invoice.status === 'unpaid'" type="success" @click="handleMarkPaid">{{ t('invoice.markPaid') }}</el-button>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('invoice.invoiceNo')">{{ invoice.invoiceNo }}</el-descriptions-item>
        <el-descriptions-item :label="t('common.status')">
          <el-tag :type="getStatusType(invoice.status)">{{ getStatusText(invoice.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('order.customer')">{{ invoice.customer?.companyName }}</el-descriptions-item>
        <el-descriptions-item :label="t('common.contact')">{{ invoice.customer?.contactPerson }}</el-descriptions-item>
        <el-descriptions-item :label="t('invoice.issueDate')">{{ invoice.issueDate }}</el-descriptions-item>
        <el-descriptions-item :label="t('invoice.dueDate')" :class="{ 'overdue': isOverdue }">{{ invoice.dueDate }}</el-descriptions-item>
        <el-descriptions-item :label="t('invoice.subtotalNoTax')">¥{{ invoice.subtotal }}</el-descriptions-item>
        <el-descriptions-item :label="t('invoice.taxAmount')">¥{{ invoice.taxAmount }}</el-descriptions-item>
        <el-descriptions-item :label="t('order.total')" :span="2">
          <span style="font-size: 20px; font-weight: bold; color: #f56c6c">¥{{ invoice.totalAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('invoice.dueDate')" v-if="invoice.paidAt">{{ invoice.paidAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>{{ t('order.orderDetails') }}</span>
      </template>
      <el-table :data="orders" border>
        <el-table-column prop="orderNo" :label="t('order.orderNo')" />
        <el-table-column prop="createdAt" :label="t('order.orderTime')" />
        <el-table-column prop="totalAmount" :label="t('order.amount')">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="t('common.status')">
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
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'

const { t } = useI18n()
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
  const map = {
    unpaid: t('invoice.unpaid'),
    paid: t('invoice.paid'),
    overdue: t('invoice.overdue')
  }
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
    ElMessage.error(t('messages.loadFailed'))
  }
}

const goBack = () => {
  router.back()
}

const handleDownloadPdf = async () => {
  try {
    window.open(`/api/invoices/${invoice.value.id}/pdf`, '_blank')
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleMarkPaid = async () => {
  try {
    await api.put(`/invoices/${invoice.value.id}/paid`)
    ElMessage.success(t('invoice.paidMarked'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
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

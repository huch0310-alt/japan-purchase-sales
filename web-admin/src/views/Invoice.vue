<template>
  <div class="invoice-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('invoice.title') }}</span>
          <div>
            <el-button type="primary" @click="handleCreate">{{ t('invoice.createInvoice') }}</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="invoiceNo" :label="t('invoice.invoiceNo')" width="180" />
        <el-table-column prop="companyName" :label="t('order.customer')" min-width="150" />
        <el-table-column prop="subtotal" :label="t('invoice.subtotalNoTax')" width="120">
          <template #default="{ row }">¥{{ row.subtotal }}</template>
        </el-table-column>
        <el-table-column prop="taxAmount" :label="t('invoice.taxAmount')" width="100">
          <template #default="{ row }">¥{{ row.taxAmount }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" :label="t('invoice.totalWithTax')" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #f56c6c">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueDate" :label="t('invoice.issueDate')" width="120">
          <template #default="{ row }">{{ formatDate(row.issueDate) }}</template>
        </el-table-column>
        <el-table-column prop="dueDate" :label="t('invoice.dueDate')" width="120">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row) }">{{ formatDate(row.dueDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ t('common.view') }}</el-button>
            <el-button type="success" link @click="handleDownloadPdf(row)">{{ t('invoice.downloadPdf') }}</el-button>
            <el-button v-if="row.status === 'unpaid'" type="warning" link @click="handleMarkPaid(row)">{{ t('invoice.markPaid') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 生成請求書对话框 -->
    <el-dialog v-model="createVisible" :title="t('invoice.createInvoice')" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item :label="t('invoice.selectCustomer')">
          <el-select v-model="createForm.customerId" :placeholder="t('invoice.selectCustomer')" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c.id" :label="c.companyName" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('invoice.selectOrder')">
          <el-table :data="customerOrders" border @selection-change="handleOrderSelect">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="orderNo" :label="t('order.orderNo')" />
            <el-table-column prop="totalAmount" :label="t('order.amount')">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" :label="t('order.orderTime')">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitCreate">{{ t('invoice.generate') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'
import { formatDateTime, formatDate } from '../utils/format'

const { t } = useI18n()

const tableData = ref([])
const createVisible = ref(false)
const customers = ref([])
const customerOrders = ref([])
const selectedOrders = ref([])

const createForm = reactive({ customerId: '', orderIds: [] })

const getStatusType = (status) => {
  const map = { unpaid: 'warning', paid: 'success', overdue: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { unpaid: t('invoice.unpaid'), paid: t('invoice.paid'), overdue: t('invoice.overdue') }
  return map[status] || status
}

const isOverdue = (row) => {
  return row.status === 'unpaid' && new Date(row.dueDate) < new Date()
}

const loadData = async () => {
  try {
    const res = await api.get('/invoices')
    tableData.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const loadCustomers = async () => {
  try {
    const res = await api.get('/customers')
    customers.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleCreate = async () => {
  await loadCustomers()
  createVisible.value = true
}

watch(() => createForm.customerId, async (customerId) => {
  if (!customerId) {
    customerOrders.value = []
    return
  }
  try {
    // 获取已完成但未生成請求书的订单
    const res = await api.get('/orders/available-for-invoice', { params: { customerId } })
    customerOrders.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
})

const handleOrderSelect = (selection) => {
  selectedOrders.value = selection
}

const handleSubmitCreate = async () => {
  if (!createForm.customerId || selectedOrders.value.length === 0) {
    ElMessage.warning(t('messages.selectCustomerOrder'))
    return
  }
  try {
    await api.post('/invoices', {
      customerId: createForm.customerId,
      orderIds: selectedOrders.value.map(o => o.id)
    })
    ElMessage.success(t('invoice.createSuccess'))
    createVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleView = (row) => {
  // TODO: 跳转到請求書详情页
}

const handleDownloadPdf = async (row) => {
  try {
    ElMessage.info(t('invoice.downloadingPdf'))
    const response = await api.get(`/invoices/${row.id}/pdf`, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice_${row.invoiceNo}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success(t('invoice.downloadSuccess'))
  } catch (e) {
    console.error('PDF download failed:', e)
    ElMessage.error(t('invoice.downloadFailed'))
  }
}

const handleMarkPaid = async (row) => {
  try {
    await api.put(`/invoices/${row.id}/paid`)
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
.card-header { display: flex; justify-content: space-between; align-items: center; }
.overdue { color: #f56c6c; font-weight: bold; }
</style>

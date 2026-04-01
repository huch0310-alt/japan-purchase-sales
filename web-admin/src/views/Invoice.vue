<template>
  <div class="invoice-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('invoice.title') }}</span>
          <div>
            <el-button
              type="primary"
              @click="handleCreate"
            >
              {{ t('invoice.createInvoice') }}
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        border
        stripe
      >
        <el-table-column
          prop="invoiceNo"
          :label="t('invoice.invoiceNo')"
          width="180"
        />
        <el-table-column
          prop="companyName"
          :label="t('order.customer')"
          min-width="150"
        />
        <el-table-column
          prop="subtotal"
          :label="t('invoice.subtotalNoTax')"
          width="120"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.subtotal) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="taxAmount"
          :label="t('invoice.taxAmount')"
          width="100"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.taxAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalAmount"
          :label="t('invoice.totalWithTax')"
          width="120"
        >
          <template #default="{ row }">
            <span style="font-weight: bold; color: #f56c6c">{{ formatCurrency(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="t('common.status')"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="issueDate"
          :label="t('invoice.issueDate')"
          width="120"
        >
          <template #default="{ row }">
            {{ formatDate(row.issueDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="dueDate"
          :label="t('invoice.dueDate')"
          width="120"
        >
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row) }">{{ formatDate(row.dueDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('common.action')"
          width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleView(row)"
            >
              {{ t('common.view') }}
            </el-button>
            <el-button
              type="success"
              link
              @click="handleDownloadPdf(row)"
            >
              {{ t('invoice.downloadPdf') }}
            </el-button>
            <el-button
              v-if="row.status === 'unpaid'"
              type="warning"
              link
              @click="handleMarkPaid(row)"
            >
              {{ t('invoice.markPaid') }}
            </el-button>
            <el-button
              v-if="row.status === 'unpaid'"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              {{ t('invoice.cancel') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 撤销請求書对话框 -->
    <el-dialog
      v-model="cancelVisible"
      :title="t('invoice.cancelInvoice')"
      width="500px"
    >
      <el-form :model="cancelForm">
        <el-form-item
          :label="t('invoice.cancelReason')"
          required
        >
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="3"
            :placeholder="t('invoice.enterCancelReason')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          type="danger"
          @click="confirmCancel"
        >
          {{ t('invoice.confirmCancel') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'
import { formatDateTime, formatDate, formatCurrency } from '../utils/format'

const { t } = useI18n()
const router = useRouter()

const tableData = ref([])
const createVisible = ref(false)
const cancelVisible = ref(false)
const customers = ref([])
const customerOrders = ref([])
const selectedOrders = ref([])
const currentCancelInvoice = ref(null)

const createForm = reactive({ customerId: '', orderIds: [] })
const cancelForm = reactive({ reason: '' })

const getStatusType = (status) => {
  const map = { unpaid: 'warning', paid: 'success', overdue: 'danger', cancelled: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { unpaid: t('invoice.unpaid'), paid: t('invoice.paid'), overdue: t('invoice.overdue'), cancelled: t('invoice.cancelled') }
  return map[status] || status
}

const isOverdue = (row) => {
  return row.status === 'unpaid' && new Date(row.dueDate) < new Date()
}

const loadData = async () => {
  try {
    const res = await api.get('/invoices')
    tableData.value = res.data.data || []
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleCreate = () => {
  router.push('/invoice-generate')
}

const handleView = (row) => {
  router.push(`/invoice/${row.id}`)
}

const handleDownloadPdf = async (row) => {
  try {
    window.open(`/api/invoices/${row.id}/pdf`, '_blank')
    ElMessage.success(t('messages.operationSuccess'))
  } catch (e) {
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

const handleCancel = (row) => {
  currentCancelInvoice.value = row
  cancelForm.reason = ''
  cancelVisible.value = true
}

const confirmCancel = async () => {
  if (!cancelForm.reason.trim()) {
    ElMessage.warning(t('invoice.cancelReasonRequired'))
    return
  }
  try {
    await api.put(`/invoices/${currentCancelInvoice.value.id}/cancel`, {
      reason: cancelForm.reason
    })
    ElMessage.success(t('invoice.cancelSuccess'))
    cancelVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('messages.operationFailed'))
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

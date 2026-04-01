<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('order.title') }}</span>
          <div>
            <el-select
              v-model="filterStatus"
              :placeholder="t('common.status')"
              style="width: 120px; margin-right: 10px"
              @change="loadData"
            >
              <el-option
                :label="t('common.all')"
                value=""
              />
              <el-option
                :label="t('order.pending')"
                value="pending"
              />
              <el-option
                :label="t('order.confirmed')"
                value="confirmed"
              />
              <el-option
                :label="t('order.completed')"
                value="completed"
              />
              <el-option
                :label="t('order.cancelled')"
                value="cancelled"
              />
            </el-select>
            <el-button
              type="primary"
              icon="Printer"
              @click="handlePrint"
            >
              {{ t('common.print') }}
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          prop="orderNo"
          :label="t('order.orderNo')"
          width="180"
        />
        <el-table-column
          prop="companyName"
          :label="t('order.customer')"
          min-width="150"
        />
        <el-table-column
          prop="contactPerson"
          :label="t('order.receiver')"
          width="100"
        />
        <el-table-column
          prop="contactPhone"
          :label="t('common.phone')"
          width="130"
        />
        <el-table-column
          prop="totalAmount"
          :label="t('order.amount')"
          width="100"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="t('common.status')"
          width="90"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('invoice.generated')"
          width="140"
          align="center"
        >
          <template #default="{ row }">
            <template v-if="row.invoiceId">
              <el-tag
                type="success"
                size="small"
              >
                {{ t('invoice.yes') }}
              </el-tag>
              <el-tag
                v-if="row.invoiceStatus"
                :type="getInvoiceStatusType(row.invoiceStatus)"
                size="small"
                style="margin-left: 4px"
              >
                {{ getInvoiceStatusText(row.invoiceStatus) }}
              </el-tag>
            </template>
            <el-tag
              v-else
              type="info"
              size="small"
            >
              {{ t('invoice.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          :label="t('order.orderTime')"
          width="160"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
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
              {{ t('common.detail') }}
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleConfirm(row)"
            >
              {{ t('order.confirm') }}
            </el-button>
            <el-button
              v-if="row.status === 'confirmed'"
              type="info"
              link
              @click="handleComplete(row)"
            >
              {{ t('order.complete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'

const { t } = useI18n()

const tableData = ref([])
const detailVisible = ref(false)
const currentOrder = ref(null)
const filterStatus = ref('')
const selectedOrders = ref([])

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const getStatusType = (status) => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: t('order.pending'), confirmed: t('order.confirmed'), completed: t('order.completed'), cancelled: t('order.cancelled') }
  return map[status] || status
}

const getInvoiceStatusType = (status) => {
  const map = { unpaid: 'warning', paid: 'success', overdue: 'danger', cancelled: 'info' }
  return map[status] || 'info'
}

const getInvoiceStatusText = (status) => {
  const map = { unpaid: t('invoice.unpaid'), paid: t('invoice.paid'), overdue: t('invoice.overdue'), cancelled: t('invoice.cancelled') }
  return map[status] || status
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/orders', { params })
    tableData.value = res.data.data || []
    pagination.total = res.data.total || 0
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleView = (row) => {
  router.push(`/order/${row.id}`)
}

const handleConfirm = async (row) => {
  try {
    await api.put(`/orders/${row.id}/confirm`)
    ElMessage.success(t('messages.operationSuccess'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleComplete = async (row) => {
  try {
    await api.put(`/orders/${row.id}/complete`)
    ElMessage.success(t('messages.operationSuccess'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handlePrint = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning(t('messages.selectOrderToPrint'))
    return
  }
  // 如果是批量打印，通常跳转到专门的批量页面，或者如果是单个，跳转到详情页打印
  if (selectedOrders.value.length === 1) {
    router.push(`/order/${selectedOrders.value[0].id}?print=true`)
  } else {
    ElMessage.info(t('messages.batchPrintNotSupported'))
  }
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.total-section { text-align: right; margin-top: 20px; line-height: 2; }
.total-section .total { font-size: 18px; font-weight: bold; color: #f56c6c; }
</style>

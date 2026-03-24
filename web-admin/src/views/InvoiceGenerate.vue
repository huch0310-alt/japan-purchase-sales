<template>
  <div class="invoice-generate">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('nav.invoiceGenerate') }}</span>
          <el-tag type="info">{{ t('invoice.onlyCompletedOrders') }}</el-tag>
        </div>
      </template>

      <div class="filter-section">
        <el-select v-model="filterCustomerId" :placeholder="t('order.selectCustomer')" clearable filterable @change="loadOrders">
          <el-option v-for="c in customers" :key="c.id" :label="c.companyName" :value="c.id" />
        </el-select>
      </div>

      <el-table ref="orderTable" :data="orders" @selection-change="handleSelectionChange" v-loading="loading">
        <el-table-column type="selection" width="55" :selectable="checkSelectable" />
        <el-table-column prop="orderNo" :label="t('order.orderNo')" width="180" />
        <el-table-column prop="customer.companyName" :label="t('order.customer')" />
        <el-table-column prop="totalAmount" :label="t('order.totalAmount')" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }} <!-- TODO: i18n currency symbol when available -->
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('order.orderTime')" width="160" />
        <el-table-column prop="invoiceId" :label="t('invoice.status')" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.invoiceId" type="success">{{ t('invoice.alreadyInvoiced') }}</el-tag>
            <el-tag v-else type="info">{{ t('invoice.available') }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="action-bar">
        <el-button type="primary" :disabled="selectedOrders.length === 0" @click="generateInvoice">
          {{ t('invoice.generate') }} ({{ selectedOrders.length }})
        </el-button>
      </div>
    </el-card>

    <!-- 生成确认对话框 -->
    <el-dialog v-model="showConfirmDialog" :title="t('invoice.confirmGenerate')" width="500px">
      <p>{{ t('invoice.confirmMessage', { count: selectedOrders.length, total: selectedAmount }) }}</p>
      <el-form :model="invoiceForm">
        <el-form-item :label="t('invoice.dueDate')">
          <el-date-picker v-model="invoiceForm.dueDate" type="date" :placeholder="t('invoice.selectDueDate')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirmDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmGenerate">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const loading = ref(false)
const customers = ref([])
const orders = ref([])
const selectedOrders = ref([])
const filterCustomerId = ref('')
const showConfirmDialog = ref(false)
const invoiceForm = ref({ dueDate: null })

const selectedAmount = computed(() => {
  return selectedOrders.value.reduce((sum, o) => sum + Number(o.totalAmount), 0)
})

const checkSelectable = (row) => !row.invoiceId

const loadCustomers = async () => {
  try {
    const res = await api.get('/customers')
    customers.value = res.data
  } catch (e) {
    console.error('Failed to load customers:', e)
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = filterCustomerId.value ? { customerId: filterCustomerId.value } : {}
    const res = await api.get('/orders/available-for-invoice', { params })
    orders.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const generateInvoice = () => {
  if (selectedOrders.value.length === 0) return

  // 检查是否同一客户
  const customerIds = [...new Set(selectedOrders.value.map(o => o.customerId))]
  if (customerIds.length > 1) {
    ElMessage.error(t('invoice.mustSameCustomer'))
    return
  }

  // 设置默认到期日（30天后）
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  invoiceForm.value.dueDate = dueDate

  showConfirmDialog.value = true
}

const confirmGenerate = async () => {
  if (!invoiceForm.value.dueDate) {
    ElMessage.error(t('invoice.pleaseSelectDueDate'))
    return
  }
  const customerId = selectedOrders.value[0].customerId
  const orderIds = selectedOrders.value.map(o => o.id)

  try {
    await api.post('/invoices', {
      customerId,
      orderIds,
      dueDate: invoiceForm.value.dueDate,
    })
    ElMessage.success(t('invoice.generateSuccess'))
    showConfirmDialog.value = false
    loadOrders()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || t('invoice.generateFailed'))
  }
}

onMounted(() => {
  loadCustomers()
  loadOrders()
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-section { margin-bottom: 20px; }
.action-bar { margin-top: 20px; text-align: right; }
</style>

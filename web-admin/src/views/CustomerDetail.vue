<template>
  <div class="customer-detail-page">
    <el-page-header @back="goBack" :content="t('nav.customerDetail')">
      <template #extra>
        <el-button type="primary" @click="handleEdit">{{ t('common.edit') }}</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span>{{ t('customer.basicInfo') }}</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('customer.username')">{{ customer.username }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.companyName')">{{ customer.companyName }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.contactPerson')">{{ customer.contactPerson }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.contactPhone')">{{ customer.phone }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.deliveryAddress')">{{ customer.address }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.vipDiscount')">{{ ((customer.vipDiscount || 0) * 100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item :label="t('common.status')">
              <el-tag :type="customer.isActive ? 'success' : 'danger'">
                {{ customer.isActive ? t('customer.normal') : t('customer.disabled') }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header><span>{{ t('customer.invoiceInfo') }}</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('customer.invoiceName')">{{ customer.invoiceName || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.companyAddress')">{{ customer.invoiceAddress || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.phone')">{{ customer.invoicePhone || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.bankAccount')">{{ customer.invoiceBank || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>{{ t('order.title') }}</span>
        </div>
      </template>
      <el-table :data="orders" border>
        <el-table-column prop="orderNo" :label="t('order.orderNo')" width="180" />
        <el-table-column prop="totalAmount" :label="t('order.amount')" width="100">
          <template #default="{ row }">¥{{ Number(row.totalAmount || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag>{{ getOrderStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('order.orderTime')" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header><span>{{ t('report.customerRanking') }}</span></template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">{{ t('order.total') }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ formatCurrency(stats.totalAmount) }}</div>
            <div class="stat-label">{{ t('order.total') }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">¥{{ Number(stats.avgAmount || 0).toLocaleString() }}</div>
            <div class="stat-label">{{ t('order.amount') }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.lastOrderDate }}</div>
            <div class="stat-label">{{ t('order.orderTime') }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="editVisible" :title="t('customer.editCustomer')" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.companyName')">
              <el-input v-model="editForm.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.vipDiscount')">
              <el-input-number v-model="editForm.vipDiscount" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.contactPerson')">
              <el-input v-model="editForm.contactPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.contactPhone')">
              <el-input v-model="editForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('customer.deliveryAddress')">
          <el-input v-model="editForm.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'
import { formatDateTime, formatDate, formatCurrency } from '../utils/format'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const customer = ref({})
const orders = ref([])
const editVisible = ref(false)
const editForm = ref({})
const stats = ref({ orderCount: 0, totalAmount: 0, avgAmount: 0, lastOrderDate: '-' })

const getOrderStatusText = (status) => {
  const map = { pending: t('order.pending'), confirmed: t('order.confirmed'), completed: t('order.completed'), cancelled: t('order.cancelled') }
  return map[status] || status
}

const loadData = async () => {
  try {
    const res = await api.get(`/customers/${route.params.id}`)
    customer.value = res.data
    // VIP折扣：数据库存储0.10，转换为10%显示
    editForm.value = {
      ...res.data,
      vipDiscount: res.data.vipDiscount ? res.data.vipDiscount * 100 : 100
    }

    // 获取客户订单
    const orderRes = await api.get('/orders', { params: { customerId: route.params.id } })
    orders.value = orderRes.data

    // 计算统计数据
    const totalAmount = orders.value.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    stats.value = {
      orderCount: orders.value.length,
      totalAmount: totalAmount.toLocaleString(),
      avgAmount: orders.value.length ? (totalAmount / orders.value.length).toFixed(0) : 0,
      lastOrderDate: orders.value.length ? formatDate(orders.value[0].createdAt) : '-'
    }
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const goBack = () => router.back()

const handleEdit = () => {
  editVisible.value = true
}

const handleSubmit = async () => {
  try {
    // VIP折扣：用户输入10%，转换为0.10存储到数据库
    const submitData = {
      ...editForm.value,
      vipDiscount: Number(editForm.value.vipDiscount) / 100
    }
    await api.put(`/customers/${customer.value.id}`, submitData)
    ElMessage.success(t('messages.updateSuccess'))
    editVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.stat-card { text-align: center; padding: 20px; }
.stat-value { font-size: 24px; font-weight: bold; color: #409eff; }
.stat-label { color: #999; margin-top: 8px; }
</style>

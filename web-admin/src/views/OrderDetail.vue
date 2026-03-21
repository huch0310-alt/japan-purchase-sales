<template>
  <div class="order-detail-page">
    <el-page-header @back="goBack" :content="t('nav.orderDetail')">
      <template #extra>
        <el-button v-if="order.status === 'pending'" type="primary" @click="handleConfirm">{{ t('order.confirmOrder') }}</el-button>
        <el-button v-if="order.status === 'confirmed'" type="success" @click="handleComplete">{{ t('order.complete') }}</el-button>
        <el-button type="warning" @click="handlePrint">{{ t('common.print') }}</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header><span>{{ t('order.orderDetails') }}</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="t('order.orderNo')">{{ order.orderNo }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.status')">
              <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="t('order.customer')">{{ order.customer?.companyName }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.receiver')">{{ order.contactPerson }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.phone')">{{ order.contactPhone }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.orderTime')">{{ order.createdAt }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.confirmed')" v-if="order.confirmedAt">{{ order.confirmedAt }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.completed')" v-if="order.completedAt">{{ order.completedAt }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.deliveryAddress')" :span="2">{{ order.deliveryAddress }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.remark')" :span="2">{{ order.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header><span>{{ t('order.productDetails') }}</span></template>
          <el-table :data="order.items" border>
            <el-table-column prop="productName" :label="t('dashboard.productName')" />
            <el-table-column prop="quantity" :label="t('dashboard.salesQuantity')" width="80" />
            <el-table-column prop="unitPrice" :label="t('product.salePrice')" width="100">
              <template #default="{ row }">¥{{ row.unitPrice }}</template>
            </el-table-column>
            <el-table-column :label="t('order.subtotal')" width="100">
              <template #default="{ row }">¥{{ (row.unitPrice * row.quantity).toFixed(0) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header><span>{{ t('order.amountInfo') }}</span></template>
          <div class="price-info">
            <div class="price-item">
              <span>{{ t('order.subtotalNoTax') }}:</span>
              <span>¥{{ order.subtotal }}</span>
            </div>
            <div class="price-item">
              <span>{{ t('order.discount') }}:</span>
              <span>-¥{{ order.discountAmount }}</span>
            </div>
            <div class="price-item">
              <span>{{ t('order.taxAmount') }}:</span>
              <span>¥{{ order.taxAmount }}</span>
            </div>
            <el-divider />
            <div class="price-item total">
              <span>{{ t('order.total') }}:</span>
              <span>¥{{ order.totalAmount }}</span>
            </div>
          </div>
        </el-card>

        <el-card style="margin-top: 20px" v-if="order.customer">
          <template #header><span>{{ t('order.customerInfo') }}</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item :label="t('settings.companyName')">{{ order.customer.companyName }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.contact')">{{ order.customer.contactPerson }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.phone')">{{ order.customer.phone }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.address')">{{ order.customer.address }}</el-descriptions-item>
            <el-descriptions-item :label="t('customer.vipDiscount')">{{ order.customer.vipDiscount }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const order = ref({ items: [] })

const getStatusType = (status) => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: t('order.pending'),
    confirmed: t('order.confirmed'),
    completed: t('order.completed'),
    cancelled: t('order.cancelled')
  }
  return map[status] || status
}

const loadData = async () => {
  try {
    const res = await api.get(`/orders/${route.params.id}`)
    order.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const goBack = () => router.back()

const handleConfirm = async () => {
  try {
    await api.put(`/orders/${order.value.id}/confirm`)
    ElMessage.success(t('messages.operationSuccess'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleComplete = async () => {
  try {
    await api.put(`/orders/${order.value.id}/complete`)
    ElMessage.success(t('messages.operationSuccess'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handlePrint = () => {
  window.print()
}

onMounted(() => loadData())
</script>

<style scoped>
.price-info { padding: 10px; }
.price-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
.price-item.total { font-size: 18px; font-weight: bold; color: #f56c6c; }
</style>

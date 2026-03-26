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
            <el-descriptions-item :label="t('order.orderTime')">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.confirmed')" v-if="order.confirmedAt">{{ formatDateTime(order.confirmedAt) }}</el-descriptions-item>
            <el-descriptions-item :label="t('order.completed')" v-if="order.completedAt">{{ formatDateTime(order.completedAt) }}</el-descriptions-item>
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
              <template #default="{ row }">{{ formatCurrency(Number(row.unitPrice || 0) * Number(row.quantity || 0)) }}</template>
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
              <span>{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div class="price-item">
              <span>{{ t('order.discount') }}:</span>
              <span>-{{ formatCurrency(order.discountAmount) }}</span>
            </div>
            <div class="price-item">
              <span>{{ t('order.taxAmount') }}:</span>
              <span>{{ formatCurrency(order.taxAmount) }}</span>
            </div>
            <el-divider />
            <div class="price-item total">
              <span>{{ t('order.total') }}:</span>
              <span>{{ formatCurrency(order.totalAmount) }}</span>
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
            <el-descriptions-item :label="t('customer.vipDiscount')">{{ ((order.customer.vipDiscount || 0) * 100).toFixed(0) }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 打印专用区域 -->
    <div class="print-area" id="printArea">
      <div class="print-header">
        <h1>注文書</h1>
        <div class="print-info">
          <p>注文番号: {{ order.orderNo }}</p>
          <p>発行日: {{ formatDateTime(order.createdAt) }}</p>
        </div>
      </div>

      <div class="print-section">
        <h3>注文者情報</h3>
        <table class="print-table">
          <tr><td>会社名</td><td>{{ order.customer?.companyName }}</td></tr>
          <tr><td>担当者</td><td>{{ order.contactPerson }}</td></tr>
          <tr><td>電話番号</td><td>{{ order.contactPhone }}</td></tr>
          <tr><td>配送先住所</td><td>{{ order.deliveryAddress }}</td></tr>
        </table>
      </div>

      <div class="print-section">
        <h3>注文商品</h3>
        <table class="print-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>数量</th>
              <th>単価</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ Number(item.unitPrice).toLocaleString() }}</td>
              <td>¥{{ (Number(item.unitPrice) * Number(item.quantity)).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="print-section">
        <table class="print-table summary-table">
          <tr><td>小計（税抜）:</td><td>{{ formatCurrency(order.subtotal) }}</td></tr>
          <tr><td>割引:</td><td>-{{ formatCurrency(order.discountAmount) }}</td></tr>
          <tr><td>消費税:</td><td>{{ formatCurrency(order.taxAmount) }}</td></tr>
          <tr class="total-row"><td>合計（税込）:</td><td>{{ formatCurrency(order.totalAmount) }}</td></tr>
        </table>
      </div>

      <div class="print-footer">
        <p>備考: {{ order.remark || 'なし' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'

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
  const printContent = document.getElementById('printArea')
  const originalContent = document.body.innerHTML

  document.body.innerHTML = printContent.innerHTML
  window.print()
  document.body.innerHTML = originalContent
  location.reload()
}

onMounted(() => loadData())
</script>

<style scoped>
.price-info { padding: 10px; }
.price-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
.price-item.total { font-size: 18px; font-weight: bold; color: #f56c6c; }

/* 打印区域默认隐藏 */
.print-area {
  display: none;
}

/* 打印样式 */
@media print {
  /* 隐藏所有非打印区域 */
  .el-page-header,
  .el-row,
  .el-button,
  .no-print {
    display: none !important;
  }

  /* 显示打印区域 */
  .print-area {
    display: block !important;
    padding: 20px;
    font-family: "Noto Sans JP", "Meiryo", sans-serif;
    font-size: 12px;
    line-height: 1.6;
  }

  .print-area h1 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }

  .print-header {
    margin-bottom: 20px;
  }

  .print-info {
    display: flex;
    justify-content: space-between;
  }

  .print-section {
    margin-bottom: 20px;
  }

  .print-section h3 {
    background: #f5f5f5;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .print-table td,
  .print-table th {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .print-table th {
    background: #f9f9f9;
    font-weight: bold;
  }

  .summary-table {
    margin-left: auto;
    width: 300px;
  }

  .summary-table td:last-child {
    text-align: right;
  }

  .total-row {
    font-weight: bold;
    font-size: 14px;
    background: #f9f9f9;
  }

  .print-footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }

  @page {
    size: A4;
    margin: 15mm;
  }
}
</style>

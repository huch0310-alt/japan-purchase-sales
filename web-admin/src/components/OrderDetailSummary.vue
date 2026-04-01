<template>
  <div class="no-print">
    <el-card>
      <template #header>
        <span>{{ t('order.amountInfo') }}</span>
      </template>
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

    <el-card
      v-if="order.customer"
      style="margin-top: 20px"
    >
      <template #header>
        <span>{{ t('order.customerInfo') }}</span>
      </template>
      <el-descriptions
        :column="1"
        border
        size="small"
      >
        <el-descriptions-item :label="t('settings.companyName')">
          {{ order.customer.companyName }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.contact')">
          {{ order.customer.contactPerson }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.phone')">
          {{ order.customer.phone }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.address')">
          {{ order.customer.address }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('customer.vipDiscount')">
          {{ order.customer.vipDiscount || 0 }}%
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '../utils/format'

const { t } = useI18n()

defineProps({
  order: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.price-info { padding: 10px; }
.price-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
.price-item.total { font-size: 18px; font-weight: bold; color: #f56c6c; }
</style>

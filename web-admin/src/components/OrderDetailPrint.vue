<template>
  <!-- 打印专用区域 -->
  <div
    id="printArea"
    class="print-area"
  >
    <div class="print-header">
      <h1>{{ t('order.orderReceipt') }}</h1>
      <div class="print-info">
        <div>
          <p><strong>{{ t('order.orderNo') }}:</strong> {{ order.orderNo }}</p>
          <p><strong>{{ t('order.orderTime') }}:</strong> {{ formatDateTime(order.createdAt) }}</p>
        </div>
        <div style="text-align: right">
          <p><strong>{{ t('order.customer') }}:</strong> {{ order.customer?.companyName }}</p>
          <p><strong>{{ t('order.receiver') }}:</strong> {{ order.contactPerson }}</p>
        </div>
      </div>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th>{{ t('dashboard.productName') }}</th>
          <th width="80">
            {{ t('dashboard.salesQuantity') }}
          </th>
          <th width="100">
            {{ t('product.salePrice') }}
          </th>
          <th width="100">
            {{ t('order.subtotal') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in order.items"
          :key="item.id"
        >
          <td>{{ item.productName }}</td>
          <td align="center">
            {{ item.quantity }}
          </td>
          <td align="right">
            {{ formatCurrency(item.unitPrice) }}
          </td>
          <td align="right">
            {{ formatCurrency(Number(item.unitPrice) * Number(item.quantity)) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="print-summary">
      <div class="summary-line">
        <span>{{ t('order.subtotalNoTax') }}:</span>
        <span>{{ formatCurrency(order.subtotal) }}</span>
      </div>
      <div
        v-if="order.discountAmount > 0"
        class="summary-line"
      >
        <span>{{ t('order.discount') }}:</span>
        <span>-{{ formatCurrency(order.discountAmount) }}</span>
      </div>
      <div class="summary-line">
        <span>{{ t('order.taxAmount') }}:</span>
        <span>{{ formatCurrency(order.taxAmount) }}</span>
      </div>
      <div class="summary-line total">
        <span>{{ t('order.total') }}:</span>
        <span>{{ formatCurrency(order.totalAmount) }}</span>
      </div>
    </div>

    <div class="print-footer">
      <p v-if="order.remark">
        <strong>{{ t('common.remark') }}:</strong> {{ order.remark }}
      </p>
      <p style="margin-top: 20px; text-align: center; color: #666; font-size: 10px;">
        {{ t('order.printTime') }}: {{ formatDateTime(new Date()) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { formatDateTime, formatCurrency } from '../utils/format'

const { t } = useI18n()

defineProps({
  order: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* 打印区域默认隐藏 */
.print-area {
  display: none;
}

/* 打印样式 */
@media print {
  /* 显示并优化打印区域 */
  .print-area {
    display: block !important;
    padding: 0;
    margin: 0;
    color: #000;
    background: #fff;
    width: 100%;
  }

  .print-header {
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  }

  .print-header h1 {
    text-align: center;
    font-size: 28px;
    margin: 0 0 15px 0;
  }

  .print-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .print-info p {
    margin: 5px 0;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .print-table th, .print-table td {
    border: 1px solid #000;
    padding: 8px;
    font-size: 12px;
  }

  .print-table th {
    background-color: #f2f2f2 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-summary {
    margin-left: auto;
    width: 250px;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 12px;
  }

  .summary-line.total {
    font-weight: bold;
    font-size: 16px;
    border-top: 1px solid #000;
    margin-top: 5px;
    padding-top: 10px;
  }

  .print-footer {
    margin-top: 40px;
    font-size: 12px;
  }

  @page {
    size: A4;
    margin: 20mm;
  }
}
</style>

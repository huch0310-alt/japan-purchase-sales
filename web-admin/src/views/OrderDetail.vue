<template>
  <div class="order-detail-page">
    <el-page-header @back="goBack" content="订单详情">
      <template #extra>
        <el-button v-if="order.status === 'pending'" type="primary" @click="handleConfirm">确认订单</el-button>
        <el-button v-if="order.status === 'confirmed'" type="success" @click="handleComplete">完成订单</el-button>
        <el-button type="warning" @click="handlePrint">打印订单</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header><span>订单信息</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户">{{ order.customer?.companyName }}</el-descriptions-item>
            <el-descriptions-item label="收货人">{{ order.contactPerson }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ order.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ order.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="确认时间" v-if="order.confirmedAt">{{ order.confirmedAt }}</el-descriptions-item>
            <el-descriptions-item label="完成时间" v-if="order.completedAt">{{ order.completedAt }}</el-descriptions-item>
            <el-descriptions-item label="送货地址" :span="2">{{ order.deliveryAddress }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ order.remark || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header><span>商品明细</span></template>
          <el-table :data="order.items" border>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unitPrice" label="单价" width="100">
              <template #default="{ row }">¥{{ row.unitPrice }}</template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="{ row }">¥{{ (row.unitPrice * row.quantity).toFixed(0) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header><span>金额信息</span></template>
          <div class="price-info">
            <div class="price-item">
              <span>小计（税拔）:</span>
              <span>¥{{ order.subtotal }}</span>
            </div>
            <div class="price-item">
              <span>VIP折扣:</span>
              <span>-¥{{ order.discountAmount }}</span>
            </div>
            <div class="price-item">
              <span>消费税:</span>
              <span>¥{{ order.taxAmount }}</span>
            </div>
            <el-divider />
            <div class="price-item total">
              <span>合计:</span>
              <span>¥{{ order.totalAmount }}</span>
            </div>
          </div>
        </el-card>

        <el-card style="margin-top: 20px" v-if="order.customer">
          <template #header><span>客户信息</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="公司名称">{{ order.customer.companyName }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ order.customer.contactPerson }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ order.customer.phone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ order.customer.address }}</el-descriptions-item>
            <el-descriptions-item label="VIP折扣">{{ order.customer.vipDiscount }}%</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const route = useRoute()
const router = useRouter()

const order = ref({ items: [] })

const getStatusType = (status) => {
  const map = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const loadData = async () => {
  try {
    const res = await api.get(`/orders/${route.params.id}`)
    order.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const goBack = () => router.back()

const handleConfirm = async () => {
  try {
    await api.put(`/orders/${order.value.id}/confirm`)
    ElMessage.success('确认成功')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleComplete = async () => {
  try {
    await api.put(`/orders/${order.value.id}/complete`)
    ElMessage.success('已完成')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
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

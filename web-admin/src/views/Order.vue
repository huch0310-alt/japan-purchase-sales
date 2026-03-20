<template>
  <div class="order-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div>
            <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="待确认" value="pending" />
              <el-option label="已确认" value="confirmed" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-button type="primary" icon="Printer" @click="handlePrint">打印</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="companyName" label="客户" min-width="150" />
        <el-table-column prop="contactPerson" label="收货人" width="100" />
        <el-table-column prop="contactPhone" label="电话" width="130" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link @click="handleConfirm(row)">确认</el-button>
            <el-button v-if="row.status === 'confirmed'" type="info" link @click="handleComplete(row)">完成</el-button>
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

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px">
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="客户">{{ currentOrder.customer?.companyName }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="送货地址" :span="2">{{ currentOrder.deliveryAddress }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>商品明细</el-divider>
        <el-table :data="currentOrder.items" border>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="unitPrice" label="单价" width="100">
            <template #default="{ row }">¥{{ row.unitPrice }}</template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">¥{{ row.unitPrice * row.quantity }}</template>
          </el-table-column>
        </el-table>

        <div class="total-section">
          <div>小计: ¥{{ currentOrder.subtotal }}</div>
          <div>VIP折扣: -¥{{ currentOrder.discountAmount }}</div>
          <div>消费税: ¥{{ currentOrder.taxAmount }}</div>
          <div class="total">合计: ¥{{ currentOrder.totalAmount }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentOrder?.status === 'pending'" type="primary" @click="handleConfirm(currentOrder)">确认订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

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
  const map = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/orders', { params })
    tableData.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const handleView = async (row) => {
  try {
    const res = await api.get(`/orders/${row.id}`)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

const handleConfirm = async (row) => {
  try {
    await api.put(`/orders/${row.id}/confirm`)
    ElMessage.success('确认成功')
    detailVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleComplete = async (row) => {
  try {
    await api.put(`/orders/${row.id}/complete`)
    ElMessage.success('已完成')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handlePrint = () => {
  // TODO: 实现打印功能
  ElMessage.info('打印功能开发中')
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

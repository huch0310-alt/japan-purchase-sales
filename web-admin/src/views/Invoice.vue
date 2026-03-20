<template>
  <div class="invoice-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账单管理</span>
          <div>
            <el-button type="primary" @click="handleCreate">生成請求書</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="invoiceNo" label="請求書番号" width="180" />
        <el-table-column prop="companyName" label="客户" min-width="150" />
        <el-table-column prop="subtotal" label="小计（税拔）" width="120">
          <template #default="{ row }">¥{{ row.subtotal }}</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="消费税" width="100">
          <template #default="{ row }">¥{{ row.taxAmount }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="税込合计" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #f56c6c">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueDate" label="开具日期" width="120" />
        <el-table-column prop="dueDate" label="到期日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'overdue': isOverdue(row) }">{{ row.dueDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="handleDownloadPdf(row)">下载PDF</el-button>
            <el-button v-if="row.status === 'unpaid'" type="warning" link @click="handleMarkPaid(row)">标记付款</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 生成請求書对话框 -->
    <el-dialog v-model="createVisible" title="生成請求書" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="选择客户">
          <el-select v-model="createForm.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c.id" :label="c.companyName" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择订单">
          <el-table :data="customerOrders" border @selection-change="handleOrderSelect">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column prop="totalAmount" label="金额">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" />
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const tableData = ref([])
const createVisible = ref(false)
const customers = ref([])
const customerOrders = ref([])
const selectedOrders = ref([])

const createForm = reactive({ customerId: '', orderIds: [] })

const getStatusType = (status) => {
  const map = { unpaid: 'warning', paid: 'success', overdue: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { unpaid: '未払い', paid: '支払済', overdue: '期限超過' }
  return map[status] || status
}

const isOverdue = (row) => {
  return row.status === 'unpaid' && new Date(row.dueDate) < new Date()
}

const loadData = async () => {
  try {
    const res = await api.get('/invoices')
    tableData.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const loadCustomers = async () => {
  try {
    const res = await api.get('/customers')
    customers.value = res.data
  } catch (e) {
    ElMessage.error('加载客户失败')
  }
}

const handleCreate = async () => {
  await loadCustomers()
  createVisible.value = true
}

watch(() => createForm.customerId, async (customerId) => {
  if (!customerId) {
    customerOrders.value = []
    return
  }
  try {
    const res = await api.get('/orders', { params: { customerId, status: 'confirmed' } })
    customerOrders.value = res.data
  } catch (e) {
    ElMessage.error('加载订单失败')
  }
})

const handleOrderSelect = (selection) => {
  selectedOrders.value = selection
}

const handleSubmitCreate = async () => {
  if (!createForm.customerId || selectedOrders.value.length === 0) {
    ElMessage.warning('请选择客户和订单')
    return
  }
  try {
    await api.post('/invoices', {
      customerId: createForm.customerId,
      orderIds: selectedOrders.value.map(o => o.id)
    })
    ElMessage.success('請求書生成成功')
    createVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('生成失败')
  }
}

const handleView = (row) => {
  // TODO: 跳转到請求書详情页
}

const handleDownloadPdf = async (row) => {
  // TODO: 实现PDF下载
  ElMessage.info('PDF下载功能开发中')
}

const handleMarkPaid = async (row) => {
  try {
    await api.put(`/invoices/${row.id}/paid`)
    ElMessage.success('已标记为已付款')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
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

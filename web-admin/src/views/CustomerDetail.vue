<template>
  <div class="customer-detail-page">
    <el-page-header @back="goBack" content="客户详情">
      <template #extra>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span>基本信息</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="账号">{{ customer.username }}</el-descriptions-item>
            <el-descriptions-item label="公司名称">{{ customer.companyName }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ customer.contactPerson }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ customer.phone }}</el-descriptions-item>
            <el-descriptions-item label="送货地址">{{ customer.address }}</el-descriptions-item>
            <el-descriptions-item label="VIP折扣">{{ customer.vipDiscount }}%</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="customer.isActive ? 'success' : 'danger'">
                {{ customer.isActive ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header><span>請求書信息</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="請求書抬头">{{ customer.invoiceName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="公司地址">{{ customer.invoiceAddress || '-' }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ customer.invoicePhone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="银行账户">{{ customer.invoiceBank || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>订单记录</span>
        </div>
      </template>
      <el-table :data="orders" border>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag>{{ getOrderStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header><span>消费统计</span></template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">¥{{ stats.totalAmount }}</div>
            <div class="stat-label">消费总额</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">¥{{ stats.avgAmount }}</div>
            <div class="stat-label">平均订单金额</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ stats.lastOrderDate }}</div>
            <div class="stat-label">最后下单</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="editVisible" title="编辑客户" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="editForm.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="VIP折扣">
              <el-input-number v-model="editForm.vipDiscount" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="editForm.contactPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="editForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="送货地址">
          <el-input v-model="editForm.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api'

const route = useRoute()
const router = useRouter()

const customer = ref({})
const orders = ref([])
const editVisible = ref(false)
const editForm = ref({})
const stats = ref({ orderCount: 0, totalAmount: 0, avgAmount: 0, lastOrderDate: '-' })

const getOrderStatusText = (status) => {
  const map = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const loadData = async () => {
  try {
    const res = await api.get(`/customers/${route.params.id}`)
    customer.value = res.data
    editForm.value = { ...res.data }

    // 获取客户订单
    const orderRes = await api.get('/orders', { params: { customerId: route.params.id } })
    orders.value = orderRes.data

    // 计算统计数据
    const totalAmount = orders.value.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    stats.value = {
      orderCount: orders.value.length,
      totalAmount: totalAmount.toLocaleString(),
      avgAmount: orders.value.length ? (totalAmount / orders.value.length).toFixed(0) : 0,
      lastOrderDate: orders.value.length ? orders.value[0].createdAt.split('T')[0] : '-'
    }
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const goBack = () => router.back()

const handleEdit = () => {
  editVisible.value = true
}

const handleSubmit = async () => {
  try {
    await api.put(`/customers/${customer.value.id}`, editForm.value)
    ElMessage.success('更新成功')
    editVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.stat-card { text-align: center; padding: 20px; }
.stat-value { font-size: 24px; font-weight: bold; color: #409eff; }
.stat-label { color: #999; margin-top: 8px; }
</style>

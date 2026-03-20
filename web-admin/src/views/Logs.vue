<template>
  <div class="logs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="loadData"
              style="margin-right: 10px"
            />
            <el-select v-model="filterModule" placeholder="模块筛选" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="用户" value="users" />
              <el-option label="商品" value="products" />
              <el-option label="订单" value="orders" />
              <el-option label="請求書" value="invoices" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="userName" label="操作人" width="120" />
        <el-table-column prop="userRole" label="角色" width="100">
          <template #default="{ row }">
            <el-tag>{{ getRoleText(row.userRole) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="action" label="操作" width="100" />
        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="createdAt" label="操作时间" width="180" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const tableData = ref([])
const dateRange = ref([])
const filterModule = ref('')

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const getRoleText = (role) => {
  const map = { super_admin: '超级管理员', admin: '管理员', procurement: '采购', sales: '销售' }
  return map[role] || role
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }
    if (filterModule.value) params.module = filterModule.value
    const res = await api.get('/logs', { params })
    tableData.value = res.data
    pagination.total = res.data.length
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>

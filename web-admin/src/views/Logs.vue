<template>
  <div class="logs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('logs.title') }}</span>
          <div>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              :range-separator="t('report.startDate')"
              :start-placeholder="t('logs.startDate')"
              :end-placeholder="t('logs.endDate')"
              @change="loadData"
              style="margin-right: 10px"
            />
            <el-select v-model="filterModule" :placeholder="t('logs.moduleFilter')" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option :label="t('logs.all')" value="" />
              <el-option :label="t('logs.users')" value="users" />
              <el-option :label="t('logs.products')" value="products" />
              <el-option :label="t('logs.orders')" value="orders" />
              <el-option :label="t('logs.invoices')" value="invoices" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="userName" :label="t('logs.operator')" width="120" />
        <el-table-column prop="userRole" :label="t('logs.role')" width="100">
          <template #default="{ row }">
            <el-tag>{{ getRoleText(row.userRole) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" :label="t('logs.module')" width="100" />
        <el-table-column prop="action" :label="t('logs.action')" width="100" />
        <el-table-column prop="detail" :label="t('logs.detail')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" :label="t('logs.ip')" width="130" />
        <el-table-column prop="createdAt" :label="t('logs.operationTime')" width="180" />
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
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'

const { t } = useI18n()

const tableData = ref([])
const dateRange = ref([])
const filterModule = ref('')

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const getRoleText = (role) => {
  const map = {
    super_admin: t('staff.superAdmin'),
    admin: t('staff.admin'),
    procurement: t('staff.procurement'),
    sales: t('staff.sales')
  }
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
    ElMessage.error(t('messages.loadFailed'))
  }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>

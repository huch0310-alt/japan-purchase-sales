<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ t('product.title') }}</span>
        <div>
          <el-select
            v-model="filterStatus"
            :placeholder="t('product.statusFilter')"
            style="width: 120px; margin-right: 10px"
            @change="handleFilterChange"
          >
            <el-option
              :label="t('common.all')"
              value=""
            />
            <el-option
              :label="t('product.active')"
              value="active"
            />
            <el-option
              :label="t('product.inactive')"
              value="inactive"
            />
            <el-option
              :label="t('product.pending')"
              value="pending"
            />
          </el-select>
          <el-button
            type="success"
            style="margin-right: 10px"
            @click="handleAdd"
          >
            {{ t('product.addProduct') }}
          </el-button>
          <el-button
            type="primary"
            @click="handleRefresh"
          >
            {{ t('common.refresh') }}
          </el-button>
        </div>
      </div>
    </template>

    <el-table
      :data="tableData"
      border
      stripe
    >
      <el-table-column
        :label="t('product.productImage')"
        width="80"
      >
        <template #default="{ row }">
          <el-image
            v-if="row.photoUrl"
            :src="row.photoUrl"
            style="width: 50px; height: 50px"
            fit="cover"
          />
          <div
            v-else
            style="width: 50px; height: 50px; background: #eee; display: flex; align-items: center; justify-content: center"
          >
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        :label="t('product.title')"
        min-width="150"
      />
      <el-table-column
        :label="t('product.category')"
        width="100"
      >
        <template #default="{ row }">
          {{ row.category?.nameZh || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="quantity"
        :label="t('product.inventory')"
        width="80"
      />
      <el-table-column
        prop="unit"
        :label="t('product.unit')"
        width="60"
      />
      <el-table-column
        prop="purchasePrice"
        :label="t('product.purchasePrice')"
        width="100"
      >
        <template #default="{ row }">
          {{ formatCurrency(row.purchasePrice) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="salePrice"
        :label="t('product.salePrice')"
        width="100"
      >
        <template #default="{ row }">
          {{ formatCurrency(row.salePrice) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        :label="t('common.status')"
        width="90"
      >
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :label="t('common.createTime')"
        width="160"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('common.action')"
        width="150"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            @click="handleEdit(row)"
          >
            {{ t('common.edit') }}
          </el-button>
          <el-button
            :type="row.status === 'active' ? 'warning' : 'success'"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? t('product.offShelf') : t('product.onShelf') }}
          </el-button>
          <el-button
            type="danger"
            link
            @click="handleDelete(row)"
          >
            {{ t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="handlePageChange"
      @current-change="handlePageChange"
    />
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import api from '../api'
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'

const { t } = useI18n()

const emit = defineEmits(['add', 'edit', 'refresh'])

const tableData = ref([])
const filterStatus = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const getStatusType = (status) => {
  const map = { active: 'success', inactive: 'warning', pending: 'info', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { active: t('product.active'), inactive: t('product.inactive'), pending: t('product.pending'), approved: t('product.approved'), rejected: t('product.rejected') }
  return map[status] || status
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/products', { params })
    tableData.value = res.data.data || []
    pagination.total = res.data.total || 0
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleAdd = () => {
  emit('add')
}

const handleEdit = (row) => {
  emit('edit', row)
}

const handleToggleStatus = async (row) => {
  try {
    const endpoint = row.status === 'active' ? 'deactivate' : 'activate'
    await api.put(`/products/${row.id}/${endpoint}`)
    ElMessage.success(row.status === 'active' ? t('product.deactivated') : t('product.activated'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(t('messages.confirmDelete'), t('common.tip'), { type: 'warning' })
    .then(async () => {
      try {
        await api.delete(`/products/${row.id}`)
        ElMessage.success(t('messages.deleteSuccess'))
        loadData()
      } catch (e) {
        ElMessage.error(t('messages.deleteFailed'))
      }
    })
}

const handleFilterChange = () => {
  pagination.page = 1
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleRefresh = () => {
  loadData()
}

onMounted(() => {
  loadData()
})

defineExpose({
  loadData
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<template>
  <div class="product-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div>
            <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="上架" value="active" />
              <el-option label="下架" value="inactive" />
              <el-option label="待审核" value="pending" />
            </el-select>
            <el-button type="primary" @click="loadData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column label="商品图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.photoUrl"
              :src="row.photoUrl"
              style="width: 50px; height: 50px"
              fit="cover"
            />
            <div v-else style="width: 50px; height: 50px; background: #eee; display: flex; align-items: center; justify-content: center">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="quantity" label="库存" width="80" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="purchasePrice" label="采购价" width="90">
          <template #default="{ row }">¥{{ row.purchasePrice }}</template>
        </el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="90">
          <template #default="{ row }">¥{{ row.salePrice }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button :type="row.status === 'active' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑商品" width="600px">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量">
              <el-input-number v-model="form.quantity" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-select v-model="form.unit" allow-create filterable>
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价">
              <el-input-number v-model="form.purchasePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售价">
              <el-input-number v-model="form.salePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const filterStatus = ref('')
const formRef = ref()
const units = ref(['个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack', 'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  id: '',
  name: '',
  quantity: 0,
  unit: '',
  purchasePrice: 0,
  salePrice: 0,
  description: ''
})

const getStatusType = (status) => {
  const map = { active: 'success', inactive: 'warning', pending: 'info', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { active: '上架', inactive: '下架', pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/products', { params })
    tableData.value = res.data
    pagination.total = res.data.length
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  try {
    const endpoint = row.status === 'active' ? 'deactivate' : 'activate'
    await api.put(`/products/${row.id}/${endpoint}`)
    ElMessage.success(row.status === 'active' ? '已下架' : '已上架')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await api.delete(`/products/${row.id}`)
        ElMessage.success('删除成功')
        loadData()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

const handleSubmit = async () => {
  try {
    await api.put(`/products/${form.id}`, form)
    ElMessage.success('更新成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

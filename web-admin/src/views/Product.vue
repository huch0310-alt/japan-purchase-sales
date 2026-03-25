<template>
  <div class="product-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('product.title') }}</span>
          <div>
            <el-select v-model="filterStatus" :placeholder="t('product.statusFilter')" style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option :label="t('common.all')" value="" />
              <el-option :label="t('product.active')" value="active" />
              <el-option :label="t('product.inactive')" value="inactive" />
              <el-option :label="t('product.pending')" value="pending" />
            </el-select>
            <el-button type="success" style="margin-right: 10px" @click="handleAdd">{{ t('product.addProduct') }}</el-button>
            <el-button type="primary" @click="loadData">{{ t('common.refresh') }}</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column :label="t('product.productImage')" width="80">
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
        <el-table-column prop="name" :label="t('product.title')" min-width="150" />
        <el-table-column prop="categoryName" :label="t('product.category')" width="100" />
        <el-table-column prop="quantity" :label="t('product.inventory')" width="80" />
        <el-table-column prop="unit" :label="t('product.unit')" width="60" />
        <el-table-column prop="purchasePrice" :label="t('product.purchasePrice')" width="100">
          <template #default="{ row }">{{ formatCurrency(row.purchasePrice) }}</template>
        </el-table-column>
        <el-table-column prop="salePrice" :label="t('product.salePrice')" width="100">
          <template #default="{ row }">{{ formatCurrency(row.salePrice) }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="t('common.status')" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('common.createTime')" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button :type="row.status === 'active' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? t('product.offShelf') : t('product.onShelf') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
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

    <!-- 添加商品对话框 -->
    <el-dialog v-model="addDialogVisible" :title="t('product.addProduct')" width="600px">
      <el-form ref="addFormRef" :model="addForm" label-width="100px">
        <el-form-item :label="t('product.title')" prop="name">
          <el-input v-model="addForm.name" :placeholder="t('product.enterProductName')" />
        </el-form-item>
        <el-form-item :label="t('product.category')" prop="categoryId">
          <el-select v-model="addForm.categoryId" :placeholder="t('product.selectCategory')" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.inventory')" prop="quantity">
              <el-input-number v-model="addForm.quantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.unit')" prop="unit">
              <el-select v-model="addForm.unit" allow-create filterable style="width: 100%">
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.purchasePrice')" prop="purchasePrice">
              <el-input-number v-model="addForm.purchasePrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.salePrice')" prop="salePrice">
              <el-input-number v-model="addForm.salePrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('product.description')" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="3" :placeholder="t('product.enterDescription')" />
        </el-form-item>
        <el-form-item :label="t('product.productImage')" prop="photoUrl">
          <el-upload
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
            class="image-uploader"
          >
            <img v-if="addForm.photoUrl" :src="addForm.photoUrl" class="uploaded-image" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="addLoading" @click="handleAddSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="t('product.editProduct')" width="600px">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item :label="t('product.title')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.inventory')">
              <el-input-number v-model="form.quantity" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.unit')">
              <el-select v-model="form.unit" allow-create filterable>
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.purchasePrice')">
              <el-input-number v-model="form.purchasePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.salePrice')">
              <el-input-number v-model="form.salePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('product.description')">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="t('product.productImage')">
          <el-upload
            :before-upload="beforeImageUpload"
            :http-request="handleImageUploadEdit"
            :show-file-list="false"
            accept="image/*"
            class="image-uploader"
          >
            <img v-if="form.photoUrl" :src="form.photoUrl" class="uploaded-image" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../api'
import { formatDateTime } from '../utils/format'
import { formatCurrency } from '../utils/format'

const { t } = useI18n()

const tableData = ref([])
const dialogVisible = ref(false)
const addDialogVisible = ref(false)
const addLoading = ref(false)
const filterStatus = ref('')
const formRef = ref()
const addFormRef = ref()
const categories = ref([])
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
  description: '',
  photoUrl: ''
})

const addForm = reactive({
  name: '',
  categoryId: '',
  quantity: 0,
  unit: '个',
  purchasePrice: 0,
  salePrice: 0,
  description: '',
  photoUrl: ''
})

const getStatusType = (status) => {
  const map = { active: 'success', inactive: 'warning', pending: 'info', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { active: t('product.active'), inactive: t('product.inactive'), pending: t('product.pending'), approved: t('product.approved'), rejected: t('product.rejected') }
  return map[status] || status
}

const loadCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data || []
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const loadData = async () => {
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await api.get('/products', { params })
    tableData.value = res.data
    pagination.total = res.data.length
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleAdd = () => {
  Object.keys(addForm).forEach(key => {
    if (key === 'quantity') addForm[key] = 0
    else if (key === 'purchasePrice' || key === 'salePrice') addForm[key] = 0
    else if (key === 'unit') addForm[key] = '个'
    else if (key === 'photoUrl') addForm[key] = ''
    else addForm[key] = ''
  })
  addDialogVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.name) {
    ElMessage.warning(t('product.enterProductName'))
    return
  }
  if (!addForm.categoryId) {
    ElMessage.warning(t('product.selectCategory'))
    return
  }

  addLoading.value = true
  try {
    await api.post('/products', addForm)
    ElMessage.success(t('messages.addSuccess'))
    addDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || t('messages.addFailed'))
  } finally {
    addLoading.value = false
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

const handleSubmit = async () => {
  try {
    // 构建提交数据，移除空值字段避免后端UUID验证失败
    const submitData = { ...form }
    if (!submitData.id) delete submitData.id
    if (!submitData.description) delete submitData.description
    if (!submitData.unit) delete submitData.unit
    if (!submitData.photoUrl) delete submitData.photoUrl

    await api.put(`/products/${submitData.id}`, submitData)
    ElMessage.success(t('messages.updateSuccess'))
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.saveFailed'))
  }
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImageUpload = async (options) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    addForm.photoUrl = res.data.url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
}

const handleImageUploadEdit = async (options) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.photoUrl = res.data.url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-uploader:hover {
  border-color: #409eff;
}
.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.uploaded-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>

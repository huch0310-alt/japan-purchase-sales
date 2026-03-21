<template>
  <div class="product-detail-page">
    <el-page-header @back="goBack" :content="t('nav.productDetail')">
      <template #extra>
        <el-button type="primary" @click="handleEdit">{{ t('common.edit') }}</el-button>
        <el-button :type="product.status === 'active' ? 'warning' : 'success'" @click="handleToggleStatus">
          {{ product.status === 'active' ? t('product.offShelf') : t('product.onShelf') }}
        </el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <el-image :src="product.photoUrl || '/placeholder.png'" fit="contain" style="width: 100%; height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('product.title')">{{ product.name }}</el-descriptions-item>
            <el-descriptions-item :label="t('product.category')">{{ product.category?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('product.inventory')">{{ product.quantity }} {{ product.unit }}</el-descriptions-item>
            <el-descriptions-item :label="t('product.purchasePrice')">¥{{ product.purchasePrice }}</el-descriptions-item>
            <el-descriptions-item :label="t('product.salePrice')">¥{{ product.salePrice }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.status')">
              <el-tag :type="getStatusType(product.status)">{{ getStatusText(product.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="t('product.description')">{{ product.description || '-' }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.createTime')">{{ product.createdAt }}</el-descriptions-item>
            <el-descriptions-item :label="t('common.updateTime')">{{ product.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editVisible" :title="t('product.editProduct')" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item :label="t('product.title')">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.inventory')">
              <el-input-number v-model="editForm.quantity" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.unit')">
              <el-select v-model="editForm.unit" allow-create filterable style="width: 100%">
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('product.purchasePrice')">
              <el-input-number v-model="editForm.purchasePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('product.salePrice')">
              <el-input-number v-model="editForm.salePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('product.description')">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const product = ref({})
const editVisible = ref(false)
const editForm = ref({})
const units = ref(['个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack', 'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'])

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
    const res = await api.get(`/products/${route.params.id}`)
    product.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  editForm.value = { ...product.value }
  editVisible.value = true
}

const handleToggleStatus = async () => {
  try {
    const endpoint = product.value.status === 'active' ? 'deactivate' : 'activate'
    await api.put(`/products/${product.value.id}/${endpoint}`)
    ElMessage.success(product.value.status === 'active' ? t('product.deactivated') : t('product.activated'))
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

const handleSubmit = async () => {
  try {
    await api.put(`/products/${product.value.id}`, editForm.value)
    ElMessage.success(t('messages.updateSuccess'))
    editVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(t('messages.operationFailed'))
  }
}

onMounted(() => {
  loadData()
})
</script>

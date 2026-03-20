<template>
  <div class="product-detail-page">
    <el-page-header @back="goBack" content="商品详情">
      <template #extra>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button :type="product.status === 'active' ? 'warning' : 'success'" @click="handleToggleStatus">
          {{ product.status === 'active' ? '下架' : '上架' }}
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
            <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ product.category?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="库存">{{ product.quantity }} {{ product.unit }}</el-descriptions-item>
            <el-descriptions-item label="采购价">¥{{ product.purchasePrice }}</el-descriptions-item>
            <el-descriptions-item label="销售价">¥{{ product.salePrice }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(product.status)">{{ getStatusText(product.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="商品说明">{{ product.description || '无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ product.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ product.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editVisible" title="编辑商品" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量">
              <el-input-number v-model="editForm.quantity" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-select v-model="editForm.unit" allow-create filterable style="width: 100%">
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购价">
              <el-input-number v-model="editForm.purchasePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售价">
              <el-input-number v-model="editForm.salePrice" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品说明">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
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

const product = ref({})
const editVisible = ref(false)
const editForm = ref({})
const units = ref(['个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack', 'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'])

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
    const res = await api.get(`/products/${route.params.id}`)
    product.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
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
    ElMessage.success(product.value.status === 'active' ? '已下架' : '已上架')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  try {
    await api.put(`/products/${product.value.id}`, editForm.value)
    ElMessage.success('更新成功')
    editVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

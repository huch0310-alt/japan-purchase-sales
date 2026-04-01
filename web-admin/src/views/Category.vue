<template>
  <div class="category-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('category.title') }}</span>
          <el-button
            type="primary"
            @click="handleAdd"
          >
            {{ t('category.addCategory') }}
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        border
        stripe
      >
        <el-table-column
          :label="t('category.categoryName')"
          width="180"
        >
          <template #default="{ row }">
            {{ row.nameZh }}
            <br>
            <span style="color: #909399; font-size: 12px">{{ row.nameJa }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="nameEn"
          :label="t('category.nameEn')"
          width="150"
        />
        <el-table-column
          prop="sortOrder"
          :label="t('common.sort')"
          width="100"
        />
        <el-table-column
          prop="isSystem"
          :label="t('category.systemCategory')"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'info' : 'success'">
              {{ row.isSystem ? t('common.yes') : t('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('common.action')"
          width="150"
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
              type="danger" 
              link 
              :disabled="row.isSystem" 
              @click="handleDelete(row)"
            >
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? t('category.editCategory') : t('category.addCategory')" 
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item
          :label="t('category.nameZh')"
          prop="nameZh"
        >
          <el-input
            v-model="form.nameZh"
            :placeholder="t('validation.enterNameZh')"
          />
        </el-form-item>
        <el-form-item
          :label="t('category.nameJa')"
          prop="nameJa"
        >
          <el-input
            v-model="form.nameJa"
            :placeholder="t('validation.enterNameJa')"
          />
        </el-form-item>
        <el-form-item
          :label="t('category.nameEn')"
          prop="nameEn"
        >
          <el-input
            v-model="form.nameEn"
            :placeholder="t('validation.enterNameEn')"
          />
        </el-form-item>
        <el-form-item :label="t('common.sort')">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >
          {{ t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import api, { clearCache } from '../api'

const { t } = useI18n()

// 响应式数据
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: '',
  nameZh: '',
  nameJa: '',
  nameEn: '',
  sortOrder: 0
})

// 表单验证规则
const rules = {
  nameZh: [{ required: true, message: t('validation.enterNameZh'), trigger: 'blur' }],
  nameJa: [{ required: true, message: t('validation.enterNameJa'), trigger: 'blur' }],
  nameEn: [{ required: true, message: t('validation.enterNameEn'), trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  try {
    const res = await api.get('/categories')
    tableData.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

// 新增分类
const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    nameZh: '',
    nameJa: '',
    nameEn: '',
    sortOrder: 0
  })
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm(t('messages.confirmDelete'), t('common.tip'), {
    type: 'warning'
  }).then(async () => {
    try {
      await api.delete(`/categories/${row.id}`)
      // 清除分类缓存
      clearCache('/categories')
      ElMessage.success(t('messages.deleteSuccess'))
      loadData()
    } catch (e) {
      ElMessage.error(t('messages.deleteFailed'))
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 构建提交数据，移除空值字段避免后端UUID验证失败
      const submitData = { ...form }
      if (!submitData.id) delete submitData.id

      if (isEdit.value) {
        await api.put(`/categories/${submitData.id}`, submitData)
        ElMessage.success(t('messages.updateSuccess'))
      } else {
        await api.post('/categories', submitData)
        ElMessage.success(t('messages.createSuccess'))
      }
      
      // 清除分类缓存
      clearCache('/categories')
      dialogVisible.value = false
      loadData()
    } catch (e) {
      ElMessage.error(t('messages.operationFailed'))
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.category-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-table {
  margin-top: 0;
}

.el-dialog {
  border-radius: 8px;
}

.el-form {
  padding: 20px 20px 0;
}
</style>

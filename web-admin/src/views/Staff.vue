<template>
  <div class="staff-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('staff.title') }}</span>
          <el-button type="primary" @click="handleAdd">{{ t('staff.addStaff') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="username" :label="t('staff.username')" width="120" />
        <el-table-column prop="name" :label="t('staff.fullName')" width="120" />
        <el-table-column prop="phone" :label="t('staff.phone')" width="150" />
        <el-table-column prop="role" :label="t('staff.role')" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" :label="t('common.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? t('staff.normal') : t('staff.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('common.createTime')" width="180" />
        <el-table-column :label="t('common.action')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? t('staff.editStaff') : t('staff.addStaff')" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="t('staff.username')" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="t('staff.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="t('staff.leaveEmpty')" />
        </el-form-item>
        <el-form-item :label="t('staff.fullName')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('staff.phone')" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item :label="t('staff.role')" prop="role">
          <el-select v-model="form.role">
            <el-option :label="t('staff.superAdmin')" value="super_admin" />
            <el-option :label="t('staff.admin')" value="admin" />
            <el-option :label="t('staff.procurement')" value="procurement" />
            <el-option :label="t('staff.sales')" value="sales" />
          </el-select>
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
import api from '../api'

const { t } = useI18n()

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  role: 'sales'
})

const rules = {
  username: [{ required: true, message: t('validation.enterUsername'), trigger: 'blur' }],
  name: [{ required: true, message: t('validation.enterName'), trigger: 'blur' }],
  role: [{ required: true, message: t('validation.pleaseSelect', { field: t('staff.role') }), trigger: 'change' }]
}

const getRoleType = (role) => {
  const map = { super_admin: 'danger', admin: 'warning', procurement: 'success', sales: 'info' }
  return map[role] || 'info'
}

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
    const res = await api.get('/staff')
    tableData.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: '', username: '', password: '', name: '', phone: '', role: 'sales' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(t('messages.confirmDelete'), t('common.tip'), { type: 'warning' })
    .then(async () => {
      try {
        await api.delete(`/staff/${row.id}`)
        ElMessage.success(t('messages.deleteSuccess'))
        loadData()
      } catch (e) {
        ElMessage.error(t('messages.deleteFailed'))
      }
    })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        await api.put(`/staff/${form.id}`, form)
        ElMessage.success(t('messages.updateSuccess'))
      } else {
        await api.post('/staff', form)
        ElMessage.success(t('messages.createSuccess'))
      }
      dialogVisible.value = false
      loadData()
    } catch (e) {
      ElMessage.error(e.response?.data?.message || t('messages.operationFailed'))
    }
  })
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

<template>
  <div class="units-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('unit.title') }}</span>
          <el-button type="primary" @click="handleAdd">{{ t('unit.addUnit') }}</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" :label="t('unit.unitName')" />
        <el-table-column prop="sortOrder" :label="t('common.sort')" width="100" />
        <el-table-column prop="isActive" :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? t('common.enabled') : t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('unit.editUnit') : t('unit.addUnit')" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="t('common.name')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('common.sort')">
          <el-input-number v-model="form.sortOrder" :min="0" />
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

const form = reactive({ id: '', name: '', sortOrder: 0 })
const rules = { name: [{ required: true, message: t('validation.enterName'), trigger: 'blur' }] }

const loadData = async () => {
  try {
    const res = await api.get('/units')
    tableData.value = res.data
  } catch (e) { ElMessage.error(t('messages.loadFailed')) }
}

const handleAdd = () => { isEdit.value = false; Object.assign(form, { id: '', name: '', sortOrder: 0 }); dialogVisible.value = true }
const handleEdit = (row) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }

const handleDelete = (row) => {
  ElMessageBox.confirm(t('messages.confirmDelete'), t('common.tip'), { type: 'warning' }).then(async () => {
    try { await api.delete(`/units/${row.id}`); ElMessage.success(t('messages.deleteSuccess')); loadData() }
    catch (e) { ElMessage.error(t('messages.deleteFailed')) }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) { await api.put(`/units/${form.id}`, form); ElMessage.success(t('messages.updateSuccess')) }
      else { await api.post('/units', form); ElMessage.success(t('messages.createSuccess')) }
      dialogVisible.value = false; loadData()
    } catch (e) { ElMessage.error(t('messages.operationFailed')) }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>.card-header { display: flex; justify-content: space-between; align-items: center; }</style>

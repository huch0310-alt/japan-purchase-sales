<template>
  <div class="units-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>单位管理</span>
          <el-button type="primary" @click="handleAdd">新增单位</el-button>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="单位名称" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑单位' : '新增单位'" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
const isEdit = ref(false)
const formRef = ref()

const form = reactive({ id: '', name: '', sortOrder: 0 })
const rules = { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }

const loadData = async () => {
  try {
    const res = await api.get('/units')
    tableData.value = res.data
  } catch (e) { ElMessage.error('加载失败') }
}

const handleAdd = () => { isEdit.value = false; Object.assign(form, { id: '', name: '', sortOrder: 0 }); dialogVisible.value = true }
const handleEdit = (row) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }).then(async () => {
    try { await api.delete(`/units/${row.id}`); ElMessage.success('删除成功'); loadData() }
    catch (e) { ElMessage.error('删除失败') }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) { await api.put(`/units/${form.id}`, form); ElMessage.success('更新成功') }
      else { await api.post('/units', form); ElMessage.success('创建成功') }
      dialogVisible.value = false; loadData()
    } catch (e) { ElMessage.error('操作失败') }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>.card-header { display: flex; justify-content: space-between; align-items: center; }</style>

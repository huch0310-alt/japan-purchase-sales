<template>
  <div class="customer-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <div>
            <el-input v-model="searchKeyword" placeholder="搜索公司名称" style="width: 200px; margin-right: 10px" @keyup.enter="loadData" />
            <el-button type="primary" @click="handleAdd">新增客户</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="username" label="账号" width="120" />
        <el-table-column prop="companyName" label="公司名称" min-width="150" />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="address" label="送货地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="vipDiscount" label="VIP折扣" width="100">
          <template #default="{ row }">
            {{ row.vipDiscount }}%
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号" prop="username">
              <el-input v-model="form.username" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="不修改请留空" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="form.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="VIP折扣" prop="vipDiscount">
              <el-input-number v-model="form.vipDiscount" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contactPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="送货地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-divider>請求書信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="請求書抬头">
              <el-input v-model="form.invoiceName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司地址">
              <el-input v-model="form.invoiceAddress" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.invoicePhone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账户">
              <el-input v-model="form.invoiceBank" />
            </el-form-item>
          </el-col>
        </el-row>
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
const searchKeyword = ref('')
const formRef = ref()

const form = reactive({
  id: '',
  username: '',
  password: '',
  companyName: '',
  contactPerson: '',
  phone: '',
  address: '',
  vipDiscount: 100,
  invoiceName: '',
  invoiceAddress: '',
  invoicePhone: '',
  invoiceBank: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const res = await api.get('/customers', { params: { keyword: searchKeyword.value } })
    tableData.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '', username: '', password: '', companyName: '', contactPerson: '',
    phone: '', address: '', vipDiscount: 100, invoiceName: '',
    invoiceAddress: '', invoicePhone: '', invoiceBank: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row, password: '' })
  dialogVisible.value = true
}

const handleView = (row) => {
  // TODO: 跳转到客户详情页
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await api.delete(`/customers/${row.id}`)
        ElMessage.success('删除成功')
        loadData()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        await api.put(`/customers/${form.id}`, form)
        ElMessage.success('更新成功')
      } else {
        await api.post('/customers', form)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (e) {
      ElMessage.error(e.response?.data?.message || '操作失败')
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

<template>
  <div class="customer-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('customer.title') }}</span>
          <div>
            <el-input v-model="searchKeyword" :placeholder="t('customer.searchCompany')" style="width: 200px; margin-right: 10px" @keyup.enter="loadData" />
            <el-button type="primary" @click="handleAdd">{{ t('customer.addCustomer') }}</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="username" :label="t('customer.username')" width="120" />
        <el-table-column prop="companyName" :label="t('customer.companyName')" min-width="150" />
        <el-table-column prop="contactPerson" :label="t('customer.contactPerson')" width="100" />
        <el-table-column prop="phone" :label="t('customer.contactPhone')" width="130" />
        <el-table-column prop="address" :label="t('customer.deliveryAddress')" min-width="150" show-overflow-tooltip />
        <el-table-column prop="vipDiscount" :label="t('customer.vipDiscount')" width="100">
          <template #default="{ row }">
            {{ row.vipDiscount }}%
          </template>
        </el-table-column>
        <el-table-column prop="isActive" :label="t('common.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? t('customer.normal') : t('customer.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.action')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button type="primary" link @click="handleView(row)">{{ t('common.detail') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? t('customer.editCustomer') : t('customer.addCustomer')" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.username')" prop="username">
              <el-input v-model="form.username" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.password')" prop="password">
              <el-input v-model="form.password" type="password" show-password :placeholder="t('customer.leaveEmpty')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.companyName')" prop="companyName">
              <el-input v-model="form.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.vipDiscount')" prop="vipDiscount">
              <el-input-number v-model="form.vipDiscount" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.contactPerson')">
              <el-input v-model="form.contactPerson" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.contactPhone')">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('customer.deliveryAddress')">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-divider>{{ t('customer.invoiceInfo') }}</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('customer.invoiceName')">
              <el-input v-model="form.invoiceName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.companyAddress')">
              <el-input v-model="form.invoiceAddress" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('common.phone')">
              <el-input v-model="form.invoicePhone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('customer.bankAccount')">
              <el-input v-model="form.invoiceBank" />
            </el-form-item>
          </el-col>
        </el-row>
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
  username: [{ required: true, message: t('validation.enterUsername'), trigger: 'blur' }],
  companyName: [{ required: true, message: t('validation.pleaseInput', { field: t('customer.companyName') }), trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const res = await api.get('/customers', { params: { keyword: searchKeyword.value } })
    tableData.value = res.data
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
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
  ElMessageBox.confirm(t('messages.confirmDelete'), t('common.tip'), { type: 'warning' })
    .then(async () => {
      try {
        await api.delete(`/customers/${row.id}`)
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
        await api.put(`/customers/${form.id}`, form)
        ElMessage.success(t('messages.updateSuccess'))
      } else {
        await api.post('/customers', form)
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

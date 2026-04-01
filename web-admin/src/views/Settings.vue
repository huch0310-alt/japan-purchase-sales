<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <span>{{ t('settings.title') }}</span>
      </template>
      <el-form
        :model="form"
        label-width="120px"
      >
        <el-divider>{{ t('settings.companyInfo') }}</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('settings.companyName')">
              <el-input v-model="form.company_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('settings.representative')">
              <el-input v-model="form.company_representative" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('settings.companyAddress')">
          <el-input v-model="form.company_address" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="t('common.phone')">
              <el-input v-model="form.company_phone" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('settings.fax')">
              <el-input v-model="form.company_fax" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="t('settings.email')">
              <el-input v-model="form.company_email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('settings.legalRepresentative')">
          <el-input v-model="form.company_legal_representative" />
        </el-form-item>
        <el-form-item :label="t('settings.bankAccount')">
          <el-input v-model="form.company_bank" />
        </el-form-item>

        <el-divider>{{ t('settings.financeSettings') }}</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('settings.taxRate')">
              <el-select v-model="form.tax_rate">
                <el-option
                  label="10%"
                  value="10"
                />
                <el-option
                  label="8%"
                  value="8"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('settings.defaultPaymentDays')">
              <el-input-number
                v-model="form.default_payment_days"
                :min="1"
                :max="90"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>{{ t('settings.unitSettings') }}</el-divider>
        <el-form-item :label="t('settings.productUnits')">
          <el-select
            v-model="form.units"
            multiple
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="u in defaultUnits"
              :key="u"
              :label="u"
              :value="u"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSave"
          >
            {{ t('settings.saveSettings') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import api from '../api'

const { t } = useI18n()

const form = reactive({
  company_name: '',
  company_address: '',
  company_phone: '',
  company_fax: '',
  company_email: '',
  company_representative: '',
  company_legal_representative: '',
  company_bank: '',
  tax_rate: '10',
  default_payment_days: 30,
  units: []
})

const defaultUnits = ['个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack', 'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L']

const loadData = async () => {
  try {
    const res = await api.get('/settings')
    const settings = res.data
    settings.forEach(s => {
      if (s.key === 'units') {
        form.units = s.value ? s.value.split(',') : []
      } else if (form.hasOwnProperty(s.key)) {
        form[s.key] = s.value
      }
    })
  } catch (e) {
    ElMessage.error(t('messages.loadFailed'))
  }
}

const handleSave = async () => {
  try {
    const settings = Object.entries(form).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(',') : String(value)
    }))
    await api.post('/settings', settings)
    ElMessage.success(t('messages.saveSuccess'))
  } catch (e) {
    ElMessage.error(t('messages.saveFailed'))
  }
}

onMounted(() => { loadData() })
</script>

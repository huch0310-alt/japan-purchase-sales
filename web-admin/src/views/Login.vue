<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>{{ t('login.title') }}</h2>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="t('login.loginType')">
          <el-radio-group v-model="form.loginType">
            <el-radio label="staff">{{ t('login.staffLogin') }}</el-radio>
            <el-radio label="customer">{{ t('login.customerLogin') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('customer.username')" prop="username">
          <el-input v-model="form.username" :placeholder="t('validation.enterUsername')" />
        </el-form-item>
        <el-form-item :label="t('customer.password')" prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('validation.enterPassword')" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  loginType: 'staff'
})

const rules = {
  username: [{ required: true, message: t('validation.enterUsername'), trigger: 'blur' }],
  password: [{ required: true, message: t('validation.enterPassword'), trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login(form.username, form.password, form.loginType)
      ElMessage.success(t('login.loginSuccess'))
      router.push('/')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || t('login.loginFailed'))
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%);
}

.login-card {
  width: 400px;
}

.card-header h2 {
  text-align: center;
  margin: 0;
  color: #1e88e5;
}
</style>

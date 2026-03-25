<template>
  <div class="login-container">
    <div class="language-switch-wrapper">
      <el-dropdown @command="handleLanguageChange">
        <span class="language-switch">
          {{ languages.find(l => l.value === locale)?.label }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="lang in languages"
              :key="lang.value"
              :command="lang.value"
            >
              {{ lang.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>{{ t('login.title') }}</h2>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../store/user'
import { useLanguageStore } from '../store/language'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const languageStore = useLanguageStore()
const { t, locale: i18nLocale } = useI18n()

const locale = computed(() => languageStore.locale)

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' }
]

const handleLanguageChange = (lang) => {
  languageStore.setLocale(lang)
  i18nLocale.value = lang
}

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
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
      await userStore.login(form.username, form.password, 'staff')
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(160deg, #F7F5F2 0%, #EEEBE6 100%);
  position: relative;
}

.language-switch-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switch {
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  background: var(--color-bg-card);
}

.language-switch:hover {
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}

.login-card {
  width: 400px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header h2 {
  text-align: center;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 600;
}
</style>

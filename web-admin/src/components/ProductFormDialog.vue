<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? t('product.editProduct') : t('product.addProduct')"
    width="600px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        :label="t('product.title')"
        prop="name"
      >
        <el-input
          v-model="form.name"
          :placeholder="t('product.enterProductName')"
        />
      </el-form-item>
      <el-form-item
        v-if="!isEdit"
        :label="t('product.category')"
        prop="categoryId"
      >
        <el-select
          v-model="form.categoryId"
          :placeholder="t('product.selectCategory')"
          style="width: 100%"
        >
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.nameZh"
            :value="c.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="t('product.inventory')"
            prop="quantity"
          >
            <el-input-number
              v-model="form.quantity"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="t('product.unit')"
            prop="unit"
          >
            <el-select
              v-model="form.unit"
              allow-create
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="u in units"
                :key="u"
                :label="u"
                :value="u"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="t('product.purchasePrice')"
            prop="purchasePrice"
          >
            <el-input-number
              v-model="form.purchasePrice"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="t('product.salePrice')"
            prop="salePrice"
          >
            <el-input-number
              v-model="form.salePrice"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        :label="t('product.description')"
        prop="description"
      >
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          :placeholder="t('product.enterDescription')"
        />
      </el-form-item>
      <el-form-item
        :label="t('product.productImage')"
        prop="photoUrl"
      >
        <el-upload
          :before-upload="beforeImageUpload"
          :http-request="handleImageUpload"
          :show-file-list="false"
          accept="image/*"
          class="image-uploader"
        >
          <img
            v-if="form.photoUrl"
            :src="form.photoUrl"
            class="uploaded-image"
          >
          <el-icon
            v-else
            class="image-uploader-icon"
          >
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ t('common.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../api'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const units = ref(['个', '袋', '箱', 'kg', 'g', '本', '盒', 'pack', 'ケース', '枚', 'セット', '瓶', '罐', 'ml', 'L'])

const form = reactive({
  id: '',
  name: '',
  categoryId: '',
  quantity: 0,
  unit: '个',
  purchasePrice: 0,
  salePrice: 0,
  description: '',
  photoUrl: ''
})

const rules = {
  name: [{ required: true, message: t('product.enterProductName'), trigger: 'blur' }],
  categoryId: [{ required: true, message: t('product.selectCategory'), trigger: 'change' }],
  quantity: [{ required: true, message: t('validation.required'), trigger: 'blur' }]
}

// 监听 visible 属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    if (props.isEdit && props.product) {
      // 编辑模式：填充表单
      Object.assign(form, props.product)
    } else {
      // 添加模式：重置表单
      resetForm()
    }
  }
})

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const resetForm = () => {
  Object.assign(form, {
    id: '',
    name: '',
    categoryId: '',
    quantity: 0,
    unit: '个',
    purchasePrice: 0,
    salePrice: 0,
    description: '',
    photoUrl: ''
  })
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImageUpload = async (options) => {
  const { file } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.photoUrl = res.data.url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (props.isEdit) {
        // 编辑模式
        const submitData = { ...form }
        delete submitData.id
        if (!submitData.description) delete submitData.description
        if (!submitData.unit) delete submitData.unit
        if (!submitData.photoUrl) delete submitData.photoUrl
        await api.put(`/products/${form.id}`, submitData)
        ElMessage.success(t('messages.updateSuccess'))
      } else {
        // 添加模式
        await api.post('/products', form)
        ElMessage.success(t('messages.addSuccess'))
      }
      dialogVisible.value = false
      emit('success')
    } catch (e) {
      ElMessage.error(e.response?.data?.message || t('messages.operationFailed'))
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.image-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-uploader:hover {
  border-color: #409eff;
}
.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.uploaded-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>

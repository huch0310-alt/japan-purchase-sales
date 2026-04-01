<template>
  <div class="product-page">
    <ProductList
      ref="productListRef"
      @add="handleAdd"
      @edit="handleEdit"
    />

    <ProductFormDialog
      v-model:visible="formDialogVisible"
      :is-edit="isEdit"
      :product="currentProduct"
      :categories="categories"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import ProductList from '../components/ProductList.vue'
import ProductFormDialog from '../components/ProductFormDialog.vue'
import api from '../api'

const { t } = useI18n()

const productListRef = ref()
const formDialogVisible = ref(false)
const isEdit = ref(false)
const currentProduct = ref({})
const categories = ref([])

const loadCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data || []
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentProduct.value = {}
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentProduct.value = { ...row }
  formDialogVisible.value = true
}

const handleFormSuccess = () => {
  productListRef.value?.loadData()
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.product-page {
  padding: 0;
}
</style>

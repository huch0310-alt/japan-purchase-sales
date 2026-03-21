import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const locale = ref(localStorage.getItem('language') || 'zh')

  watch(locale, (newLocale) => {
    localStorage.setItem('language', newLocale)
  })

  function setLocale(newLocale) {
    locale.value = newLocale
  }

  return { locale, setLocale }
})

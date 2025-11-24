<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()

const auth = inject('auth') as any
const fetchProfile = inject('fetchProfile') as () => Promise<void>

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login.value, password: password.value }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Ошибка входа')

    auth.value = true
    await fetchProfile()
    router.push({ path: '/', query: { success: 'authenticated' } })
  } catch (e: any) {
    error.value = e.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h2>Вход</h2>
      <p class="muted">Введите свои данные для входа</p>

      <label class="field">
        <input v-model="login" type="text" placeholder="Логин" required />
      </label>

      <label class="field">
        <input v-model="password" type="password" placeholder="Пароль" required />
      </label>

      <div v-if="error" class="error">{{ error }}</div>

      <button class="btn" :disabled="loading">{{ loading ? 'Выполняется...' : 'Войти' }}</button>
    </form>
  </div>
</template>

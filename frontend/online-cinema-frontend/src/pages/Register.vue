<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()

const auth = inject('auth') as any
const fetchProfile = inject('fetchProfile') as () => Promise<void>

const login = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: login.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Registration error')

    auth.value = true
    await fetchProfile()
    router.push({ path: '/', query: { success: 'registered' } })
  } catch (e: any) {
    error.value = e.message || 'Registration error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <form class="auth-card" @submit.prevent="submit">
      <h2>Register</h2>
      <p class="muted">Create an account to access</p>

      <label class="field">
        <input v-model="login" type="text" placeholder="Username" required />
      </label>

      <label class="field">
        <input v-model="firstName" type="text" placeholder="First Name" required />
      </label>

      <label class="field">
        <input v-model="lastName" type="text" placeholder="Last Name" required />
      </label>

      <label class="field">
        <input v-model="email" type="email" placeholder="Email" required />
      </label>

      <label class="field">
        <input v-model="password" type="password" placeholder="Password" required minlength="6" />
      </label>

      <div v-if="error" class="error">{{ error }}</div>

      <button class="btn" :disabled="loading">{{ loading ? 'Saving...' : 'Register' }}</button>
    </form>
  </div>
</template>

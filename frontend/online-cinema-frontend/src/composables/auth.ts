import { ref } from 'vue'

export const auth = ref(false)
export const profile = ref<any>(null)

export async function fetchProfile() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  try {
    const res = await fetch(API_BASE + '/users/profile', {
      credentials: 'include'
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.profile) {
        profile.value = data.profile
        auth.value = true
      } else {
        clearAuth()
      }
    } else {
      clearAuth()
    }
  } catch {
    clearAuth()
  }
}

export function clearAuth() {
  auth.value = false
  profile.value = null
}
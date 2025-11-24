<script setup lang="ts">
import { provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, profile, fetchProfile } from './composables/auth'

const router = useRouter()

provide('auth', auth)
provide('profile', profile)
provide('fetchProfile', fetchProfile)

onMounted(fetchProfile)

function doLogout() {
  auth.value = false
  profile.value = null
  fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' })
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <header class="topbar card">
      <div style="display:flex;align-items:center;gap:.8rem">
        <div class="brand">OnlineCinema</div>
      </div>
      <nav class="nav">
        <router-link to="/" class="link">Главная</router-link>
        <router-link v-if="auth" to="/subscriptions" class="link">Подписки</router-link>
         <router-link v-if="auth" to="/favorites" class="link">Избранные</router-link>
        <router-link v-if="auth" to="/catalog" class="link">Каталог фильмов</router-link>
        <router-link v-if="!auth" to="/login" class="link">Вход</router-link>
        <router-link v-if="!auth" to="/register" class="link">Регистрация</router-link>
         <router-link v-if="!auth" to="/admin" class="link">Админ понель</router-link>
        <button v-if="auth" class="btn-logout" @click="doLogout">Выйти</button>
      </nav>
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

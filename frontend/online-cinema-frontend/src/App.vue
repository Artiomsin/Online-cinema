<script setup lang="ts">
import { provide, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, profile, fetchProfile } from './composables/auth';

const router = useRouter();

provide('auth', auth);
provide('profile', profile);
provide('fetchProfile', fetchProfile);

onMounted(fetchProfile);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function doLogout() {
  auth.value = false;
  profile.value = null;
  fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  router.push('/login');
}
</script>

<template>
  <div id="app">
    <header class="topbar card">
      <div style="display: flex; align-items: center; gap: 0.8rem">
        <div class="brand">OnlineCinema</div>
      </div>
      <nav class="nav">
        <router-link to="/" class="link">Home</router-link>
        <router-link v-if="auth" to="/subscriptions" class="link"
          >Subscriptions</router-link
        >
        <router-link v-if="auth" to="/favorites" class="link"
          >Favorites</router-link
        >
        <router-link v-if="auth" to="/catalog" class="link"
          >Movie Catalog</router-link
        >
        <router-link v-if="!auth" to="/login" class="link">Login</router-link>
        <router-link v-if="!auth" to="/register" class="link"
          >Register</router-link
        >
        <router-link v-if="auth" to="/admin" class="link"
          >Admin Panel</router-link
        >
        <router-link v-if="auth" to="/admin/logs" class="link"
          >Logs</router-link
        >
        <button v-if="auth" class="btn-logout" @click="doLogout">Logout</button>
      </nav>
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

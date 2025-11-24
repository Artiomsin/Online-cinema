<script setup lang="ts">
import { inject } from 'vue'

const auth = inject('auth') as any
const profile = inject('profile') as any
</script>

<template>
  <div class="home-wrap">
    <div class="home-card">
      <h1>Онлайн-кинотеатр</h1>
      <p class="lead">Добро пожаловать в демо-frontend.</p>

      <div v-if="auth && profile" class="profile-card">
        <div class="avatar">
          <span>{{ profile.firstName?.[0] || '?' }}</span>
        </div>
        <div class="info">
          <h2>Ваш профиль</h2>
          <div class="field"><strong>Логин:</strong> {{ profile.login }}</div>
          <div class="field"><strong>Имя:</strong> {{ profile.firstName }} {{ profile.lastName }}</div>
          <div class="field"><strong>Email:</strong> {{ profile.email }}</div>
        </div>
      </div>

      <div v-else class="banner">
        <strong>Вы не авторизованы.</strong>
        <p>Используйте меню вверху, чтобы войти или зарегистрироваться.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-wrap {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.home-card {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e2e8f0;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
}
.lead {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #cbd5e1;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 10px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}
.info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
}
.field {
  margin-bottom: 0.4rem;
}
.banner {
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>

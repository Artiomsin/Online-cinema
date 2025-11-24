<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const router = useRouter()
const favorites = ref<any[]>([])
const loading = ref(true)
const error = ref('')

async function loadFavorites() {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/favorites/me`, { credentials: 'include' })
    if (!res.ok) throw new Error('Ошибка загрузки избранного')
    const favs = await res.json()

    // подтягиваем данные фильма по id
    const moviesData = await Promise.all(
      favs.map(async (f: any) => {
        const movieRes = await fetch(`${API_BASE}/movies/${f.movieId}`, { credentials: 'include' })
        if (movieRes.ok) {
          const movie = await movieRes.json()
          return {
            id: f.id,
            movieId: f.movieId,
            title: movie.title,
            posterUrl: movie.posterUrl,
            subscriptionLevel: movie.subscriptionLevel,
          }
        }
        return null
      })
    )

    favorites.value = moviesData.filter(Boolean)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadFavorites)

function openMovie(id: number) {
  router.push(`/movies/${id}`)
}
</script>

<template>
  <div class="favorites-page">
    <h1>⭐ Мои любимые фильмы</h1>
    <div v-if="loading" class="status">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="favorites.length" class="grid">
      <div v-for="f in favorites" :key="f.id" class="card" @click="openMovie(f.movieId)">
        <img :src="f.posterUrl" alt="Poster" class="poster" />
        <div class="info">
          <div class="title">{{ f.title }}</div>
          <div class="subscription">Подписка: {{ f.subscriptionLevel }}</div>
        </div>
      </div>
    </div>
    <div v-else class="no-favorites">У вас пока нет любимых фильмов</div>
  </div>
</template>

<style scoped>
.favorites-page {
  padding: 2rem;
  background: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

.poster {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.info {
  padding: 0.8rem;
  text-align: center;
}

.title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.subscription {
  font-size: 0.85rem;
  color: #94a3b8;
}
</style>

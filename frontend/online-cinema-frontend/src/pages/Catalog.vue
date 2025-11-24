<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'
const movies = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const router = useRouter()

onMounted(async () => {
  await loadAllMovies()
})

async function loadAllMovies() {
  try {
    loading.value = true
    const res = await fetch(API_BASE + '/movies', { credentials: 'include' })
    if (!res.ok) throw new Error('Ошибка загрузки фильмов')
    movies.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function searchMovies(query: string) {
  if (!query.trim()) {
    await loadAllMovies()
    return
  }
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/movies/search?title=${encodeURIComponent(query)}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Ошибка поиска')
    movies.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Автопоиск при вводе
watch(searchQuery, (newVal) => {
  if (newVal.length >= 1) {
    searchMovies(newVal)
  } else {
    loadAllMovies()
  }
})

function openMovie(id: number) {
  router.push(`/movies/${id}`)
}
</script>

<template>
  <div class="catalog-wrap">
    <h1 class="heading">🎬 Каталог фильмов</h1>

    <!-- Поле поиска -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Введите название фильма..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="status">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="grid">
      <div v-for="movie in movies" :key="movie.id" class="card" @click="openMovie(movie.id)">
        <img :src="movie.posterUrl" alt="Poster" class="poster" />
        <div class="title">{{ movie.title }}</div>
      </div>
    </div>

    <footer class="footer">
      © 2025 OnlineCinema. Все права защищены.
    </footer>
  </div>
</template>


<style scoped>
.catalog-wrap {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  color: #e6eef8;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.heading {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 700;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
}

.search-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(90deg, #22d3ee, #0ea5e9);
  color: #041024;
}

.status {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--muted);
}

.error {
  color: var(--danger);
  margin-bottom: 1rem;
  font-weight: 500;
}

.grid {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.card {
  cursor: pointer;
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

.poster {
  width: 100%;
  height: 260px;
  object-fit: cover;
  background-color: #1e293b;
}

.title {
  padding: 0.8rem;
  font-weight: 600;
  text-align: center;
  font-size: 1rem;
  color: #e6eef8;
  background-color: #1e293b;
}

.footer {
  width: 100%;
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}
</style>

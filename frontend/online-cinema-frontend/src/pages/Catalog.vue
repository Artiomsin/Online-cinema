<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'
const movies = ref<any[]>([])
const genres = ref<any[]>([])        // список жанров
const selectedGenre = ref('')        // выбранный жанр
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const router = useRouter()
const selectedYear = ref('')


onMounted(async () => {
  await Promise.all([loadAllMovies(), loadGenres()])
})

async function loadAllMovies() {
  try {
    loading.value = true
    const res = await fetch(API_BASE + '/movies', { credentials: 'include' })
    if (!res.ok) throw new Error('Error loading movies')
    movies.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadGenres() {
  try {
    const res = await fetch(API_BASE + '/genres', { credentials: 'include' })
    if (!res.ok) throw new Error('Error loading genres')
    genres.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  }
}


async function filterByYear(yearStr: string) {
  const year = Number(yearStr)
  if (!yearStr || Number.isNaN(year)) {
    await loadAllMovies()
    return
  }
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/movies/year?year=${year}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error filtering by year')
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
    if (!res.ok) throw new Error('Error search')
    movies.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function filterByGenre(genreId: string) {
  if (!genreId) {
    await loadAllMovies()
    return
  }
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/movies/genre/${genreId}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error filtering')
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

watch(selectedYear, (newVal) => filterByYear(newVal))


// Автофильтр при выборе жанра
watch(selectedGenre, (newVal) => {
  filterByGenre(newVal)
})

function openMovie(id: number) {
  router.push(`/movies/${id}`)
}
</script>

<template>
  <div class="catalog-wrap">
    <h1 class="heading">🎬 Catalog movies</h1>

    <!-- Поле поиска -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Enter movie title..."
        class="search-input"
      />
    </div>


    <!-- Фильтр по году -->
    <div class="year-filter">
      <input
        v-model="selectedYear"
        type="number"
        min="1888"
        :max="new Date().getFullYear()"
        placeholder="Release Year"
        class="year-input"
      />
    </div>

    <!-- Фильтр по жанрам -->
    <div class="genre-filter">
      <select v-model="selectedGenre" class="genre-select">
        <option value="">All Genres</option>
        <option v-for="g in genres" :key="g.id" :value="g.id">
          {{ g.name }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="grid">
      <div v-for="movie in movies" :key="movie.id" class="card" @click="openMovie(movie.id)">
        <img :src="movie.posterUrl" alt="Poster" class="poster" />
        <div class="title">{{ movie.title }}</div>
      </div>
    </div>

    <footer class="footer">
      © 2025 OnlineCinema. All rights reserved.
    </footer>
  </div>
</template>



<style scoped>

.year-filter {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.year-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  background-color: #1e293b;
  color: #e6eef8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.year-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #22d3ee;
}



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
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  background-color: #1e293b; /* тёмный фон в стиле каталога */
  color: #e6eef8;  
  border: none;
  font-size: 1rem;
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

.genre-filter {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.genre-select {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  background-color: #1e293b; /* тёмный фон в стиле каталога */
  color: #e6eef8;            /* светлый текст */
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.genre-select:hover {
  background-color: #334155; /* чуть светлее при наведении */
}

.genre-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px #22d3ee; /* акцент при фокусе */
}


</style>

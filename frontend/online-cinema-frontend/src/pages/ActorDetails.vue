<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000'
const route = useRoute()
const router = useRouter()

const actor = ref<any>(null)
const movies = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const id = route.params.id
  try {
    const [actorRes, moviesRes] = await Promise.all([
      fetch(`${API_BASE}/actors/${id}`, { credentials: 'include' }),
      fetch(`${API_BASE}/actors/${id}/movies`, { credentials: 'include' }),
    ])

    if (!actorRes.ok) throw new Error('Актёр не найден')
    actor.value = await actorRes.json()
    movies.value = moviesRes.ok ? await moviesRes.json() : []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function openMovie(id: number) {
  router.push(`/movies/${id}`)
}
</script>

<template>
  <div class="actor-wrap">
    <div v-if="loading" class="status">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="actor" class="actor-card">
      <h1>{{ actor.firstName }} {{ actor.lastName }}</h1>
      <p><strong>Birth Date:</strong> {{ actor.birthDate }}</p>
      <p class="bio">{{ actor.biography }}</p>

      <div v-if="movies.length" class="movies">
        <h3>Movies:</h3>
        <ul>
          <li v-for="m in movies" :key="m.id" @click="openMovie(m.id)" class="movie-link">
            {{ m.title }} ({{ m.releaseYear }}) — <em>{{ m.characterName }}</em>
            <div class="genres">
              <span v-for="g in m.genres" :key="g.id" class="tag">{{ g.name }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actor-wrap {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-1), var(--bg-2));
  color: #e6eef8;
}
.status, .error {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.error {
  color: var(--danger);
}
.actor-card {
  max-width: 800px;
  margin: 0 auto;
}
.bio {
  margin: 1rem 0;
  opacity: 0.9;
}
.movies {
  margin-top: 2rem;
}
.movie-link {
  cursor: pointer;
  margin-bottom: 1rem;
  padding: .6rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  transition: background .2s;
}
.movie-link:hover {
  background: rgba(255,255,255,0.06);
}
.genres {
  margin-top: .4rem;
}
.tag {
  display: inline-block;
  margin: .2rem .3rem 0 0;
  padding: .2rem .5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  font-size: .8rem;
}
</style>

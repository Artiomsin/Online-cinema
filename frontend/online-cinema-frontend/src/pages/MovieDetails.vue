<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const route = useRoute()
const router = useRouter()

const similarMovies = ref<any[]>([])
const movie = ref<any>(null)
const genres = ref<any[]>([])
const actors = ref<any[]>([])
const currentVideo = ref<string | null>(null)
const loading = ref(true)
const error = ref('')
const comments = ref<any[]>([])
const averageRating = ref<number | null>(null)
const newComment = ref('')
const newRating = ref<number | null>(null)
const isFavorite = ref<boolean>(false)
const recommendedByFavorites = ref<any[]>([])
const recommendedByHistory = ref<any[]>([])
const newInFavoriteGenres = ref<any[]>([])



async function checkFavorite(movieId: number) {
  try {
    const res = await fetch(`${API_BASE}/favorites/check`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    })
    if (res.ok) {
      const data = await res.json()
      isFavorite.value = data.isFavorite // ← теперь всегда корректно
    }
  } catch (e: any) {
    error.value = e.message
  }
}


async function toggleFavorite(movieId: number) {
  try {
    if (isFavorite.value) {
      // удалить из избранного
      await fetch(`${API_BASE}/favorites`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      })
      isFavorite.value = false
    } else {
      // добавить в избранное
      await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      })
      isFavorite.value = true
    }
  } catch (e: any) {
    error.value = e.message
  }
}



async function loadComments(movieId: number) {
  try {
    const [commentsRes, ratingRes] = await Promise.all([
      fetch(`${API_BASE}/comments/movie/${movieId}`, { credentials: 'include' }),
      fetch(`${API_BASE}/comments/movie/${movieId}/average-rating`, { credentials: 'include' }),
    ])

    comments.value = commentsRes.ok ? await commentsRes.json() : []

    if (ratingRes.ok) {
      const data = await ratingRes.json()
      averageRating.value = data.averageRating 
    } else {
      averageRating.value = null
    }
  } catch (e: any) {
    error.value = e.message
    comments.value = []
    averageRating.value = null
  }
}


async function addComment(movieId: number) {
  try {
    if (!newRating.value || !newComment.value.trim()) {
      throw new Error('Введите текст и выберите оценку')
    }

    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieId,
        rating: newRating.value,
        commentText: newComment.value.trim(),
      }),
    })

    if (!res.ok) throw new Error('Ошибка добавления комментария')

    newComment.value = ''
    newRating.value = null
    await loadComments(movieId)
  } catch (e: any) {
    error.value = e.message
  }
}

async function loadMovieAndSimilar(id: number) {
  loading.value = true
  error.value = ''
  try {
    const [movieRes, genreRes, actorRes, similarRes, favRes, histRes, genresRes] = await Promise.all([
      fetch(`${API_BASE}/movies/${id}`, { credentials: 'include' }),
      fetch(`${API_BASE}/movies/${id}/genres`, { credentials: 'include' }),
      fetch(`${API_BASE}/movies/${id}/actors`, { credentials: 'include' }),
      fetch(`${API_BASE}/recommendations/similar/${id}`, { credentials: 'include' }),
      fetch(`${API_BASE}/recommendations/favorites`, { credentials: 'include' }),
      fetch(`${API_BASE}/recommendations/history`, { credentials: 'include' }),
      fetch(`${API_BASE}/recommendations/genres`, { credentials: 'include' }),
    ])

    if (!movieRes.ok) throw new Error('Фильм не найден')

    movie.value = await movieRes.json()
    genres.value = genreRes.ok ? await genreRes.json() : []
    actors.value = actorRes.ok ? await actorRes.json() : []
    similarMovies.value = similarRes.ok ? await similarRes.json() : []
    recommendedByFavorites.value = favRes.ok ? await favRes.json() : []
    recommendedByHistory.value = histRes.ok ? await histRes.json() : []
    newInFavoriteGenres.value = genresRes.ok ? await genresRes.json() : []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  await checkFavorite(movie.value.id) 
  await loadComments(id)
}

onMounted(() => {
  const id = Number(route.params.id)
  if (!Number.isNaN(id)) loadMovieAndSimilar(id)
})

watch(
  () => route.params.id,
  (newId) => {
    const id = Number(newId)
    if (!Number.isNaN(id)) {
      currentVideo.value = null
      loadMovieAndSimilar(id)
    }
  }
)

function play(url: string) {
  currentVideo.value = url
}

// Проверка: YouTube или нет
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

// Извлечение ID из YouTube-ссылки
function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=)([^&]+)/)
  return match && match[1] ? match[1] : null
}

function openMovie(id: number) {
  router.push(`/movies/${id}`)
}
</script>

<template>
  <div class="details-wrap">
    <div v-if="loading" class="status">Загрузка...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="movie" class="details-card">
      <img :src="movie.posterUrl" alt="Poster" class="poster" />

      <div class="info">
        <h1>{{ movie.title }}</h1>

        <div class="favorite">
          <button class="fav-btn" @click="toggleFavorite(movie.id)">
            {{ isFavorite ? '★ В избранном' : '☆ Добавить в избранное' }}
          </button>
        </div>

        <p class="desc">{{ movie.description }}</p>

        <div class="meta">
          <p><strong>Год:</strong> {{ movie.releaseYear }}</p>
          <p><strong>Язык:</strong> {{ movie.originalLanguage }}</p>
          <p><strong>Страна:</strong> {{ movie.productionCountry }}</p>
          <p><strong>Возраст:</strong> {{ movie.ageRating }}+</p>
          <p><strong>Длительность:</strong> {{ movie.duration }} мин</p>
          <p><strong>Подписка:</strong> {{ movie.subscriptionLevel }}</p>
        </div>

        <div v-if="genres.length" class="genres">
          <strong>Жанры:</strong>
          <span v-for="g in genres" :key="g.id" class="tag">{{ g.name }}</span>
        </div>

        <div v-if="actors.length" class="actors">
          <strong>Актёры:</strong>
          <ul>
            <li v-for="a in actors" :key="a.id">
              <router-link :to="`/actors/${a.id}`" class="actor-link">
                {{ a.firstName }} {{ a.lastName }}
              </router-link>
              — <em>{{ a.characterName }}</em>
            </li>
          </ul>
        </div>

         

          <div class="watch">
  <h3>Смотреть онлайн:</h3>
  <div class="buttons">
    <button v-if="movie.videoUrl480" class="btn quality-480" @click="play(movie.videoUrl480)">480p</button>
    <button v-if="movie.videoUrl720" class="btn quality-720" @click="play(movie.videoUrl720)">720p</button>
    <button v-if="movie.videoUrl1080" class="btn quality-1080" @click="play(movie.videoUrl1080)">1080p</button>
  </div>

  <div v-if="currentVideo && isYouTubeUrl(currentVideo)" class="player">
    <iframe
      class="iframe-player"
      :src="`https://www.youtube.com/embed/${extractYouTubeId(currentVideo)}`"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</div>

        

        <div class="comments">
          <h3>Комментарии</h3>
          <div v-if="averageRating !== null" class="avg-rating">
            Средний рейтинг: {{ averageRating.toFixed(1) }}
          </div>

          <div v-if="comments.length" class="comment-list">
            <div v-for="c in comments" :key="c.id" class="comment-card">
              <p class="author">Пользователь {{ c.userId }}</p>
              <p class="text">{{ c.commentText }}</p>
              <p class="rating">Оценка: {{ c.rating }}</p>
              <p class="date">Дата: {{ c.commentDate }}</p>
            </div>
          </div>
          <div v-else class="no-comments">Комментариев пока нет</div>

          <div class="add-comment">
  <h4>Добавить комментарий</h4>
  <textarea v-model="newComment" placeholder="Ваш комментарий"></textarea>

  <!-- Звёздный рейтинг -->
  <div class="star-rating">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{ active: newRating !== null && star <= newRating }"
      @click="newRating = star"
    >★</span>
  </div>

  <button @click="addComment(movie.id)">Отправить</button>
</div>
</div>

          <!-- новые рекомендации -->
        <div class="recommendations">
          <h3>На основе избранного</h3>
          <div v-if="recommendedByFavorites.length" class="similar-grid">
            <div v-for="m in recommendedByFavorites" :key="m.id" class="similar-card" @click="openMovie(m.id)">
              <img :src="m.posterUrl" alt="Poster" class="poster" />
              <div class="title">{{ m.title }}</div>
            </div>
          </div>
          <div v-else class="no-similar">Нет рекомендаций</div>

          <h3>На основе истории просмотров</h3>
          <div v-if="recommendedByHistory.length" class="similar-grid">
            <div v-for="m in recommendedByHistory" :key="m.id" class="similar-card" @click="openMovie(m.id)">
              <img :src="m.posterUrl" alt="Poster" class="poster" />
              <div class="title">{{ m.title }}</div>
            </div>
          </div>
          <div v-else class="no-similar">Нет рекомендаций</div>

          <h3>Новые фильмы в любимых жанрах</h3>
          <div v-if="newInFavoriteGenres.length" class="similar-grid">
            <div v-for="m in newInFavoriteGenres" :key="m.id" class="similar-card" @click="openMovie(m.id)">
              <img :src="m.posterUrl" alt="Poster" class="poster" />
              <div class="title">{{ m.title }}</div>
            </div>
          </div>
          <div v-else class="no-similar">Нет рекомендаций</div>
        </div>

        <!-- старый блок похожих фильмов -->
        <div class="similar">
          <h3>Похожие фильмы</h3>
          <div v-if="similarMovies.length" class="similar-grid">
            <div v-for="s in similarMovies" :key="s.id" class="similar-card" @click="openMovie(s.id)">
              <img :src="s.posterUrl" alt="Poster" class="poster" />
              <div class="title">{{ s.title }}</div>
            </div>
          </div>
          <div v-else class="no-similar">Нет рекомендаций</div>
        </div>

      </div>
    </div>
  </div>
</template>


<style scoped>
.details-wrap {
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
.details-card {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
}
.poster {
  width: 300px;
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}
.info {
  flex: 1;
  min-width: 280px;
}
h1 {
  margin-top: 0;
  font-size: 2rem;
}
.desc {
  margin: 1rem 0;
  opacity: 0.9;
}
.meta p {
  margin: .4rem 0;
}
.genres {
  margin-top: 1rem;
}
.tag {
  display: inline-block;
  margin: .3rem .4rem .3rem 0;
  padding: .3rem .6rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  font-size: .85rem;
}
.actors {
  margin-top: 1.5rem;
}
.actors ul {
  padding-left: 1rem;
}
.actors li {
  margin-bottom: .4rem;
}
.watch {
  margin-top: 2rem;
}
.buttons {
  display: flex;
  gap: 1rem;
}
.btn {
  padding: .7rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #041024;
}
.quality-480 {
  background: linear-gradient(90deg, #22d3ee, #0ea5e9);
}
.quality-720 {
  background: linear-gradient(90deg, #34d399, #10b981);
}
.quality-1080 {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}
.player {
  margin-top: 2rem;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

.iframe-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.similar {
  margin-top: 3rem;
  width: 100%;
}
.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.2rem;
}
.similar-card {
  cursor: pointer;
  background: #0f172a;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  transition: transform 0.2s, box-shadow 0.2s;
}
.similar-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}
.similar-card .poster {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.similar-card .title {
  padding: .6rem;
  text-align: center;
  font-weight: 600;
  font-size: .95rem;
  color: #e6eef8;
  background-color: #1e293b;
}
.no-similar {
  margin-top: 1rem;
  font-size: 1rem;
  opacity: 0.8;
}

.comments {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.4);
}

.comments h3 {
  margin-top: 0;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #facc15; /* золотистый акцент */
}

.avg-rating {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #34d399; /* зелёный акцент */
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.comment-card {
  background: #1e293b;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.5);
}

.comment-card .author {
  font-weight: 600;
  color: #60a5fa; /* голубой акцент */
  margin-bottom: 0.4rem;
}

.comment-card .text {
  margin: 0.4rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.comment-card .rating {
  font-size: 0.9rem;
  color: #f59e0b; /* оранжевый акцент */
}

.comment-card .date {
  font-size: 0.8rem;
  opacity: 0.7;
}

.no-comments {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.add-comment {
  margin-top: 2rem;
}

.add-comment h4 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #93c5fd;
}

.add-comment textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  margin-bottom: 1rem;
  background: rgba(255,255,255,0.08);
  color: #e6eef8;
  resize: vertical;
}

.add-comment input {
  width: 120px;
  padding: 0.6rem;
  border-radius: 8px;
  border: none;
  margin-bottom: 1rem;
  background: rgba(255,255,255,0.08);
  color: #e6eef8;
}

.add-comment button {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(90deg, #34d399, #10b981);
  color: #041024;
  transition: background 0.2s;
}

.add-comment button:hover {
  background: linear-gradient(90deg, #10b981, #34d399);
}


.star-rating {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.star {
  color: #64748b; /* серые звёзды */
  transition: color 0.2s, transform 0.1s;
}

.star:hover {
  transform: scale(1.1);
  color: #facc15; /* подсветка при наведении */
}

.star.active {
  color: #facc15; /* жёлтые выбранные */
}

.favorite {
  margin: 0.5rem 0 1rem;
}
.fav-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #facc15; /* жёлтая звезда */
  font-weight: bold;
}
.fav-btn:hover {
  text-decoration: underline;
}

</style>

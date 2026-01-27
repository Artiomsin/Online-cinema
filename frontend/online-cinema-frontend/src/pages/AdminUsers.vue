<script setup lang="ts">
import { ref, onMounted } from 'vue'

type User = {
  id?: number
  login: string
  password?: string
  firstName: string
  lastName: string
  email: string
}

type Movie = {
  id?: number
  title: string
  releaseYear: number | string
  description?: string
  originalLanguage: string
  productionCountry: string
  ageRating: number | string
  duration: number | string
  subscriptionLevel: string
  videoUrl480?: string
  videoUrl720?: string
  videoUrl1080?: string
  posterUrl?: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref<User>({ login: '', password: '', firstName: '', lastName: '', email: '' })
const editingId = ref<number | null>(null)

// Movies
const movies = ref<Movie[]>([])
const loadingMovies = ref(false)
const movieForm = ref<Movie>({ title: '', releaseYear: '', description: '', originalLanguage: '', productionCountry: '', ageRating: '', duration: '', subscriptionLevel: '', videoUrl480: '', videoUrl720: '', videoUrl1080: '', posterUrl: '' })
const editingMovieId = ref<number | null>(null)

const API = 'http://localhost:3000'

async function loadUsers() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API}/users`, { credentials: 'include' })
    if (!res.ok) throw new Error('Не удалось загрузить пользователей')
    users.value = await res.json()
  } catch (e: any) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}

async function loadMovies() {
  loadingMovies.value = true
  try {
    const res = await fetch(`${API}/movies`, { credentials: 'include' })
    if (!res.ok) throw new Error('Не удалось загрузить фильмы')
    movies.value = await res.json()
  } catch (e: any) {
    // reuse error var
    error.value = e.message || String(e)
  } finally {
    loadingMovies.value = false
  }
}

function resetForm() {
  form.value = { login: '', password: '', firstName: '', lastName: '', email: '' }
  editingId.value = null
}

function resetMovieForm() {
  movieForm.value = { title: '', releaseYear: '', description: '', originalLanguage: '', productionCountry: '', ageRating: '', duration: '', subscriptionLevel: '', videoUrl480: '', videoUrl720: '', videoUrl1080: '', posterUrl: '' }
  editingMovieId.value = null
}

async function submit() {
  if (editingId.value) {
    // update
    const id = editingId.value
    const payload: any = { ...form.value }
    // don't send empty password when updating
    if (!payload.password) delete payload.password
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка при обновлении')
      await loadUsers()
      resetForm()
    } catch (e: any) {
      error.value = e.message || String(e)
    }
  } else {
    // create
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form.value),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Ошибка при создании')
      }
      await loadUsers()
      resetForm()
    } catch (e: any) {
      error.value = e.message || String(e)
    }
  }
}

function editUser(u: any) {
  editingId.value = u.id
  form.value = { login: u.login || '', password: '', firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '' }
}

async function removeUser(id?: number) {
  if (!id) return
  if (!confirm('Удалить пользователя?')) return
  try {
    const res = await fetch(`${API}/users/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error('Не удалось удалить')
    await loadUsers()
  } catch (e: any) {
    error.value = e.message || String(e)
  }
}

// --- Movies handlers ---
async function submitMovie() {
  const payload: any = { ...movieForm.value }
  // convert numeric fields
  payload.releaseYear = Number(payload.releaseYear)
  payload.ageRating = Number(payload.ageRating)
  payload.duration = Number(payload.duration)

  try {
    if (editingMovieId.value) {
      const res = await fetch(`${API}/movies/${editingMovieId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка при обновлении фильма')
    } else {
      const res = await fetch(`${API}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Ошибка при создании фильма')
    }
    await loadMovies()
    resetMovieForm()
  } catch (e: any) {
    error.value = e.message || String(e)
  }
}

function editMovie(m: any) {
  editingMovieId.value = m.id
  movieForm.value = {
    title: m.title || '',
    releaseYear: m.releaseYear || '',
    description: m.description || '',
    originalLanguage: m.originalLanguage || '',
    productionCountry: m.productionCountry || '',
    ageRating: m.ageRating || '',
    duration: m.duration || '',
    subscriptionLevel: m.subscriptionLevel || '',
    videoUrl480: m.videoUrl480 || '',
    videoUrl720: m.videoUrl720 || '',
    videoUrl1080: m.videoUrl1080 || '',
    posterUrl: m.posterUrl || ''
  }
}

async function removeMovie(id?: number) {
  if (!id) return
  if (!confirm('Удалить фильм?')) return
  try {
    const res = await fetch(`${API}/movies/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error('Не удалось удалить фильм')
    await loadMovies()
  } catch (e: any) {
    error.value = e.message || String(e)
  }
}

onMounted(loadUsers)
onMounted(() => { loadUsers(); loadMovies(); })
</script>

<template>
  <div class="admin-card">
    <h1>Admin: User Management</h1>

    <section class="split">
      <div class="panel form-panel">
        <h2>{{ editingId ? 'Edit User' : 'Create User' }}</h2>
        <form @submit.prevent="submit" class="form">
          <label>Login<input v-model="form.login" required /></label>
          <label>Email<input type="email" v-model="form.email" required /></label>
          <label>First name<input v-model="form.firstName" required /></label>
          <label>Last name<input v-model="form.lastName" required /></label>
          <label>Password<input v-model="form.password" :required="!editingId" type="password" placeholder="Leave empty to keep current"/></label>
          <div style="display:flex;gap:.5rem;margin-top:.6rem">
            <button class="btn" type="submit">{{ editingId ? 'Save' : 'Create' }}</button>
            <button type="button" class="btn ghost" @click="resetForm">Reset</button>
          </div>
        </form>
        <div v-if="error" class="error">{{ error }}</div>
      </div>

      <div class="panel table-panel">
        <h2>User List</h2>
        <div v-if="loading">Loading...</div>
        <div v-else class="users-table-wrap">
          <table class="users-table">
          <thead>
            <tr>
              <th class="id-col">ID</th>
              <th class="login-col">Login</th>
              <th class="email-col">Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td class="id-col">{{ u.id }}</td>
              <td class="login-col">{{ u.login }}</td>
              <td class="email-col">{{ u.email }}</td>
              <td>{{ u.firstName }}</td>
              <td>{{ u.lastName }}</td>
              <td class="actions-col actions">
                <button class="btn small" @click="editUser(u)">Edit</button>
                <button class="btn small danger" @click="removeUser(u.id)">Delete</button>
              </td>
            </tr>
          </tbody>
          </table>
        </div>
      </div>
    </section>
    
    <!-- Movies management -->
    <section class="movies-section" style="margin-top:2rem">
      <div class="admin-card" style="padding:1rem">
        <h2 style="margin-bottom:1rem">Movie Management</h2>
        <div class="split">
          <div class="panel form-panel">
            <h3>{{ editingMovieId ? 'Edit Movie' : 'Create Movie' }}</h3>
            <form @submit.prevent="submitMovie" class="form">
              <label>Title<input v-model="movieForm.title" required /></label>
              <label>Release Year<input v-model="movieForm.releaseYear" type="number" required /></label>
              <label>Duration (min)<input v-model="movieForm.duration" type="number" required /></label>
              <label>Age Rating<input v-model="movieForm.ageRating" type="number" required /></label>
              <label>Subscription Level<input v-model="movieForm.subscriptionLevel" required placeholder="free|basic|premium"/></label>
              <label>Original Language<input v-model="movieForm.originalLanguage" required /></label>
              <label>Production Country<input v-model="movieForm.productionCountry" required /></label>
              <label>Description<textarea v-model="movieForm.description" rows="4" placeholder="Short movie description"></textarea></label>
              <label>Poster URL<input v-model="movieForm.posterUrl" /></label>
              <div v-if="movieForm.posterUrl" class="poster-preview"><img :src="movieForm.posterUrl" alt="poster"/></div>
              <label>Video URL 480<input v-model="movieForm.videoUrl480" /></label>
              <label>Video URL 720<input v-model="movieForm.videoUrl720" /></label>
              <label>Video URL 1080<input v-model="movieForm.videoUrl1080" /></label>
              <div class="controls">
                <button class="btn" type="submit">{{ editingMovieId ? 'Save' : 'Create' }}</button>
                <button type="button" class="btn ghost" @click="resetMovieForm">Reset</button>
              </div>
            </form>
          </div>

          <div class="panel table-panel">
            <h3>Movie List</h3>
            <div v-if="loadingMovies">Loading...</div>
            <div v-else class="users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="id-col">ID</th>
                    <th class="title-col">Title</th>
                    <th class="year-col">Year</th>
                    <th class="duration-col">Duration</th>
                    <th class="age-col">Age</th>
                    <th class="sub-col">Subscription</th>
                    <th class="lang-col">Language</th>
                    <th class="country-col">Country</th>
                    <th class="desc-col">Description</th>
                    <th class="video-col">480</th>
                    <th class="video-col">720</th>
                    <th class="video-col">1080</th>
                    <th class="poster-col">Poster</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in movies" :key="m.id">
                    <td class="id-col">{{ m.id }}</td>
                    <td class="title-col">{{ m.title }}</td>
                    <td class="year-col">{{ m.releaseYear }}</td>
                    <td class="duration-col">{{ m.duration }}</td>
                    <td class="age-col">{{ m.ageRating }}</td>
                    <td class="sub-col">{{ m.subscriptionLevel }}</td>
                    <td class="lang-col">{{ m.originalLanguage }}</td>
                    <td class="country-col">{{ m.productionCountry }}</td>
                    <td class="desc-col"><div class="desc-cell">{{ m.description }}</div></td>
                    <td class="video-col"><a v-if="m.videoUrl480" :href="m.videoUrl480" target="_blank" rel="noreferrer">480</a></td>
                    <td class="video-col"><a v-if="m.videoUrl720" :href="m.videoUrl720" target="_blank" rel="noreferrer">720</a></td>
                    <td class="video-col"><a v-if="m.videoUrl1080" :href="m.videoUrl1080" target="_blank" rel="noreferrer">1080</a></td>
                    <td class="poster-col"> <img v-if="m.posterUrl" :src="m.posterUrl" class="small-thumb" alt="poster"/> </td>
                    <td class="actions-col actions">
                      <button class="btn small" @click="editMovie(m)">Edit</button>
                      <button class="btn small danger" @click="removeMovie(m.id)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<style scoped>
:root {
  /* local fallbacks in case global vars aren't loaded */
  --card: rgba(255,255,255,0.04);
  --glass: rgba(255,255,255,0.03);
  --muted: #9fb3d1;
  --accent1: #06b6d4;
  --accent2: #3b82f6;
  --danger: #ef4444;
  --glass-blur: 8px;
  --radius: 12px;
}

.admin-card {
  background: linear-gradient(180deg, rgba(11,22,48,0.72), rgba(7,16,35,0.6));
  border: 1px solid rgba(255,255,255,0.03);
  padding: 1.6rem;
  border-radius: calc(var(--radius) + 4px);
  box-shadow: 0 18px 60px rgba(2,6,23,0.6);
  backdrop-filter: blur(var(--glass-blur));
  color: #e6eef8;
}

.admin-card > h1 {
  margin: 0 0 1rem 0;
  font-size: 1.7rem;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.split {
  display:flex;
  gap:1.2rem;
  align-items:flex-start;
  flex-wrap:wrap;
}

.panel { flex:1; min-width:320px }

.panel h2 { margin:0 0 1rem 0; color: #dff3ff }

.form { display:flex; flex-direction:column; gap:.75rem }
.form label { display:flex; flex-direction:column; font-size:.95rem; color: var(--muted); font-weight:600 }
.form input {
  padding:.9rem 1rem;
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.02);
  color: inherit;
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .06s ease;
}
.form input::placeholder { color: rgba(255,255,255,0.28) }
.form input:focus {
  box-shadow: 0 6px 24px rgba(59,130,246,0.08), 0 4px 14px rgba(6,182,212,0.04);
  border-color: rgba(59,130,246,0.45);
  transform: translateY(-1px);
}

.controls { display:flex; gap:.8rem; margin-top:.6rem }

.users-table-wrap { overflow:auto; max-height:560px; border-radius:12px; padding-right:8px }
.form-panel { flex: 0 0 380px }
.table-panel { flex: 1 1 auto; overflow: hidden }
.users-table { width:100%; border-collapse:collapse; margin-top:.4rem; background: transparent; min-width:720px; table-layout: fixed }
.users-table th, .users-table td { overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.users-table th.actions-col, .users-table td.actions-col { width:140px }
.users-table th.id-col, .users-table td.id-col { width:64px }
.users-table th.login-col, .users-table td.login-col { width:160px }
.users-table th.email-col, .users-table td.email-col { width:260px }
.users-table th.title-col, .users-table td.title-col { width:320px }
.users-table th.sub-col, .users-table td.sub-col { width:180px }
.users-table th.year-col, .users-table td.year-col { width:110px; text-align:center }
.users-table th.duration-col, .users-table td.duration-col { width:110px; text-align:center }
.users-table th.age-col, .users-table td.age-col { width:90px; text-align:center }
.users-table th.lang-col, .users-table td.lang-col { width:120px }
.users-table th.country-col, .users-table td.country-col { width:140px }
.users-table th.desc-col, .users-table td.desc-col { width:360px }
.users-table th.video-col, .users-table td.video-col { width:72px; text-align:center }
.users-table th.poster-col, .users-table td.poster-col { width:96px; text-align:center }
.users-table { width:100%; border-collapse:collapse; margin-top:.4rem; background: transparent; min-width:1000px; table-layout: fixed }
.desc-cell { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; line-clamp: 3; overflow: hidden; text-overflow: ellipsis; white-space: normal }
.small-thumb { width:72px; height:40px; object-fit:cover; border-radius:6px; box-shadow:0 8px 20px rgba(0,0,0,0.5) }
.users-table a { color: var(--accent1); font-weight:700; font-size:0.9rem }

.form textarea { padding:.8rem 1rem; border-radius:12px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); color:inherit; resize:vertical }
.poster-preview img { max-width:100%; border-radius:8px; margin-top:.6rem; box-shadow:0 8px 30px rgba(2,6,23,0.6) }
.users-table thead th { color: var(--muted); font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; position:sticky; top:0; background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00)); }
.users-table th, .users-table td { text-align:left; padding:.8rem 1rem; border-bottom:1px solid rgba(255,255,255,0.02); font-size:0.95rem }
.users-table tbody tr { transition: background .12s ease; }
.users-table tbody tr:hover { background: linear-gradient(90deg, rgba(59,130,246,0.02), rgba(6,182,212,0.01)); }

.actions { display:flex; gap:.5rem; align-items:center }
.btn { background: linear-gradient(90deg, var(--accent1), var(--accent2)); color: #041024; border:none; padding:.6rem .9rem; border-radius:999px; cursor:pointer; font-weight:700; box-shadow: 0 6px 16px rgba(6,182,212,0.06) }
.btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.04); color: var(--muted); padding:.55rem .8rem }
.btn.small { padding:.32rem .5rem; font-size:.88rem; min-width:44px }
.btn.danger { background: linear-gradient(90deg, var(--danger), #fb923c); color: #041024 }

.pill { display:inline-flex; align-items:center; gap:.45rem; padding:.28rem .5rem; border-radius:999px }

.error { margin-top:.6rem; padding:.6rem; border-radius:10px; background: rgba(239,68,68,0.06); color: var(--danger) }

@media (max-width: 980px) {
  .panel { min-width: 100% }
  .users-table { min-width:720px }
}

</style>

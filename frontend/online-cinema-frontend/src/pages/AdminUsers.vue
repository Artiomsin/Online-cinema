<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type User = {
  id?: number;
  login: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Movie = {
  id?: number;
  title: string;
  releaseYear: number | string;
  description?: string;
  originalLanguage: string;
  productionCountry: string;
  ageRating: number | string;
  duration: number | string;
  subscriptionLevel: string;
  videoUrl480?: string;
  videoUrl720?: string;
  videoUrl1080?: string;
  posterUrl?: string;
};

type Genre = { id?: number; name: string; description?: string };

type Actor = {
  id?: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  biography?: string;
  photoUrl?: string;
};

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const form = ref<User>({
  login: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
});
const editingId = ref<number | null>(null);

const movies = ref<Movie[]>([]);
const loadingMovies = ref(false);
const movieForm = ref<Movie>({
  title: '',
  releaseYear: '',
  description: '',
  originalLanguage: '',
  productionCountry: '',
  ageRating: '',
  duration: '',
  subscriptionLevel: '',
  videoUrl480: '',
  videoUrl720: '',
  videoUrl1080: '',
  posterUrl: '',
});
const editingMovieId = ref<number | null>(null);

const genres = ref<Genre[]>([]);
const loadingGenres = ref(false);
const genreForm = ref<Genre>({ name: '', description: '' });
const editingGenreId = ref<number | null>(null);

const actors = ref<Actor[]>([]);
const loadingActors = ref(false);
const actorForm = ref<Actor>({
  firstName: '',
  lastName: '',
  birthDate: '',
  biography: '',
  photoUrl: '',
});
const editingActorId = ref<number | null>(null);

const selectedMovie = ref<Movie | null>(null);
const movieGenres = ref<Genre[]>([]);
const movieActors = ref<Actor[]>([]);
const linkingGenre = ref<number | null>(null);
const linkingActor = ref<number | null>(null);

async function loadUsers() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Не удалось загрузить пользователей');
    users.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function loadGenres() {
  loadingGenres.value = true;
  try {
    const res = await fetch(`${API_BASE}/genres`, { credentials: 'include' });
    if (!res.ok) throw new Error('Не удалось загрузить жанры');
    genres.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loadingGenres.value = false;
  }
}

async function loadActors() {
  loadingActors.value = true;
  try {
    const res = await fetch(`${API_BASE}/actors`, { credentials: 'include' });
    if (!res.ok) throw new Error('Не удалось загрузить актеров');
    actors.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loadingActors.value = false;
  }
}

async function loadMovies() {
  loadingMovies.value = true;
  try {
    const res = await fetch(`${API_BASE}/movies`, { credentials: 'include' });
    if (!res.ok) throw new Error('Не удалось загрузить фильмы');
    movies.value = await res.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  } finally {
    loadingMovies.value = false;
  }
}

function resetForm() {
  form.value = {
    login: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  };
  editingId.value = null;
}

function resetMovieForm() {
  movieForm.value = {
    title: '',
    releaseYear: '',
    description: '',
    originalLanguage: '',
    productionCountry: '',
    ageRating: '',
    duration: '',
    subscriptionLevel: '',
    videoUrl480: '',
    videoUrl720: '',
    videoUrl1080: '',
    posterUrl: '',
  };
  editingMovieId.value = null;
}

function resetGenreForm() {
  genreForm.value = { name: '', description: '' };
  editingGenreId.value = null;
}

function resetActorForm() {
  actorForm.value = {
    firstName: '',
    lastName: '',
    birthDate: '',
    biography: '',
    photoUrl: '',
  };
  editingActorId.value = null;
}

async function submit() {
  if (editingId.value) {
    const id = editingId.value;
    const payload: any = { ...form.value };
    if (!payload.password) delete payload.password;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка при обновлении');
      await loadUsers();
      resetForm();
    } catch (e: any) {
      error.value = e.message || String(e);
    }
  } else {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form.value),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Ошибка при создании');
      }
      await loadUsers();
      resetForm();
    } catch (e: any) {
      error.value = e.message || String(e);
    }
  }
}

function editUser(u: any) {
  editingId.value = u.id;
  form.value = {
    login: u.login || '',
    password: '',
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
  };
}

async function removeUser(id?: number) {
  if (!id) return;
  if (!confirm('Удалить пользователя?')) return;
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Не удалось удалить');
    await loadUsers();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function submitMovie() {
  const payload: any = { ...movieForm.value };
  payload.releaseYear = Number(payload.releaseYear);
  payload.ageRating = Number(payload.ageRating);
  payload.duration = Number(payload.duration);
  try {
    if (editingMovieId.value) {
      const res = await fetch(`${API_BASE}/movies/${editingMovieId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка при обновлении фильма');
    } else {
      const res = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Ошибка при создании фильма');
    }
    await loadMovies();
    resetMovieForm();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

function editMovie(m: any) {
  editingMovieId.value = m.id;
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
    posterUrl: m.posterUrl || '',
  };
}

async function removeMovie(id?: number) {
  if (!id) return;
  if (!confirm('Удалить фильм?')) return;
  try {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Не удалось удалить фильм');
    await loadMovies();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function submitGenre() {
  try {
    if (editingGenreId.value) {
      const res = await fetch(`${API_BASE}/genres/${editingGenreId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(genreForm.value),
      });
      if (!res.ok) throw new Error('Ошибка при обновлении жанра');
    } else {
      const res = await fetch(`${API_BASE}/genres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(genreForm.value),
      });
      if (!res.ok) throw new Error('Ошибка при создании жанра');
    }
    await loadGenres();
    resetGenreForm();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

function editGenre(g: Genre) {
  editingGenreId.value = g.id ?? null;
  genreForm.value = { name: g.name || '', description: g.description || '' };
}

async function removeGenre(id?: number) {
  if (!id) return;
  if (!confirm('Удалить жанр?')) return;
  try {
    const res = await fetch(`${API_BASE}/genres/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Не удалось удалить жанр');
    await loadGenres();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function submitActor() {
  try {
    if (editingActorId.value) {
      const res = await fetch(`${API_BASE}/actors/${editingActorId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(actorForm.value),
      });
      if (!res.ok) throw new Error('Ошибка при обновлении актера');
    } else {
      const res = await fetch(`${API_BASE}/actors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(actorForm.value),
      });
      if (!res.ok) throw new Error('Ошибка при создании актера');
    }
    await loadActors();
    resetActorForm();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

function editActor(a: Actor) {
  editingActorId.value = a.id ?? null;
  actorForm.value = {
    firstName: a.firstName || '',
    lastName: a.lastName || '',
    birthDate: a.birthDate || '',
    biography: a.biography || '',
    photoUrl: a.photoUrl || '',
  };
}

async function removeActor(id?: number) {
  if (!id) return;
  if (!confirm('Удалить актера?')) return;
  try {
    const res = await fetch(`${API_BASE}/actors/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Не удалось удалить актера');
    await loadActors();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

function openMovieLinks(m: Movie) {
  selectedMovie.value = m;
  loadMovieLinks();
}

async function loadMovieLinks() {
  if (!selectedMovie.value?.id) return;
  try {
    const [genresRes, actorsRes] = await Promise.all([
      fetch(`${API_BASE}/movies/${selectedMovie.value.id}/genres`, {
        credentials: 'include',
      }),
      fetch(`${API_BASE}/movies/${selectedMovie.value.id}/actors`, {
        credentials: 'include',
      }),
    ]);
    if (genresRes.ok) movieGenres.value = await genresRes.json();
    if (actorsRes.ok) movieActors.value = await actorsRes.json();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function addGenreToMovie(genreId: number) {
  if (!selectedMovie.value?.id) return;
  try {
    const res = await fetch(
      `${API_BASE}/genres/${selectedMovie.value.id}/${genreId}`,
      { method: 'POST', credentials: 'include' },
    );
    if (!res.ok) throw new Error('Не удалось добавить жанр');
    await loadMovieLinks();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function removeGenreFromMovie(genreId: number) {
  if (!selectedMovie.value?.id) return;
  try {
    const res = await fetch(
      `${API_BASE}/genres/${selectedMovie.value.id}/${genreId}`,
      { method: 'DELETE', credentials: 'include' },
    );
    if (!res.ok) throw new Error('Не удалось удалить жанр');
    await loadMovieLinks();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function addActorToMovie(actorId: number) {
  if (!selectedMovie.value?.id) return;
  try {
    const res = await fetch(
      `${API_BASE}/actors/link/${selectedMovie.value.id}/${actorId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ characterName: '' }),
      },
    );
    if (!res.ok) throw new Error('Не удалось добавить актера');
    await loadMovieLinks();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

async function removeActorFromMovie(actorId: number) {
  if (!selectedMovie.value?.id) return;
  try {
    const res = await fetch(
      `${API_BASE}/actors/link/${selectedMovie.value.id}/${actorId}`,
      { method: 'DELETE', credentials: 'include' },
    );
    if (!res.ok) throw new Error('Не удалось удалить актера');
    await loadMovieLinks();
  } catch (e: any) {
    error.value = e.message || String(e);
  }
}

function closeMovieLinks() {
  selectedMovie.value = null;
  movieGenres.value = [];
  movieActors.value = [];
}

onMounted(() => {
  loadUsers();
  loadMovies();
  loadGenres();
  loadActors();
});
</script>

<template>
  <div class="admin-card">
    <h1>Admin: User Management</h1>

    <section class="split">
      <div class="panel form-panel">
        <h2>{{ editingId ? 'Edit User' : 'Create User' }}</h2>
        <form @submit.prevent="submit" class="form">
          <label>Login<input v-model="form.login" required /></label>
          <label
            >Email<input type="email" v-model="form.email" required
          /></label>
          <label>First name<input v-model="form.firstName" required /></label>
          <label>Last name<input v-model="form.lastName" required /></label>
          <label
            >Password<input
              v-model="form.password"
              :required="!editingId"
              type="password"
              placeholder="Leave empty to keep current"
          /></label>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.6rem">
            <button class="btn" type="submit">
              {{ editingId ? 'Save' : 'Create' }}
            </button>
            <button type="button" class="btn ghost" @click="resetForm">
              Reset
            </button>
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
                  <button class="btn small danger" @click="removeUser(u.id)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Movies management -->
    <section class="movies-section" style="margin-top: 2rem">
      <div class="admin-card" style="padding: 1rem">
        <h2 style="margin-bottom: 1rem">Movie Management</h2>
        <div class="split">
          <div class="panel form-panel">
            <h3>{{ editingMovieId ? 'Edit Movie' : 'Create Movie' }}</h3>
            <form @submit.prevent="submitMovie" class="form">
              <label>Title<input v-model="movieForm.title" required /></label>
              <label
                >Release Year<input
                  v-model="movieForm.releaseYear"
                  type="number"
                  required
              /></label>
              <label
                >Duration (min)<input
                  v-model="movieForm.duration"
                  type="number"
                  required
              /></label>
              <label
                >Age Rating<input
                  v-model="movieForm.ageRating"
                  type="number"
                  required
              /></label>
              <label
                >Subscription Level<input
                  v-model="movieForm.subscriptionLevel"
                  required
                  placeholder="free|basic|premium"
              /></label>
              <label
                >Original Language<input
                  v-model="movieForm.originalLanguage"
                  required
              /></label>
              <label
                >Production Country<input
                  v-model="movieForm.productionCountry"
                  required
              /></label>
              <label
                >Description<textarea
                  v-model="movieForm.description"
                  rows="4"
                  placeholder="Short movie description"
                ></textarea>
              </label>
              <label>Poster URL<input v-model="movieForm.posterUrl" /></label>
              <div v-if="movieForm.posterUrl" class="poster-preview">
                <img :src="movieForm.posterUrl" alt="poster" />
              </div>
              <label
                >Video URL 480<input v-model="movieForm.videoUrl480"
              /></label>
              <label
                >Video URL 720<input v-model="movieForm.videoUrl720"
              /></label>
              <label
                >Video URL 1080<input v-model="movieForm.videoUrl1080"
              /></label>
              <div class="controls">
                <button class="btn" type="submit">
                  {{ editingMovieId ? 'Save' : 'Create' }}
                </button>
                <button type="button" class="btn ghost" @click="resetMovieForm">
                  Reset
                </button>
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
                    <td class="desc-col">
                      <div class="desc-cell">{{ m.description }}</div>
                    </td>
                    <td class="video-col">
                      <a
                        v-if="m.videoUrl480"
                        :href="m.videoUrl480"
                        target="_blank"
                        rel="noreferrer"
                        >480</a
                      >
                    </td>
                    <td class="video-col">
                      <a
                        v-if="m.videoUrl720"
                        :href="m.videoUrl720"
                        target="_blank"
                        rel="noreferrer"
                        >720</a
                      >
                    </td>
                    <td class="video-col">
                      <a
                        v-if="m.videoUrl1080"
                        :href="m.videoUrl1080"
                        target="_blank"
                        rel="noreferrer"
                        >1080</a
                      >
                    </td>
                    <td class="poster-col">
                      <img
                        v-if="m.posterUrl"
                        :src="m.posterUrl"
                        class="small-thumb"
                        alt="poster"
                      />
                    </td>
                    <td class="actions-col actions">
                      <button class="btn small" @click="openMovieLinks(m)">
                        Link
                      </button>
                      <button class="btn small" @click="editMovie(m)">
                        Edit
                      </button>
                      <button
                        class="btn small danger"
                        @click="removeMovie(m.id)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Movie Links -->
    <section
      v-if="selectedMovie"
      class="movies-section"
      style="margin-top: 2rem"
    >
      <div class="admin-card" style="padding: 1rem">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          "
        >
          <h2 style="margin: 0">Link: {{ selectedMovie.title }}</h2>
          <button class="btn small" @click="closeMovieLinks">Close</button>
        </div>
        <div class="split">
          <div class="panel">
            <h3>Genres</h3>
            <div
              style="
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
              "
            >
              <select
                v-model="linkingGenre"
                style="
                  padding: 0.5rem;
                  border-radius: 8px;
                  background: rgba(255, 255, 255, 0.02);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  color: inherit;
                "
              >
                <option :value="null">Select genre...</option>
                <option v-for="g in genres" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
              <button
                class="btn small"
                @click="addGenreToMovie(linkingGenre!)"
                :disabled="!linkingGenre"
              >
                Add
              </button>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              <span v-for="g in movieGenres" :key="g.id" class="pill">
                {{ g.name }}
                <button class="btn-icon" @click="removeGenreFromMovie(g.id!)">
                  ×
                </button>
              </span>
              <span v-if="movieGenres.length === 0" style="color: var(--muted)"
                >No genres linked</span
              >
            </div>
          </div>
          <div class="panel">
            <h3>Actors</h3>
            <div
              style="
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
              "
            >
              <select
                v-model="linkingActor"
                style="
                  padding: 0.5rem;
                  border-radius: 8px;
                  background: rgba(255, 255, 255, 0.02);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  color: inherit;
                "
              >
                <option :value="null">Select actor...</option>
                <option v-for="a in actors" :key="a.id" :value="a.id">
                  {{ a.firstName }} {{ a.lastName }}
                </option>
              </select>
              <button
                class="btn small"
                @click="addActorToMovie(linkingActor!)"
                :disabled="!linkingActor"
              >
                Add
              </button>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
              <span v-for="a in movieActors" :key="a.id" class="pill">
                {{ a.firstName }} {{ a.lastName }}
                <button class="btn-icon" @click="removeActorFromMovie(a.id!)">
                  ×
                </button>
              </span>
              <span v-if="movieActors.length === 0" style="color: var(--muted)"
                >No actors linked</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Genre management -->
    <section class="movies-section" style="margin-top: 2rem">
      <div class="admin-card" style="padding: 1rem">
        <h2 style="margin-bottom: 1rem">Genre Management</h2>
        <div class="split">
          <div class="panel form-panel">
            <h3>{{ editingGenreId ? 'Edit Genre' : 'Create Genre' }}</h3>
            <form @submit.prevent="submitGenre" class="form">
              <label>Name<input v-model="genreForm.name" required /></label>
              <label
                >Description<textarea
                  v-model="genreForm.description"
                  rows="4"
                  placeholder="Genre description"
                ></textarea>
              </label>
              <div class="controls">
                <button class="btn" type="submit">
                  {{ editingGenreId ? 'Save' : 'Create' }}
                </button>
                <button type="button" class="btn ghost" @click="resetGenreForm">
                  Reset
                </button>
              </div>
            </form>
          </div>
          <div class="panel table-panel">
            <h3>Genre List</h3>
            <div v-if="loadingGenres">Loading...</div>
            <div v-else class="users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="id-col">ID</th>
                    <th class="name-col">Name</th>
                    <th class="desc-col">Description</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="g in genres" :key="g.id">
                    <td class="id-col">{{ g.id }}</td>
                    <td class="name-col">{{ g.name }}</td>
                    <td class="desc-col">
                      <div class="desc-cell">{{ g.description }}</div>
                    </td>
                    <td class="actions-col actions">
                      <button class="btn small" @click="editGenre(g)">
                        Edit
                      </button>
                      <button
                        class="btn small danger"
                        @click="removeGenre(g.id)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Actor management -->
    <section class="movies-section" style="margin-top: 2rem">
      <div class="admin-card" style="padding: 1rem">
        <h2 style="margin-bottom: 1rem">Actor Management</h2>
        <div class="split">
          <div class="panel form-panel">
            <h3>{{ editingActorId ? 'Edit Actor' : 'Create Actor' }}</h3>
            <form @submit.prevent="submitActor" class="form">
              <label
                >First Name<input v-model="actorForm.firstName" required
              /></label>
              <label
                >Last Name<input v-model="actorForm.lastName" required
              /></label>
              <label
                >Birth Date<input v-model="actorForm.birthDate" type="date"
              /></label>
              <label>Photo URL<input v-model="actorForm.photoUrl" /></label>
              <label
                >Biography<textarea
                  v-model="actorForm.biography"
                  rows="4"
                  placeholder="Actor biography"
                ></textarea>
              </label>
              <div class="controls">
                <button class="btn" type="submit">
                  {{ editingActorId ? 'Save' : 'Create' }}
                </button>
                <button type="button" class="btn ghost" @click="resetActorForm">
                  Reset
                </button>
              </div>
            </form>
          </div>
          <div class="panel table-panel">
            <h3>Actor List</h3>
            <div v-if="loadingActors">Loading...</div>
            <div v-else class="users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th class="id-col">ID</th>
                    <th class="name-col">Name</th>
                    <th class="date-col">Birth Date</th>
                    <th class="photo-col">Photo</th>
                    <th class="bio-col">Biography</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in actors" :key="a.id">
                    <td class="id-col">{{ a.id }}</td>
                    <td class="name-col">{{ a.firstName }} {{ a.lastName }}</td>
                    <td class="date-col">{{ a.birthDate }}</td>
                    <td class="photo-col">
                      <img
                        v-if="a.photoUrl"
                        :src="a.photoUrl"
                        class="small-thumb"
                        alt="photo"
                      />
                    </td>
                    <td class="bio-col">
                      <div class="desc-cell">{{ a.biography }}</div>
                    </td>
                    <td class="actions-col actions">
                      <button class="btn small" @click="editActor(a)">
                        Edit
                      </button>
                      <button
                        class="btn small danger"
                        @click="removeActor(a.id)"
                      >
                        Delete
                      </button>
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
  --card: rgba(255, 255, 255, 0.04);
  --glass: rgba(255, 255, 255, 0.03);
  --muted: #9fb3d1;
  --accent1: #06b6d4;
  --accent2: #3b82f6;
  --danger: #ef4444;
  --glass-blur: 8px;
  --radius: 12px;
}

.admin-card {
  background: linear-gradient(
    180deg,
    rgba(11, 22, 48, 0.72),
    rgba(7, 16, 35, 0.6)
  );
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 1.6rem;
  border-radius: calc(var(--radius) + 4px);
  box-shadow: 0 18px 60px rgba(2, 6, 23, 0.6);
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
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.panel {
  flex: 1;
  min-width: 320px;
}

.panel h2 {
  margin: 0 0 1rem 0;
  color: #dff3ff;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.form label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  color: var(--muted);
  font-weight: 600;
}
.form input {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
  color: inherit;
  outline: none;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.06s ease;
}
.form input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}
.form input:focus {
  box-shadow:
    0 6px 24px rgba(59, 130, 246, 0.08),
    0 4px 14px rgba(6, 182, 212, 0.04);
  border-color: rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.controls {
  display: flex;
  gap: 0.8rem;
  margin-top: 0.6rem;
}

.users-table-wrap {
  overflow: auto;
  max-height: 560px;
  border-radius: 12px;
  padding-right: 8px;
}
.form-panel {
  flex: 0 0 380px;
}
.table-panel {
  flex: 1 1 auto;
  overflow: hidden;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.4rem;
  background: transparent;
  min-width: 720px;
  table-layout: fixed;
}
.users-table th,
.users-table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.users-table th.actions-col,
.users-table td.actions-col {
  width: 140px;
}
.users-table th.id-col,
.users-table td.id-col {
  width: 64px;
}
.users-table th.login-col,
.users-table td.login-col {
  width: 160px;
}
.users-table th.email-col,
.users-table td.email-col {
  width: 260px;
}
.users-table th.title-col,
.users-table td.title-col {
  width: 320px;
}
.users-table th.sub-col,
.users-table td.sub-col {
  width: 180px;
}
.users-table th.year-col,
.users-table td.year-col {
  width: 110px;
  text-align: center;
}
.users-table th.duration-col,
.users-table td.duration-col {
  width: 110px;
  text-align: center;
}
.users-table th.age-col,
.users-table td.age-col {
  width: 90px;
  text-align: center;
}
.users-table th.lang-col,
.users-table td.lang-col {
  width: 120px;
}
.users-table th.country-col,
.users-table td.country-col {
  width: 140px;
}
.users-table th.desc-col,
.users-table td.desc-col {
  width: 360px;
}
.users-table th.video-col,
.users-table td.video-col {
  width: 72px;
  text-align: center;
}
.users-table th.poster-col,
.users-table td.poster-col {
  width: 96px;
  text-align: center;
}
.users-table th.name-col,
.users-table td.name-col {
  width: 200px;
}
.users-table th.date-col,
.users-table td.date-col {
  width: 120px;
}
.users-table th.photo-col,
.users-table td.photo-col {
  width: 96px;
  text-align: center;
}
.users-table th.bio-col,
.users-table td.bio-col {
  width: 300px;
}
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.4rem;
  background: transparent;
  min-width: 1000px;
  table-layout: fixed;
}
.desc-cell {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
.small-thumb {
  width: 72px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}
.users-table a {
  color: var(--accent1);
  font-weight: 700;
  font-size: 0.9rem;
}

.form textarea {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
  color: inherit;
  resize: vertical;
}
.poster-preview img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 0.6rem;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.6);
}
.users-table thead th {
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  position: sticky;
  top: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.01),
    rgba(255, 255, 255, 0)
  );
}
.users-table th,
.users-table td {
  text-align: left;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  font-size: 0.95rem;
}
.users-table tbody tr {
  transition: background 0.12s ease;
}
.users-table tbody tr:hover {
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.02),
    rgba(6, 182, 212, 0.01)
  );
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.btn {
  background: linear-gradient(90deg, var(--accent1), var(--accent2));
  color: #041024;
  border: none;
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.06);
}
.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--muted);
  padding: 0.55rem 0.8rem;
}
.btn.small {
  padding: 0.32rem 0.5rem;
  font-size: 0.88rem;
  min-width: 44px;
}
.btn.danger {
  background: linear-gradient(90deg, var(--danger), #fb923c);
  color: #041024;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.2);
}
.btn-icon {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.2rem;
  opacity: 0.7;
}
.btn-icon:hover {
  opacity: 1;
}

.error {
  margin-top: 0.6rem;
  padding: 0.6rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  color: var(--danger);
}

@media (max-width: 980px) {
  .panel {
    min-width: 100%;
  }
  .users-table {
    min-width: 720px;
  }
}
</style>

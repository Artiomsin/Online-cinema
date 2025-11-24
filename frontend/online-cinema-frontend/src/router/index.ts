import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Catalog from '../pages/Catalog.vue'
import MovieDetails from '../pages/MovieDetails.vue'
import ActorDetails from '../pages/ActorDetails.vue'
import Subscriptions from '../pages/Subscriptions.vue'
import Favorites from '../pages/Favorites.vue'
import AdminUsers from '../pages/AdminUsers.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/catalog', name: 'Catalog', component: Catalog },
  { path: '/movies/:id', name: 'MovieDetails', component: MovieDetails },
  { path: '/actors/:id', name: 'ActorDetails', component: ActorDetails },
  { path: '/subscriptions', name: 'Subscriptions', component: Subscriptions },
  { path: '/favorites', name: 'Favorites', component: Favorites },
  { path: '/admin', name: 'Admin', component: AdminUsers },
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

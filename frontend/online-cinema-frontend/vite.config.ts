import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/auth': { target, changeOrigin: true },
        '/users': { target, changeOrigin: true },
        '/movies': { target, changeOrigin: true },
        '/genres': { target, changeOrigin: true },
        '/actors': { target, changeOrigin: true },
        '/favorites': { target, changeOrigin: true },
        '/comments': { target, changeOrigin: true },
        '/views': { target, changeOrigin: true },
        '/subscriptions': { target, changeOrigin: true },
        '/recommendations': { target, changeOrigin: true },
        '/logs': { target, changeOrigin: true },
      }
    }
  }
})
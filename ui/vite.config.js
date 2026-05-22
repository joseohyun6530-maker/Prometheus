import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devApiProxy =
  process.env.VITE_DEV_API_PROXY || 'https://prometheus-2qjs.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: devApiProxy,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

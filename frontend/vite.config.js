import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Proxy para redirigir /api/* al backend Spring Boot
    // Esto evita problemas de CORS durante el desarrollo
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // No reescribimos la ruta para que /api/productos
        // vaya a http://localhost:8080/api/productos
      }
    }
  }
})

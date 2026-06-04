import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置：仓库路径 /g003-ultrasound-ris/
  base: '/g003-ultrasound-ris/',
  server: { host: true, port: 5193 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
})

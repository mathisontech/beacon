import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'shared_util/public',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared_util'),
      '@pages': path.resolve(__dirname, './pages')
    }
  }
})
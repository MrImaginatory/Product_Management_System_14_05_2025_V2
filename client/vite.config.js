import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/project/',
    build: {
    outDir: 'dist', // default, but make sure it exists or update if changed
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds straight into the website folder so it deploys with cindyzhu.com.au
export default defineConfig({
  plugins: [react()],
  base: '/trip-palette/',
  build: {
    outDir: '../trip-palette',
    emptyOutDir: true
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('react-router-dom')) {
            return 'router'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }

          if (id.includes('/react/') || id.includes('react-dom')) {
            return 'react'
          }

          if (id.includes('@supabase/supabase-js')) {
            return 'platform'
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          return 'vendor'
        },
      },
    },
  },
})

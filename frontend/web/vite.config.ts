/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ui': path.resolve(__dirname, './src/components/ui'),
      '@/shared': path.resolve(__dirname, './src/components/shared'),
      '@/layout': path.resolve(__dirname, './src/components/layout'),
      '@/feedback': path.resolve(__dirname, './src/components/feedback'),
      '@/motion': path.resolve(__dirname, './src/components/motion'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@hireflow/types': path.resolve(__dirname, '../../packages/types/src'),
      '@hireflow/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  build: {
    // Raise the warning threshold — our vendor chunk is expected to be larger
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting — separates stable vendor code from app code
         * so users don't re-download heavy libraries when only app code changes.
         *
         * Strategy:
         *  - react-vendor:   React core + Router (loaded on every page)
         *  - ui-vendor:      Framer Motion + Radix (visual/interaction layer)
         *  - query-vendor:   TanStack Query (data layer)
         *  - form-vendor:    React Hook Form + Zod + validators
         *  - App code:       Auto-split by route lazy() chunks
         */
        manualChunks: (id) => {
          // React core — loads first, cached longest
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }

          // Router
          if (id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }

          // Animation / UI primitives
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor'
          }

          // Data / Query
          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor'
          }

          // Form handling
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules/@hookform')
          ) {
            return 'form-vendor'
          }

          // Icons — large but static
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor'
          }

          // Zustand state management
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor'
          }
        },
      },
    },
  },
})

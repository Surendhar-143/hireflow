import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})

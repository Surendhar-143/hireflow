import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hireflow/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@hireflow/schemas': path.resolve(__dirname, '../../packages/schemas/src/index.ts'),
      '@hireflow/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
    },
  },
})

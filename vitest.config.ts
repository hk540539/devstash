import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: [
      'src/lib/**/*.test.ts',
      'src/actions/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/actions/**/*.ts'],
      exclude: ['src/lib/prisma.ts', 'src/lib/email.ts'],
    },
  },
})

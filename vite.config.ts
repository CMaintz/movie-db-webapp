/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase':     ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query':        ['@tanstack/react-query'],
        },
      },
    },
  },
  test: {
    // Default to node: jsdom costs ~5s per file to boot. Files that genuinely
    // need a DOM opt in with a `@vitest-environment jsdom` docblock.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Entry points and pure type modules carry no logic worth covering.
      exclude: [
        'src/main.tsx',
        'src/types.ts',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
      ],
      // A ratchet, not a target. These are today's real numbers rounded down.
      // The rule is that they only ever go up — raise them when you add tests,
      // never lower them to make a build pass.
      thresholds: {
        statements: 3.5,
        branches: 4,
        functions: 4,
        lines: 3.4,
      },
    },
  },
})

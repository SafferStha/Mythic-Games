import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: {
    environment:  'jsdom',
    globals:      true,
    setupFiles:   ['./src/test/setup.js'],
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'lcov'],
      include:   ['src/**/*.{js,jsx}'],
      exclude:   ['src/test/**', 'src/main.jsx', 'src/data/**'],
    },
    css: false,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app works on GitHub Pages project sites,
// other static hosts, and when opened straight from the filesystem.
export default defineConfig({
  plugins: [react()],
  base: './',
})

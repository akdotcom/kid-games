import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from https://<user>.github.io/kid-games/
// so all assets must be referenced under the /kid-games/ base path.
export default defineConfig({
  base: '/kid-games/',
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' //  Add this import

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true, 
  },
  plugins: [
    react(),
    tailwindcss(), //  Add it to the plugins array
  ],
})
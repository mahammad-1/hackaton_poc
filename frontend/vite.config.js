import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite : active le plugin React (JSX transform, Fast Refresh)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port de dev local
  },
})

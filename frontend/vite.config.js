import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@mui/utils': '@mui/utils/esm',
    },
  },
  optimizeDeps: {
      include: ['@mui/utils'],
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
    },
  },
})
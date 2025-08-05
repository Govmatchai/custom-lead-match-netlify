import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.devinapps.com',
      'contractor-lead-generator-tunnel-hw6gq3sq.devinapps.com'
    ]
  }
})

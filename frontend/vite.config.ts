import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')
  
    return {
      plugins: [react()],
      server: {
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
      // Make sure environment variables are properly replaced
      define: {
        'process.env': {},
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('@clerk')) {
                return 'clerk';
              }
              if (id.includes('@zoom') || id.includes('@daily-co') || id.includes('simple-peer')) {
                return 'video-sdk';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                return 'charts';
              }
              if (id.includes('jspdf') || id.includes('html2pdf.js') || id.includes('html2canvas')) {
                return 'export-utils';
              }
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 800,
      },
    }
})